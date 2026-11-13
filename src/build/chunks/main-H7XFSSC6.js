import {
  config,
  loadEthers,
  wallet
} from "./chunk-MGKXGFKW.js";

// src/vendor/decent-head/2.0.0/js/ipfs-host.js
var IPFS_CAPABILITIES = Object.freeze({
  backup: "App backups",
  replication: "Public community pins",
  rewards: "Pinning reward participation"
});
var STATES = ["unavailable", "idle", "pending", "ready", "error"];
var text = (value) => typeof value === "string" && value.trim().length > 0;
function validateIPFSHost(adapter) {
  if (!adapter || adapter.version !== 1 || !text(adapter.label) || typeof adapter.getStatus !== "function" || !adapter.capabilities || typeof adapter.capabilities !== "object" || Array.isArray(adapter.capabilities)) {
    throw new Error("Configure a version 1 IPFS host adapter with a label, getStatus and capabilities.");
  }
  for (const [key, capability] of Object.entries(adapter.capabilities)) {
    if (!Object.hasOwn(IPFS_CAPABILITIES, key) || !capability || typeof capability.open !== "function") {
      throw new Error(`Invalid IPFS host capability: ${key}`);
    }
  }
  return adapter;
}
async function readIPFSHostStatus(adapter) {
  validateIPFSHost(adapter);
  const status = await adapter.getStatus();
  if (!status || typeof status !== "object" || Array.isArray(status)) {
    throw new Error("IPFS host status must be an object.");
  }
  const result = {};
  for (const key of Object.keys(IPFS_CAPABILITIES)) {
    if (!Object.hasOwn(adapter.capabilities, key)) {
      result[key] = { state: "unavailable", detail: "Not configured by this app." };
      continue;
    }
    const entry = status[key];
    if (!entry || !STATES.includes(entry.state) || !text(entry.detail)) {
      throw new Error(`IPFS host must report an explicit state and detail for ${key}.`);
    }
    result[key] = { state: entry.state, detail: entry.detail };
  }
  return result;
}
async function openIPFSHostControls(adapter, capability) {
  validateIPFSHost(adapter);
  if (!Object.hasOwn(IPFS_CAPABILITIES, capability) || !Object.hasOwn(adapter.capabilities, capability)) {
    throw new Error(`IPFS controls are not configured for ${capability}.`);
  }
  await adapter.capabilities[capability].open();
}

// src/vendor/decent-head/2.0.0/js/ipfs.js
function validCID(cid) {
  return typeof cid === "string" && /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{20,})$/.test(cid);
}
var IPFSSession = class {
  constructor(options = config.providers) {
    this.options = options;
    this.provider = options.default;
    this.credentials = {};
    this.adapter = null;
  }
  configure({ provider, jwt = "", apiKey = "", apiSecret = "" }) {
    if (!["pinata", "local"].includes(provider)) throw new Error("Unknown IPFS provider");
    this.provider = provider;
    this.credentials = { jwt, apiKey, apiSecret };
    window.dispatchEvent(new CustomEvent("decenthead:ipfs", { detail: this.snapshot() }));
  }
  snapshot() {
    return { provider: this.provider, adapter: this.adapter, credentialsConfigured: !!(this.credentials.jwt || this.credentials.apiKey), ucanAuth: "planned" };
  }
  headers() {
    const { jwt, apiKey, apiSecret } = this.credentials;
    if (jwt) return { Authorization: `Bearer ${jwt}` };
    if (apiKey && apiSecret) return { pinata_api_key: apiKey, pinata_secret_api_key: apiSecret };
    if (this.options.pinata.uploadUrl === "https://api.pinata.cloud/pinning/pinFileToIPFS") throw new Error("Enter your Pinata JWT or API key + secret. No shared key is bundled.");
    return {};
  }
  async request(url, options) {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(6e4) });
    if (!response.ok) throw new Error(`IPFS request failed (HTTP ${response.status})`);
    return response;
  }
  async upload(data) {
    const body = new FormData();
    body.append("file", new Blob([JSON.stringify(data)], { type: "application/json" }), "backup.json");
    let cid;
    if (this.provider === "local") {
      const response = await this.request(`${this.options.local.apiUrl.replace(/\/$/, "")}/api/v0/add?pin=true`, { method: "POST", body });
      const result = JSON.parse((await response.text()).trim().split("\n").at(-1));
      cid = result.Hash;
    } else {
      const result = await (await this.request(this.options.pinata.uploadUrl, { method: "POST", headers: this.headers(), body })).json();
      cid = result.IpfsHash;
    }
    if (!validCID(cid)) throw new Error("Provider returned an invalid CID");
    window.dispatchEvent(new CustomEvent("decenthead:ipfs", { detail: { ...this.snapshot(), action: "backup", cid } }));
    return cid;
  }
  async restore(cid) {
    if (!validCID(cid)) throw new Error("Enter a valid CID (not a URL)");
    const response = this.provider === "local" ? await this.request(`${this.options.local.apiUrl.replace(/\/$/, "")}/api/v0/cat?arg=${encodeURIComponent(cid)}`, { method: "POST" }) : await this.request(`${this.options.gateway.replace(/\/?$/, "/")}${encodeURIComponent(cid)}`, {});
    return response.json();
  }
  async pin(cid, { consent = false } = {}) {
    if (!consent) throw new Error("Community pinning requires explicit opt-in");
    if (!validCID(cid)) throw new Error("Enter a valid CID");
    if (this.provider === "local") {
      await this.request(`${this.options.local.apiUrl.replace(/\/$/, "")}/api/v0/pin/add?arg=${encodeURIComponent(cid)}`, { method: "POST" });
    } else {
      const url = this.options.pinata.pinUrl || "https://api.pinata.cloud/pinning/pinByHash";
      await this.request(url, { method: "POST", headers: { ...this.headers(), "Content-Type": "application/json" }, body: JSON.stringify({ hashToPin: cid }) });
    }
    return { cid, detail: "Pin request accepted; not proof of retention or reward eligibility." };
  }
};
var ipfs = new IPFSSession();

// src/vendor/decent-head/2.0.0/js/ui.js
var escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
function safeURL(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value, globalThis.document?.baseURI);
    return ["https:", "http:", "ipfs:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
function bindModalClose(dialog) {
  dialog.querySelector("[data-close]").onclick = () => dialog.close();
  let outside = false;
  const isOutside = (event) => {
    const box = dialog.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  };
  dialog.addEventListener("pointerdown", (event) => {
    outside = event.target === dialog && isOutside(event);
  });
  dialog.addEventListener("click", (event) => {
    if (outside && event.target === dialog && isOutside(event)) dialog.close();
    outside = false;
  });
}
function modalHeading(title, id, icon2) {
  return `<div class="modal-heading"><h2 id="${id}"><span aria-hidden="true">${icon2}</span> ${escapeHTML(title)}</h2>
    <button class="modal-close" data-close type="button" aria-label="Close" title="Close (Esc)">&#215;</button></div>`;
}
var modalStyles = `
  :host { font:14px/1.5 system-ui,sans-serif; color:var(--dh-text,#eef8ff); }
  dialog { box-sizing:border-box; width:min(560px,calc(100vw - 24px)); max-height:calc(100dvh - 32px); overflow:auto; padding:0 24px 24px; border:1px solid color-mix(in srgb,var(--dh-accent,#80edd2) 50%,transparent); border-radius:22px; background:var(--dh-bg-1,#0b1424); color:inherit; box-shadow:0 24px 100px #0009; }
  dialog::backdrop { background:#000b; backdrop-filter:blur(4px); }
  button,input,select { font:inherit; padding:9px; border-radius:7px; border:1px solid var(--dh-accent,#80edd2); color:inherit; background:var(--dh-bg-2,#192c40); box-sizing:border-box; max-width:100%; }
  button { cursor:pointer; } button:disabled { opacity:.5; cursor:default; } a { color:var(--dh-accent,#80edd2); }
  button:focus-visible,a:focus-visible,input:focus-visible { outline:3px solid var(--dh-accent,#80edd2); outline-offset:3px; }
  label { display:block; margin:16px 0; } p { overflow-wrap:anywhere; margin:12px 0; } h2 { margin:0; font-size:20px; } h3 { font-size:15px; margin:0; }
  .modal-heading { position:sticky; top:0; z-index:2; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px 0; background:var(--dh-bg-1,#0b1424); }
  .modal-heading h2 span { color:var(--dh-accent,#80edd2); margin-right:6px; }
  .modal-close { display:grid; place-items:center; flex:none; width:40px; height:40px; padding:0; border:1px solid #ffffff22; border-radius:50%; font-size:26px; background:#ffffff08; }
  .modal-close:hover { background:#ffffff18; }
  details, section { border:1px solid #ffffff18; border-radius:14px; padding:14px 16px; margin:12px 0; background:#ffffff03; }
  details > summary { cursor:pointer; font-weight:600; padding:2px 0; }
  details[open] > summary { margin-bottom:16px; }
  details details { padding:10px 12px; }
  input:not([type=checkbox]),select { display:block; width:100%; margin-top:6px; }
  input[type=checkbox] { width:18px; height:18px; vertical-align:middle; margin-right:8px; }
  ul { list-style:none; padding:0; margin:8px 0; display:flex; flex-wrap:wrap; gap:12px; }
  .quiet { color:var(--dh-muted,#bdd0e4); font-size:12px; }
  .modal-footer { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-top:20px; }
  [hidden] { display:none !important; }
  @media(max-width:600px) { dialog { padding:0 16px 20px; } }
`;

// src/vendor/decent-head/2.0.0/js/components/Header/IPFSControls.js
var base = new URL("../../../", new URL("vendor/decent-head/2.0.0/js/components/Header/IPFSControls.js", document.baseURI).href).href;
var IPFSControls = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.busy = false;
    this.operation = null;
    this.request = 0;
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        ${modalStyles}
        :host { display: block; font: 14px/1.5 system-ui, sans-serif; color: var(--dh-text, #edf9ff); }
        button { font: inherit; cursor: pointer; }
        button:focus-visible { outline: 3px solid var(--dh-accent, #73e8df); outline-offset: 3px; }
        button:disabled { cursor: not-allowed; opacity: .55; }
        #open { display: grid; place-items: center; width: 64px; height: 64px; padding: 0; border: 0; border-radius: 50%;
          background: radial-gradient(circle at 32% 28%, #ffffff2b, #ffffff08 62%), var(--dh-bg-1, #0a1220);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--dh-accent-2, #8d7cf7) 25%, transparent),
            0 0 26px color-mix(in srgb, var(--dh-accent-2, #8d7cf7) 50%, transparent), 0 10px 26px #0008;
          transition: transform .18s ease; }
        #open:hover { transform: scale(1.05); }
        #open:active { transform: scale(.97); }
        :host([data-docked]) #open { width: 100%; height: 100%; }
        #open img { width: 60%; height: 60%; object-fit: contain; filter: drop-shadow(0 2px 6px #0009); }
        dialog { box-sizing: border-box; width: min(30rem, calc(100vw - 24px)); max-height: calc(100dvh - 24px);
          overflow: auto;
          background: var(--dh-bg-1, #101b27); color: var(--dh-text, #edf9ff); overflow-wrap: anywhere; }
        dialog::backdrop { background: #000a; }
        section button, #refresh { padding: 8px 12px; }
        #message { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
        @media (max-width: 600px) { :host(:not([data-docked])) #open { width: 42px; height: 42px; } }
      </style>
      <button id="open" type="button" aria-label="Open IPFS controls" aria-haspopup="dialog">
        <img src="${escapeHTML(safeURL(config.art.ipfsIcon) || `${base}img/IPFS_Logo.png`)}" alt="" />
      </button>
      <p id="message" role="status" aria-live="polite"></p>
      <dialog aria-labelledby="title">
        ${modalHeading("IPFS data controls", "title", "\u2B21")}
        <p>Choose your storage. Back up only what you want to share.</p>
        <p id="app" class="quiet"></p>
        <details id="provider-settings"><summary><span aria-hidden="true">\u2B21</span> <span>Storage provider</span></summary>
          <label for="provider">Provider</label><select id="provider"><option value="pinata">Pinata (default)</option><option value="local">IPFS Desktop / local Kubo</option></select>
          <p class="quiet">Credentials stay in this tab. Selecting a provider uploads nothing.</p>
          <div id="pinata-settings"><label>Own Pinata JWT <input id="jwt" type="password" autocomplete="off" /></label>
          <details><summary>API key instead</summary>
            <label>API key <input id="key" type="password" autocomplete="off" /></label>
            <label>API secret <input id="secret" type="password" autocomplete="off" /></label>
          </details></div>
          <p id="local-settings" class="quiet" hidden>Use your running IPFS Desktop / Kubo node. Allow this dapp\u2019s origin in its CORS settings. See the setup guide below.</p>
          <button id="save-provider">Use provider</button>
          <p id="provider-message" role="status"></p>
        </details>
        <section id="data-controls" hidden><h3>Backup / restore</h3>
          <p class="quiet">IPFS is public. Only app-selected data is exported; encrypt private data first.</p>
          <button id="backup">Upload backup</button>
          <details><summary>Restore a backup</summary><label>Backup CID <input id="restore-cid" /></label><button id="restore">Restore backup</button></details>
          <p id="data-message" role="status"></p>
        </section>
        <details id="community-settings"><summary><span aria-hidden="true">\u25CE</span> <span>Community pinning</span></summary>
          <p class="quiet">Keep a public copy using your provider. Pinning alone does not earn rewards.</p>
          <label>Public content CID <input id="pin-cid" /></label>
          <label><input id="consent" type="checkbox" /> I opt in to publicly pin this content with my provider.</label>
          <button id="pin">Request community pin</button>
          <p id="pin-message" role="status"></p>
        </details>
        ${Object.entries(IPFS_CAPABILITIES).map(([key, label]) => `
          <section data-host-capability="${key}"><h3>${{ backup: "\u21A5", replication: "\u25CE", rewards: "\u25C8" }[key] || "\u2197"} ${label}</h3><p class="quiet" id="${key}-status">Not checked.</p>
            <button type="button" data-capability="${key}" disabled>Open ${label.toLowerCase()} controls</button>
          </section>`).join("")}
        <p id="status-error" role="alert"></p>
        <div class="modal-footer"><a href="${base}docs/ADOPTING.md#storage-controls" target="_blank" rel="noopener noreferrer">Storage setup guide \u2197</a>
        <button id="refresh" type="button">Refresh status</button></div>
      </dialog>`;
    const root = this.shadowRoot;
    this.dialog = root.querySelector("dialog");
    bindModalClose(this.dialog);
    root.getElementById("provider").value = ipfs.provider;
    const showProvider = () => {
      const local = root.getElementById("provider").value === "local";
      root.getElementById("local-settings").hidden = !local;
      root.getElementById("pinata-settings").hidden = local;
    };
    root.getElementById("provider").onchange = showProvider;
    showProvider();
    root.getElementById("save-provider").onclick = () => {
      try {
        ipfs.configure({
          provider: root.getElementById("provider").value,
          jwt: root.getElementById("jwt").value.trim(),
          apiKey: root.getElementById("key").value.trim(),
          apiSecret: root.getElementById("secret").value.trim()
        });
        for (const id of ["jwt", "key", "secret"]) root.getElementById(id).value = "";
        root.getElementById("provider-message").textContent = `${ipfs.provider} selected; not yet verified. No data uploaded.`;
      } catch (error) {
        root.getElementById("provider-message").textContent = error.message;
      }
    };
    this.action = async (id, run) => {
      const button = root.getElementById(id), message = root.getElementById(id === "pin" ? "pin-message" : "data-message");
      if (this.dataBusy) return;
      this.dataBusy = true;
      button.disabled = true;
      message.textContent = "Working\u2026";
      try {
        message.textContent = await run();
      } catch (error) {
        message.textContent = error.message;
      } finally {
        this.dataBusy = false;
        button.disabled = false;
      }
    };
    root.getElementById("backup").onclick = () => this.action("backup", async () => {
      if (!config.data?.export) throw new Error("Host export is not configured");
      if (!confirm("Upload the host-selected data to public IPFS? Encrypt private data first.")) return "Cancelled.";
      return `Backup CID: ${await ipfs.upload(await config.data.export())}`;
    });
    root.getElementById("restore").onclick = () => this.action("restore", async () => {
      if (!config.data?.import) throw new Error("Host import is not configured");
      const data = await ipfs.restore(root.getElementById("restore-cid").value.trim());
      if (!confirm("Restore this backup? The host will validate and apply it; existing data may change.")) return "Cancelled.";
      await config.data.import(data);
      return "Host restore completed.";
    });
    root.getElementById("pin").onclick = () => this.action("pin", async () => {
      const result = await ipfs.pin(root.getElementById("pin-cid").value.trim(), { consent: root.getElementById("consent").checked });
      root.getElementById("consent").checked = false;
      return result.detail;
    });
    root.getElementById("open").addEventListener("click", () => {
      this.dialog.showModal();
      this.refresh();
    });
    this.dialog.addEventListener("close", () => {
      if (this.operation === "status") {
        this.request++;
        this.setBusy(false);
        root.getElementById("message").textContent = "Status check dismissed. Open the controls to retry.";
      }
    });
    root.getElementById("refresh").addEventListener("click", () => this.refresh());
    root.querySelectorAll("[data-capability]").forEach((button) => {
      button.addEventListener("click", () => this.openControls(button.dataset.capability));
    });
  }
  openBackup() {
    this.shadowRoot.getElementById("data-controls").hidden = false;
    this.shadowRoot.getElementById("backup").disabled = !config.data?.export;
    this.shadowRoot.getElementById("restore").disabled = !config.data?.import;
    if (!this.dialog.open) this.dialog.showModal();
    this.shadowRoot.getElementById("data-controls").scrollIntoView({ block: "nearest" });
  }
  disconnectedCallback() {
    this.request++;
    this.dialog?.close();
    this.busy = false;
    this.operation = null;
  }
  setBusy(busy) {
    this.busy = busy;
    if (!busy) this.operation = null;
    this.shadowRoot.getElementById("open").disabled = busy;
    this.shadowRoot.getElementById("refresh").disabled = busy;
    this.shadowRoot.querySelectorAll("[data-capability]").forEach((button) => {
      button.disabled = true;
    });
  }
  async refresh() {
    if (this.busy) return;
    const request = ++this.request;
    this.operation = "status";
    this.setBusy(true);
    const root = this.shadowRoot;
    root.getElementById("status-error").textContent = "";
    root.getElementById("app").textContent = "";
    root.getElementById("message").textContent = "Checking app-reported IPFS status...";
    root.querySelectorAll('[id$="-status"]').forEach((el) => {
      el.textContent = "Checking...";
    });
    try {
      validateIPFSHost(this.adapter);
      root.getElementById("app").textContent = this.adapter.label;
      const status = await readIPFSHostStatus(this.adapter);
      if (request !== this.request) return;
      this.setBusy(false);
      for (const [key, entry] of Object.entries(status)) {
        root.querySelector(`[data-host-capability="${key}"]`).hidden = !Object.hasOwn(this.adapter.capabilities, key);
        root.getElementById(`${key}-status`).textContent = `${entry.state}: ${entry.detail}`;
        root.querySelector(`[data-capability="${key}"]`).disabled = entry.state === "unavailable" || entry.state === "pending";
      }
      root.getElementById("message").textContent = "Status supplied by this app; not independent storage or reward verification.";
    } catch (error) {
      if (request !== this.request) return;
      this.setBusy(false);
      root.getElementById("status-error").textContent = `IPFS status unavailable: ${error.message}`;
      root.getElementById("message").textContent = "IPFS configuration or status failed. No storage action was performed.";
      root.querySelectorAll('[id$="-status"]').forEach((el) => {
        el.textContent = "Status unavailable; see error below.";
      });
      console.warn("[DecentHead IPFS]", error);
    }
  }
  async openControls(capability) {
    if (this.busy) return;
    const request = ++this.request;
    this.operation = "controls";
    this.setBusy(true);
    this.dialog.close();
    const message = this.shadowRoot.getElementById("message");
    message.textContent = "Opening app controls...";
    try {
      await openIPFSHostControls(this.adapter, capability);
      if (request !== this.request) return;
      message.textContent = "App controls opened. This is not confirmation of a backup, pin or reward.";
    } catch (error) {
      if (request !== this.request) return;
      this.dialog.showModal();
      this.shadowRoot.getElementById("status-error").textContent = `Could not open controls: ${error.message}`;
      message.textContent = "App controls failed to open.";
      console.warn("[DecentHead IPFS]", error);
    } finally {
      if (request === this.request) this.setBusy(false);
    }
  }
};
if (!customElements.get("ipfs-controls")) customElements.define("ipfs-controls", IPFSControls);

// src/vendor/decent-head/2.0.0/js/components/Header/orbit.js
var SPARKS = [[-58, 0.68], [-18, 1.06], [22, 0.66], [64, 1.08], [128, 0.7], [182, 1.05], [236, 0.67], [292, 1.07]];
var RING = 80;
var uid = 0;
var point = ([angle, distance]) => {
  const radians = (angle - 90) * Math.PI / 180, radius = distance * 92;
  return { x: 100 + radius * Math.cos(radians), y: 100 + radius * Math.sin(radians) };
};
function constellation() {
  const points = SPARKS.map(point), lines = [];
  points.forEach((from, i) => {
    const to = points[(i + 2) % points.length];
    const length = Math.hypot(to.x - from.x, to.y - from.y).toFixed(1);
    const attrs = `x1="${from.x.toFixed(1)}" y1="${from.y.toFixed(1)}" x2="${to.x.toFixed(1)}" y2="${to.y.toFixed(1)}"`;
    lines.push(`<line class="link-base" ${attrs}/><line class="link-pulse" ${attrs} style="--len:${length};--dur:${(3 + i * 0.7).toFixed(1)}s;--delay:${(-i * 0.9).toFixed(1)}s;stroke-dasharray:6 ${length}"/>`);
  });
  return lines.join("");
}
function orbitMarkup(core) {
  const id = `dh-ring-${++uid}`;
  return `<div class="orb" part="orbit" data-state="idle">
    <svg class="orb-links" viewBox="0 0 200 200" aria-hidden="true">${constellation()}</svg>
    ${SPARKS.map(([a, d], i) => `<span class="spark" aria-hidden="true" style="--a:${a}deg;--d:${d};--i:${i}"></span>`).join("")}
    <span class="rail" aria-hidden="true"></span>
    <svg class="ring" viewBox="0 0 200 200" aria-hidden="true">
      <path id="${id}" fill="none" d="M100,100 m-${RING},0 a${RING},${RING} 0 1,1 ${RING * 2},0 a${RING},${RING} 0 1,1 -${RING * 2},0"/>
      <text><textPath href="#${id}" textLength="${(2 * Math.PI * RING - 8).toFixed(1)}" lengthAdjust="spacing"></textPath></text>
    </svg>
    <div class="core">${core}</div>
  </div>`;
}
function setRing(root, text2, state) {
  const orb = root.querySelector(".orb");
  if (!orb) return;
  orb.dataset.state = state;
  orb.querySelector("textPath").textContent = text2;
}
var orbitCSS = `
  .orb { --orb-size:var(--dh-orbit-size,132px); position:relative; width:var(--orb-size); height:var(--orb-size); flex:none; display:grid; place-items:center; }
  .orb > svg { position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none; }
  .rail { position:absolute; inset:14%; border-radius:50%; border:1px solid color-mix(in srgb,var(--dh-accent-2,#8d7cf7) 45%,transparent);
    box-shadow:0 0 26px color-mix(in srgb,var(--dh-accent-2,#8d7cf7) 28%,transparent), inset 0 0 22px color-mix(in srgb,var(--dh-accent,#7af0c6) 12%,transparent); }
  .spark { position:absolute; top:50%; left:50%; width:5%; height:5%; border-radius:30%;
    background:linear-gradient(135deg,var(--dh-accent-2,#8d7cf7),var(--dh-accent,#7af0c6)); border:1px solid #ffffff33;
    box-shadow:0 0 10px color-mix(in srgb,var(--dh-accent-2,#8d7cf7) 45%,transparent);
    transform:translate(-50%,-50%) rotate(var(--a)) translateY(calc(var(--orb-size) * -.46 * var(--d))) rotate(45deg);
    animation:dh-twinkle calc(2.4s + var(--i) * .35s) ease-in-out infinite; animation-delay:calc(var(--i) * -.7s); }
  .spark:nth-of-type(2n) { background:linear-gradient(135deg,var(--dh-accent,#7af0c6),var(--dh-accent-2,#8d7cf7)); }
  .link-base { stroke:color-mix(in srgb,var(--dh-accent,#7af0c6) 12%,transparent); stroke-width:1; }
  .link-pulse { stroke:var(--dh-accent,#7af0c6); stroke-width:1.3; stroke-linecap:round; stroke-dashoffset:var(--len);
    filter:drop-shadow(0 0 3px var(--dh-accent,#7af0c6)); animation:dh-shoot var(--dur) linear infinite; animation-delay:var(--delay); }
  .ring { animation:dh-spin 18s linear infinite; transition:opacity .4s ease; opacity:.55; }
  .ring text { fill:var(--dh-accent,#7af0c6); font:700 12.5px ui-monospace,SFMono-Regular,Menlo,monospace; filter:drop-shadow(0 0 4px var(--dh-accent,#7af0c6)); }
  .orb[data-state="connected"] .ring, .orb[data-state="ready"] .ring { opacity:1; }
  .orb[data-state="error"] .ring text { fill:#ff8a8a; filter:drop-shadow(0 0 4px #ff6b6b); }
  .core { position:relative; z-index:1; width:52%; height:52%; display:grid; place-items:center; }
  @keyframes dh-spin { to { transform:rotate(360deg); } }
  @keyframes dh-twinkle { 0%,100% { opacity:.35; filter:brightness(.8); } 50% { opacity:1; filter:brightness(1.8) drop-shadow(0 0 6px #eef8ff); } }
  @keyframes dh-shoot { from { stroke-dashoffset:var(--len); } to { stroke-dashoffset:0; } }
  @media (prefers-reduced-motion:reduce) { .ring, .spark, .link-pulse { animation:none; } .link-pulse { display:none; } }
  @media (max-width:600px) { .orb { --orb-size:var(--dh-orbit-size-mobile,92px); } .ring text { font-size:14px; } }
`;

// src/vendor/decent-head/2.0.0/js/components/Header/IPFSStatus.js
var PROVIDER_LABELS = { pinata: "PINATA", local: "YOUR NODE" };
var IPFSStatus = class extends HTMLElement {
  connectedCallback() {
    if (!config.enableIPFS) return;
    if (this.shadowRoot) {
      window.addEventListener("decenthead:ipfs", this.update);
      this.renderState();
      return;
    }
    this.attachShadow({ mode: "open" }).innerHTML = `<style>${orbitCSS}
      :host { display:grid; justify-items:center; align-content:start; gap:4px; font:12px/1.35 system-ui,sans-serif; color:var(--dh-muted,#b9cfe0); }
      ::slotted(ipfs-controls) { width:100%; height:100%; }
      p { margin:0; letter-spacing:.04em; text-align:center; }
      @media(max-width:600px) { :host { font-size:10.5px; } }
      </style>${orbitMarkup("<slot></slot>")}<p id="label"></p>`;
    const controls = document.createElement("ipfs-controls");
    controls.dataset.docked = "";
    const hasData = typeof config.data?.export === "function" || typeof config.data?.import === "function";
    controls.adapter = config.ipfsAdapter || {
      version: 1,
      label: config.appName,
      capabilities: hasData ? { backup: { open: () => controls.openBackup() } } : {},
      getStatus: async () => hasData ? { backup: { state: "idle", detail: "Host data controls available; no backup verified." } } : {}
    };
    ipfs.adapter = controls.adapter;
    this.replaceChildren(controls);
    this.update = (event) => this.renderState(event?.detail);
    window.addEventListener("decenthead:ipfs", this.update);
    this.renderState();
  }
  disconnectedCallback() {
    window.removeEventListener("decenthead:ipfs", this.update);
  }
  orbRect() {
    return this.shadowRoot?.querySelector(".orb")?.getBoundingClientRect();
  }
  renderState(detail = ipfs.snapshot()) {
    const provider = PROVIDER_LABELS[detail.provider] || String(detail.provider || "IPFS").toUpperCase();
    const ready = detail.credentialsConfigured || detail.provider === "local";
    const cid = detail.cid ? ` \u2726 ${detail.cid.slice(0, 12)}\u2026` : "";
    setRing(this.shadowRoot, `\u2726 IPFS \u2726 ${provider}${cid} \u2726 YOUR DATA \u2726 YOUR CHOICE `, ready ? "ready" : "idle");
    this.shadowRoot.querySelector("#label").textContent = `IPFS \xB7 ${detail.provider === "local" ? "your node" : detail.provider}`;
  }
};
if (!customElements.get("ipfs-status")) customElements.define("ipfs-status", IPFSStatus);

// src/vendor/decent-head/2.0.0/js/components/Header/AppTitle.js
var AppTitle = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `<style>
      :host { display:block; text-align:center; min-width:0; position:relative; z-index:1; container-type:inline-size; }
      button { cursor:pointer; border:0; background:none; padding:4px 8px; display:inline-flex; align-items:center; justify-content:center; gap:.3em; max-width:100%;
        font:800 clamp(18px,10cqi,56px)/1.1 var(--dh-title-font,'Avenir Next','Trebuchet MS',system-ui,sans-serif); letter-spacing:.01em;
        color:var(--dh-title,#e9fff7); animation:dh-breathe 6s ease-in-out infinite;
        text-shadow:0 0 4px #fff8,0 0 12px var(--dh-accent,#7af0c6),0 0 28px var(--dh-accent,#7af0c6),0 0 54px color-mix(in srgb,var(--dh-accent-2,#8d7cf7) 70%,transparent); }
      button:focus-visible { outline:2px solid var(--dh-accent,#7af0c6); outline-offset:4px; border-radius:10px; }
      .name { overflow-wrap:break-word; min-width:0; }
      .end { font:700 .42em ui-monospace,Menlo,monospace; color:var(--dh-accent,#7af0c6); opacity:.9; letter-spacing:.08em; white-space:nowrap; }
      img { width:.8em; height:.8em; object-fit:contain; filter:drop-shadow(0 0 8px var(--dh-accent,#7af0c6)); }
      p { margin:4px 0 0; font:600 12px/1.4 system-ui,sans-serif; letter-spacing:.12em; color:var(--dh-muted,#b9cfe0); }
      @keyframes dh-breathe { 50% { filter:brightness(1.18) drop-shadow(0 0 6px color-mix(in srgb,var(--dh-accent,#7af0c6) 45%,transparent)); } }
      @media(prefers-reduced-motion:reduce) { button { animation:none; } }
      @media(max-width:600px) { .end { display:none; } button { font-size:clamp(16px,13cqi,30px); } p { font-size:10px; letter-spacing:.06em; } }
      </style><button type="button" aria-haspopup="dialog"><span class="end" aria-hidden="true"></span><span class="name"></span><span class="end" aria-hidden="true"></span></button><p></p>`;
    const button = this.shadowRoot.querySelector("button");
    const [left, right] = Array.isArray(config.art.titleEnds) ? config.art.titleEnds : ["::-", "-::"];
    const ends = button.querySelectorAll(".end");
    ends[0].textContent = left ?? "";
    ends[1].textContent = right ?? "";
    button.querySelector(".name").textContent = config.appName;
    const icon2 = safeURL(config.art.titleIcon);
    if (icon2) {
      const image = document.createElement("img");
      image.src = icon2;
      image.alt = "";
      button.querySelector(".name").before(image);
    }
    this.shadowRoot.querySelector("p").textContent = config.subtitle;
    button.onclick = () => this.dispatchEvent(new CustomEvent("decenthead:about", { bubbles: true, composed: true }));
  }
  endRects() {
    return [...this.shadowRoot.querySelectorAll(".end")].filter((end) => end.offsetParent).map((end) => end.getBoundingClientRect());
  }
};
if (!customElements.get("app-title")) customElements.define("app-title", AppTitle);

// src/vendor/decent-head/2.0.0/js/chains.js
var icon = (name) => new URL(`../img/chains/${name}.svg`, new URL("vendor/decent-head/2.0.0/js/chains.js", document.baseURI).href).href;
var CHAIN_ICONS = Object.freeze({ 1: icon("ethereum"), 10: icon("optimism"), 8453: icon("base") });

// src/vendor/decent-head/2.0.0/js/components/Header/WalletConnect.js
var base2 = new URL("../../../", new URL("vendor/decent-head/2.0.0/js/components/Header/WalletConnect.js", document.baseURI).href).href;
var chainName = (chainId) => {
  const id = BigInt(chainId);
  if (id === BigInt(config.chain.chainId)) return config.chain.chainName;
  return { 1: "Ethereum", 10: "Optimism", 137: "Polygon", 8453: "Base", 42161: "Arbitrum" }[Number(id)] || `chain ${id}`;
};
var WalletConnect = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const icon2 = safeURL(config.art.walletIcon) || `${base2}img/MetaMaskFox.png`;
    this.shadowRoot.innerHTML = `<style>${orbitCSS}
      :host { display:grid; justify-items:center; align-content:start; gap:4px; font:12px/1.35 system-ui,sans-serif; color:var(--dh-text,#eef8ff); }
      #connect { width:100%; height:100%; border:0; border-radius:50%; padding:0; cursor:pointer; display:grid; place-items:center;
        background:radial-gradient(circle at 32% 28%,#ffffff2b,#ffffff08 62%),var(--dh-bg-1,#0a1220);
        --glow:#ff6b6bbf; box-shadow:0 0 0 2px #ff6b6b22,0 0 26px #ff6b6b5c,0 10px 26px #0008; transition:transform .18s ease, box-shadow .3s ease; }
      #connect::before { content:''; position:absolute; inset:-14%; z-index:-1; border-radius:50%; background:radial-gradient(circle,var(--glow) 0%,transparent 62%); filter:blur(6px); }
      #connect:hover:not(:disabled) { transform:scale(1.05); } #connect:active:not(:disabled) { transform:scale(.97); }
      #connect:disabled { cursor:default; filter:grayscale(.55) brightness(.8); }
      #connect:focus-visible { outline:3px solid var(--dh-accent,#7af0c6); outline-offset:4px; }
      #connect img { width:64%; height:64%; object-fit:contain; filter:drop-shadow(0 2px 6px #0009); }
      .orb[data-state="connected"] #connect { --glow:color-mix(in srgb,var(--dh-accent,#7af0c6) 78%,transparent);
        box-shadow:0 0 0 2px color-mix(in srgb,var(--dh-accent,#7af0c6) 18%,transparent),0 0 28px color-mix(in srgb,var(--dh-accent,#7af0c6) 45%,transparent),0 10px 26px #0008; }
      .meta { display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:6px; max-width:200px; text-align:center; }
      select,a { font:inherit; color:var(--dh-text,#eef8ff); background:color-mix(in srgb,var(--dh-bg-2,#10202a) 85%,transparent);
        border:1px solid color-mix(in srgb,var(--dh-accent,#7af0c6) 55%,transparent); border-radius:999px; padding:3px 10px; text-decoration:none; }
      select { max-width:150px; }
      select:focus-visible,a:focus-visible { outline:2px solid var(--dh-accent,#7af0c6); outline-offset:2px; }
      .account-orbit { position:absolute; inset:0; pointer-events:none; animation:dh-spin 18s linear infinite; }
      .account-orbit .ring { position:absolute; inset:0; width:100%; height:100%; overflow:visible; animation:none; }
      .account-orbit .ring text { dominant-baseline:central; }
      .account-logos { position:absolute; inset:0; opacity:.35; }
      .account-logos img { position:absolute; left:50%; top:50%; width:10%; height:10%; border-radius:50%;
        transform:translate(-50%,-50%) rotate(var(--angle)) translateY(calc(var(--orb-size) * -.4));
        filter:drop-shadow(0 0 5px var(--dh-accent,#7af0c6)); }
      .orb[data-state="connected"] .account-logos { opacity:1; }
      .spark.chain { background:none; border:0; border-radius:50%; width:8%; height:8%; object-fit:contain; }
      .identity-note { font-size:10px; color:var(--dh-muted,#b9cfe0); margin:0; text-align:center; }
      @media(prefers-reduced-motion:reduce) { .account-orbit { animation:none; } }
      #status { margin:0; color:var(--dh-muted,#b9cfe0); letter-spacing:.04em; overflow-wrap:anywhere; }
      [hidden] { display:none !important; }
      @media(max-width:600px) { :host { font-size:10.5px; } .meta { max-width:104px; gap:3px; } select { max-width:100px; } select,a { padding:2px 7px; } }
      </style>${orbitMarkup(`<button id="connect" type="button" aria-label="Connect wallet"><img alt="" src="${escapeHTML(icon2)}" /></button>`)}
      <div class="meta"><select aria-label="Choose wallet"></select>
      <a id="mobile" hidden>Open MetaMask</a><p id="status" role="status"></p></div><p class="identity-note" role="status"></p>`;
    const logos = document.createElement("div");
    logos.className = "account-logos";
    logos.setAttribute("aria-hidden", "true");
    for (const angle of [180, 204, 228, 252]) {
      const picture = document.createElement("picture");
      const still = document.createElement("source");
      still.media = "(prefers-reduced-motion: reduce)";
      still.srcset = `${base2}img/Ens_Eth_Breathe-still.png`;
      const image = document.createElement("img");
      image.src = `${base2}img/Ens_Eth_Breathe.png`;
      image.alt = "";
      image.style.setProperty("--angle", `${angle}deg`);
      picture.append(still, image);
      logos.append(picture);
    }
    const orbit = document.createElement("div");
    orbit.className = "account-orbit";
    orbit.append(this.shadowRoot.querySelector(".ring"), logos);
    this.shadowRoot.querySelector(".orb").append(orbit);
    this.shadowRoot.querySelectorAll(".spark").forEach((spark, i) => {
      if (i % 2) return;
      const image = document.createElement("img");
      image.className = "spark chain";
      image.style.cssText = spark.style.cssText;
      image.alt = "";
      image.hidden = true;
      spark.after(image);
      spark.dataset.chainPlaceholder = "";
    });
    this.update = () => this.renderState();
    window.addEventListener("decenthead:providers", this.update);
    window.addEventListener("decenthead:wallet", this.update);
    this.shadowRoot.querySelector("#connect").onclick = async () => {
      if (this.connecting) return;
      if (wallet.snapshot().connected) {
        wallet.forget();
        return;
      }
      this.connecting = true;
      let failure;
      this.renderState();
      try {
        const index = Number(this.shadowRoot.querySelector("select").value);
        await wallet.connect(wallet.available()[index]?.provider);
      } catch (error) {
        failure = error.shortMessage || error.message;
      } finally {
        this.connecting = false;
        this.renderState();
        if (failure) {
          this.shadowRoot.querySelector("#status").textContent = failure;
          setRing(this.shadowRoot, "\u2726 CONNECTION FAILED \u2726 TAP THE FOX TO TRY AGAIN ", "error");
        }
      }
    };
    this.renderState();
  }
  disconnectedCallback() {
    window.removeEventListener("decenthead:providers", this.update);
    window.removeEventListener("decenthead:wallet", this.update);
  }
  orbRect() {
    return this.shadowRoot.querySelector(".orb")?.getBoundingClientRect();
  }
  renderState() {
    const root = this.shadowRoot, available = wallet.available(), state = wallet.snapshot();
    const select = root.querySelector("select"), previous = select.value, connect = root.querySelector("#connect");
    select.replaceChildren(...available.map((item, i) => new Option(item.info.name, String(i))));
    if ([...select.options].some((option) => option.value === previous)) select.value = previous;
    select.hidden = available.length < 2 || state.connected;
    connect.disabled = !state.connected && (this.connecting || !available.length);
    connect.setAttribute("aria-label", state.connected ? "Disconnect wallet" : "Connect wallet");
    connect.title = state.connected ? `${state.ensName || state.address} \xB7 click to disconnect this dapp` : available.length ? "Connect wallet" : "No injected wallet detected";
    connect.setAttribute("aria-pressed", String(state.connected));
    const mobile = root.querySelector("#mobile");
    mobile.hidden = !!available.length;
    mobile.href = `https://metamask.app.link/dapp/${location.host}${location.pathname}${location.search}${location.hash}`;
    root.querySelector("#status").textContent = state.connected ? `${state.ensName || `${state.address.slice(0, 6)}\u2026${state.address.slice(-4)}`} \xB7 ${chainName(state.chainId)}` : this.connecting ? "Check your wallet\u2026" : available.length ? "Connect only when you choose." : "No injected wallet detected.";
    root.querySelector(".identity-note").textContent = state.ensStatus === "unavailable" ? "ENS unavailable \xB7 showing address" : "";
    setRing(root, "", state.connected ? "connected" : "idle");
    const path = root.querySelector("textPath");
    path.setAttribute("textLength", "342");
    path.setAttribute("lengthAdjust", "spacingAndGlyphs");
    path.setAttribute("startOffset", "2%");
    path.textContent = state.connected ? `${state.ensName || state.address.slice(0, 6)} \xB7 ${state.address.slice(-4)}` : this.connecting ? "CHECK YOUR WALLET" : "CONNECT WALLET";
    const chainIcon = state.connected ? CHAIN_ICONS[Number(BigInt(state.chainId))] : null;
    root.querySelectorAll(".spark.chain").forEach((image) => {
      image.hidden = !chainIcon;
      if (chainIcon) image.src = chainIcon;
    });
    root.querySelectorAll("[data-chain-placeholder]").forEach((spark) => {
      spark.hidden = !!chainIcon;
    });
  }
};
if (!customElements.get("wallet-connect")) customElements.define("wallet-connect", WalletConnect);

// src/vendor/decent-head/2.0.0/js/components/Header/AboutModal.js
var ZERO = "0x0000000000000000000000000000000000000000";
var ESCROW_ABI = [
  "function getListing(uint256) view returns (tuple(address nftContract,uint256 tokenId,uint256 priceETH,address priceToken,uint256 priceAmount,uint256 available,bool active,string note))",
  "function getNFTBalance(address,uint256) view returns (uint256)",
  "function purchaseWithETH(uint256,uint256) payable",
  "function purchaseWithToken(uint256,uint256)"
];
var ERC20_ABI = ["function allowance(address,address) view returns (uint256)", "function approve(address,uint256) returns (bool)"];
var links = (items) => (items || []).map((item) => {
  const url = safeURL(item.url);
  return url ? `<li><a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.label || item.title || url)}</a></li>` : "";
}).join("");
var AboutModal = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.render();
  }
  open() {
    this.shadowRoot.querySelector("dialog").showModal();
  }
  close() {
    this.shadowRoot.querySelector("dialog").close();
  }
  render() {
    const about = config.about, supporter = config.supporterDnft;
    this.shadowRoot.innerHTML = `<style>${modalStyles}</style><dialog aria-labelledby="about-title">
      ${modalHeading(about.title, "about-title", "\u2726")}<p>${escapeHTML(about.summary)}</p>
      <ul>${links(config.links)}</ul>
      ${(about.sections || []).map((section) => `<details><summary>${escapeHTML(section.title)}</summary><p>${escapeHTML(section.body || section.text)}</p></details>`).join("")}
      ${config.relatedDapps.length ? `<details><summary>\u2197 Related Decent dapps</summary><ul>${links(config.relatedDapps)}</ul></details>` : ""}
      ${supporter ? `<section><h3>\u25C8 ${escapeHTML(supporter.title || "Supporter DNFT")}</h3>
        <ul>${links(supporter.marketUrl ? [{ label: "View on marketplace", url: supporter.marketUrl }] : [])}</ul>
        ${supporter.escrowAddress && supporter.listingId !== void 0 ? '<button id="buy">Buy from escrow</button>' : ""}
        <details><summary>Token details</summary><p class="quiet">Contract: ${escapeHTML(supporter.contract)} \xB7 Token: ${escapeHTML(supporter.tokenId)} \xB7 Chain: ${escapeHTML(supporter.chain?.chainName || supporter.chain?.chainId)}</p></details>
        ${supporter.paypal?.clientId ? `<details><summary>Pay with PayPal</summary><label>Recipient wallet <input id="recipient" autocomplete="off" /></label><button id="paypal">Buy with PayPal \u2014 ${escapeHTML(supporter.paypal.amount)} ${escapeHTML(supporter.paypal.currency || "USD")}</button><div id="paypal-buttons"></div><p class="quiet">Merchant-verified manual fulfillment. This payment does not mint on-chain.</p></details>` : ""}
        <p id="purchase-status" role="status"></p></section>` : ""}
      <p class="quiet">Your wallet. Your data. Always your choice.</p></dialog>`;
    bindModalClose(this.shadowRoot.querySelector("dialog"));
    this.shadowRoot.querySelector("#buy")?.addEventListener("click", () => this.buy());
    this.shadowRoot.querySelector("#paypal")?.addEventListener("click", () => this.paypal());
  }
  status(message) {
    this.shadowRoot.querySelector("#purchase-status").textContent = message;
  }
  async buy() {
    const button = this.shadowRoot.querySelector("#buy"), cfg = config.supporterDnft;
    if (this.busy) return;
    this.busy = true;
    button.disabled = true;
    try {
      if (!cfg.chain) throw new Error("Configure the supporter chain before purchasing");
      if (!wallet.snapshot().connected) await wallet.connect();
      const provider = await wallet.ensureChain(cfg.chain);
      const ethers = await loadEthers(), signer = await provider.getSigner();
      const escrow = new ethers.Contract(cfg.escrowAddress, ESCROW_ABI, signer);
      this.status("Checking listing and escrow stock\u2026");
      const listing = await escrow.getListing(cfg.listingId);
      if (listing.nftContract.toLowerCase() !== cfg.contract.toLowerCase() || listing.tokenId !== BigInt(cfg.tokenId)) throw new Error("Listing does not match configured supporter token");
      if (!listing.active || listing.available < 1n || await escrow.getNFTBalance(cfg.contract, cfg.tokenId) < 1n) throw new Error("Supporter token is not available in escrow");
      if (cfg.expectedPriceAmount !== void 0 && (listing.priceETH !== 0n || listing.priceAmount !== BigInt(cfg.expectedPriceAmount) || listing.priceToken.toLowerCase() !== cfg.paymentToken.toLowerCase())) {
        throw new Error("Listing price changed. Reload and review the listing before purchasing.");
      }
      const price = cfg.expectedPriceAmount === "10000000" && cfg.paymentToken?.toLowerCase() === "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" ? "10 USDC" : listing.priceETH > 0n ? `${ethers.formatEther(listing.priceETH)} ETH` : `${listing.priceAmount} raw token units (${listing.priceToken === ZERO ? cfg.paymentToken : listing.priceToken})`;
      if (!confirm(`Buy one supporter DNFT for ${price}? Review the wallet transaction before signing.`)) {
        this.status("Cancelled.");
        return;
      }
      let tx;
      if (listing.priceETH > 0n) {
        tx = await escrow.purchaseWithETH(cfg.listingId, 1, { value: listing.priceETH });
      } else {
        const tokenAddress = listing.priceToken === ZERO ? cfg.paymentToken : listing.priceToken;
        if (!tokenAddress || tokenAddress === ZERO) throw new Error("Configure the escrow default payment token");
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const buyer = await signer.getAddress();
        if (await token.allowance(buyer, cfg.escrowAddress) < listing.priceAmount) {
          this.status("Approve the exact token amount in your wallet\u2026");
          await (await token.approve(cfg.escrowAddress, listing.priceAmount)).wait();
        }
        tx = await escrow.purchaseWithToken(cfg.listingId, 1);
      }
      this.status("Waiting for purchase confirmation\u2026");
      await tx.wait();
      this.status(`Purchase confirmed: ${tx.hash}`);
    } catch (error) {
      this.status(error.shortMessage || error.message);
    } finally {
      this.busy = false;
      button.disabled = false;
    }
  }
  async paypal() {
    const cfg = config.supporterDnft.paypal, button = this.shadowRoot.querySelector("#paypal");
    const recipient = this.shadowRoot.querySelector("#recipient").value.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(recipient)) {
      this.status("Enter a valid recipient wallet address.");
      return;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(String(cfg.amount)) || Number(cfg.amount) <= 0) {
      this.status("Configure a positive PayPal amount.");
      return;
    }
    button.disabled = true;
    try {
      if (!window.paypal) await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(cfg.clientId)}&currency=${encodeURIComponent(cfg.currency || "USD")}&intent=capture`;
        script.onload = resolve;
        script.onerror = () => reject(new Error("Could not load PayPal"));
        document.head.append(script);
      });
      const container = this.shadowRoot.querySelector("#paypal-buttons");
      container.replaceChildren();
      await window.paypal.Buttons({
        createOrder: (data, actions) => actions.order.create({ purchase_units: [{
          description: `${config.appName} Supporter DNFT`,
          custom_id: recipient,
          amount: { currency_code: cfg.currency || "USD", value: String(cfg.amount) }
        }] }),
        onApprove: async (data, actions) => {
          try {
            const receipt = await actions.order.capture();
            if (receipt.status !== "COMPLETED") throw new Error("Payment is not completed");
            this.status(`Payment captured: ${receipt.id}. Contact the merchant for verified manual fulfillment to ${recipient}.`);
            container.replaceChildren();
            if (cfg.adminEmail) {
              const link = document.createElement("a");
              link.textContent = "Email merchant with receipt";
              link.href = `mailto:${encodeURIComponent(cfg.adminEmail)}?subject=Supporter%20DNFT%20receipt&body=${encodeURIComponent(`Receipt: ${receipt.id}
Wallet: ${recipient}
Amount: ${cfg.amount} ${cfg.currency || "USD"}`)}`;
              container.append(link);
            }
          } catch (error) {
            this.status(error.message);
          }
        },
        onCancel: () => {
          this.status("Payment cancelled.");
          button.disabled = false;
        },
        onError: (error) => {
          this.status(error.message || "PayPal payment failed");
          button.disabled = false;
        }
      }).render(container);
    } catch (error) {
      this.status(error.message);
      button.disabled = false;
    }
  }
};
if (!customElements.get("about-modal")) customElements.define("about-modal", AboutModal);

// src/vendor/decent-head/2.0.0/js/components/Header/AnkhMenu.js
var AnkhMenu = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const profile = this.getAttribute("side") === "right";
    const label = profile ? "My Profile" : "Admin";
    this.shadowRoot.innerHTML = `<style>
      :host { display:block; position:relative; z-index:3; }
      summary { list-style:none; display:grid; place-items:center; box-sizing:border-box; width:44px; height:44px;
        border:1px solid var(--dh-accent,#7af0c6); border-radius:50%; cursor:pointer;
        background:radial-gradient(circle at 40% 30%,#16333f,var(--dh-bg-1,#0a1220) 75%);
        color:var(--dh-accent,#7af0c6); font:30px/1 system-ui;
        text-shadow:0 0 7px currentColor; box-shadow:0 0 14px var(--dh-accent-2,#8d7cf7); }
      summary::-webkit-details-marker { display:none; }
      summary:hover, details[open] summary { box-shadow:0 0 20px var(--dh-accent,#7af0c6); }
      summary:focus-visible, button:focus-visible { outline:2px solid var(--dh-accent,#7af0c6); outline-offset:4px; }
      .options { position:absolute; top:calc(100% + 10px); ${profile ? "right" : "left"}:0; min-width:136px; padding:6px;
        border:1px solid var(--dh-accent,#7af0c6); border-radius:12px; background:var(--dh-bg-1,#0a1220);
        box-shadow:0 8px 24px #0009,0 0 16px color-mix(in srgb,var(--dh-accent-2,#8d7cf7) 35%,transparent); }
      button { width:100%; border:0; border-radius:7px; padding:12px; background:transparent;
        color:var(--dh-text,#eef8ff); font:600 14px system-ui; text-align:left; cursor:default; }
      button:hover { background:color-mix(in srgb,var(--dh-accent,#7af0c6) 12%,transparent); }
      @media(max-width:600px) { summary { width:30px; height:30px; font-size:23px; } }
      </style><details><summary role="button" aria-label="${profile ? "Profile" : "Admin"} menu" aria-expanded="false" aria-controls="options">\u2625</summary>
      <div class="options" id="options"><button type="button">${label}</button></div></details>`;
    const details = this.shadowRoot.querySelector("details");
    const summary = this.shadowRoot.querySelector("summary");
    details.addEventListener("toggle", () => summary.setAttribute("aria-expanded", String(details.open)));
    this.closeOutside = (event) => {
      if (!event.composedPath().includes(this)) details.open = false;
    };
    this.shadowRoot.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && details.open) {
        details.open = false;
        summary.focus();
        event.stopPropagation();
      }
    });
    document.addEventListener("pointerdown", this.closeOutside);
  }
  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.closeOutside);
  }
};
if (!customElements.get("ankh-menu")) customElements.define("ankh-menu", AnkhMenu);

// src/vendor/decent-head/2.0.0/js/components/Header.js
var css = new URL("../../css/decent-head.css", new URL("vendor/decent-head/2.0.0/js/components/Header.js", document.baseURI).href).href;
var SVG = "http://www.w3.org/2000/svg";
var center = (rect) => rect && rect.width ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
var DecentHeader = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    for (const [key, value] of Object.entries(config.theme)) {
      const property = key.startsWith("--dh-") ? key : `--dh-${key}`;
      if (/^--dh-[a-z0-9-]+$/.test(property)) this.style.setProperty(property, value);
    }
    this.shadowRoot.innerHTML = `<link rel="stylesheet" href="${css}" />
      <header><div class="dh-background" aria-hidden="true"></div><svg class="dh-wires" aria-hidden="true"></svg>
      <ipfs-status></ipfs-status><div class="dh-title-tools"><ankh-menu side="left"></ankh-menu><app-title></app-title><ankh-menu side="right"></ankh-menu></div><wallet-connect></wallet-connect></header><about-modal></about-modal>`;
    this.shadowRoot.querySelector("app-title").addEventListener("decenthead:about", () => this.shadowRoot.querySelector("about-modal").open());
    this.drawWires = () => cancelAnimationFrame(this.frame) || (this.frame = requestAnimationFrame(() => this.wire()));
    this.observer = new ResizeObserver(this.drawWires);
    this.observer.observe(this.shadowRoot.querySelector("header"));
    document.fonts?.ready.then(this.drawWires);
  }
  disconnectedCallback() {
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
  }
  // Pulsing curves that tie the IPFS dock, the title endpoints, and the wallet dock together.
  wire() {
    const root = this.shadowRoot, svg = root.querySelector(".dh-wires"), header = root.querySelector("header");
    if (!svg || !header) return;
    const box = header.getBoundingClientRect();
    const local = (point2) => point2 && { x: point2.x - box.left, y: point2.y - box.top };
    const ipfs2 = local(center(root.querySelector("ipfs-status").orbRect?.()));
    const wallet2 = local(center(root.querySelector("wallet-connect").orbRect?.()));
    const [leftEnd, rightEnd] = (root.querySelector("app-title").endRects?.() || []).map((rect) => local(center(rect)));
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    svg.replaceChildren();
    if (!ipfs2 || !wallet2) return;
    const lanes = [];
    if (leftEnd && rightEnd) lanes.push([ipfs2, leftEnd, -18], [rightEnd, wallet2, -18], [ipfs2, leftEnd, 22], [rightEnd, wallet2, 22]);
    lanes.push([ipfs2, wallet2, box.height * 0.42], [ipfs2, wallet2, box.height * 0.62], [ipfs2, wallet2, -box.height * 0.2]);
    lanes.forEach(([from, to, bend], index) => {
      const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 + bend };
      const d = `M${from.x.toFixed(1)},${from.y.toFixed(1)} Q${mid.x.toFixed(1)},${mid.y.toFixed(1)} ${to.x.toFixed(1)},${to.y.toFixed(1)}`;
      for (const kind of ["wire", "wire pulse"]) {
        const path = document.createElementNS(SVG, "path");
        path.setAttribute("d", d);
        path.setAttribute("class", kind);
        if (kind !== "wire") path.style.cssText = `--dur:${(5 + index * 1.3).toFixed(1)}s;--delay:${(-index * 1.7).toFixed(1)}s`;
        svg.append(path);
      }
      for (const t of [0.22, 0.5, 0.78]) {
        const x = (1 - t) ** 2 * from.x + 2 * (1 - t) * t * mid.x + t ** 2 * to.x;
        const y = (1 - t) ** 2 * from.y + 2 * (1 - t) * t * mid.y + t ** 2 * to.y;
        const node = document.createElementNS(SVG, "circle");
        node.setAttribute("cx", x.toFixed(1));
        node.setAttribute("cy", y.toFixed(1));
        node.setAttribute("r", "1.8");
        node.setAttribute("class", "node");
        node.style.animationDelay = `${(-(index * 3 + t * 10) * 0.4).toFixed(1)}s`;
        svg.append(node);
      }
    });
  }
};
if (!customElements.get("decent-header")) customElements.define("decent-header", DecentHeader);

// src/vendor/decent-head/2.0.0/js/main.js
var DecentHead = Object.freeze({
  version: config.version,
  getIpfs: () => ipfs,
  getWallet: () => wallet,
  on(event, callback) {
    const name = event.startsWith("decenthead:") ? event : `decenthead:${event}`;
    const handler = (event2) => callback(event2.detail);
    window.addEventListener(name, handler);
    return () => window.removeEventListener(name, handler);
  }
});
window.DecentHead = DecentHead;
window.dispatchEvent(new CustomEvent("decenthead:ready", { detail: DecentHead }));
export {
  DecentHead
};
