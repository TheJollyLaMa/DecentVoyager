// src/js/dnft/ui.mjs
function node(tag, text = "", attrs = {}) {
  const element = document.createElement(tag);
  element.textContent = text;
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "className") element.className = value;
    else element.setAttribute(key, value);
  }
  return element;
}
function button(text, action) {
  const element = node("button", text, { type: "button" });
  element.addEventListener("click", action);
  return element;
}
function link(text, href) {
  return node("a", text, { href, target: "_blank", rel: "noopener noreferrer" });
}
function installStyle() {
  if (document.getElementById("asteroid-stamp-style")) return;
  const style = node("style", `
    .asteroid-panel { color:#eefaff; background:#091320; border:2px solid #68e7cf; border-radius:16px; padding:22px; width:min(900px,calc(100vw - 52px)); max-height:80dvh; overflow:auto; font:15px/1.6 system-ui; box-shadow:0 0 50px #39eec633; }
    .asteroid-panel::backdrop { background:#020712d9; }
    .asteroid-panel h2,.asteroid-panel h3 { color:#88ffee; margin:8px 0 14px; }
    .asteroid-panel .panel-heading { position:sticky; top:-22px; z-index:2; display:flex; align-items:center; justify-content:space-between; gap:18px; padding:12px 0; background:#091320; }
    .asteroid-panel .panel-close { flex:none; width:44px; height:44px; padding:0; border-radius:50%; font-size:26px; }
    .flight-log-hero { display:flex; align-items:center; gap:24px; margin:22px 0; }
    .flight-log-hero img { width:100px; height:100px; object-fit:contain; }
    .flight-log-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(135px,1fr)); gap:14px; margin:18px 0 30px; }
    .flight-log-grid > div { background:#102132; border:1px solid #36586a; border-radius:12px; padding:18px; }
    .flight-log-grid strong { display:block; color:#88ffee; font-size:24px; line-height:1.4; }
    .flight-log-grid span { color:#bdd0e4; }
    .asteroid-panel .battle-preview { width:100%; max-width:480px; height:auto; display:block; margin:18px 0; }
    .asteroid-panel button { cursor:pointer; padding:10px 15px; color:#ebffff; background:#183347; border:1px solid #77efd4; border-radius:9px; font:600 14px system-ui; margin:5px; }
    .asteroid-panel button:disabled { opacity:.45; cursor:not-allowed; }
    .asteroid-panel button:focus-visible,.asteroid-panel a:focus-visible { outline:3px solid #fbc770; outline-offset:3px; }
    .asteroid-panel a { color:#8cdbff; overflow-wrap:anywhere; }
    .asteroid-panel article { padding:15px; margin:14px 0; border:1px solid #36586a; border-radius:12px; background:#102132; overflow-wrap:anywhere; }
    .asteroid-panel p { margin:8px 0; }
    .asteroid-panel textarea { box-sizing:border-box; width:100%; min-height:110px; background:#04111c; color:#dcfff9; padding:10px; }
    .asteroid-panel img { width:160px; max-width:100%; border-radius:10px; }
    .asteroid-panel pre { white-space:pre-wrap; overflow-wrap:anywhere; }
    .asteroid-status { color:#ffdb87; white-space:pre-wrap; }
    .asteroid-panel nav { display:flex; flex-wrap:wrap; gap:8px; }
    .asteroid-panel [aria-selected=true] { background:#215c60; }
    .reward-rolodex { display:flex; gap:18px; overflow-x:auto; scroll-snap-type:x mandatory; padding:12px 4px 24px; }
    .asteroid-panel .reward-thumbnail { flex:0 0 190px; display:flex; flex-direction:column; align-items:center; gap:12px; padding:18px; margin:0; scroll-snap-align:start; }
    .reward-thumbnail img { height:150px; object-fit:contain; }
    .reward-thumbnail strong { line-height:1.5; }
    .reward-thumbnail span { color:#bdd0e4; }
    #voyager-reward-detail .reward-card img { display:block; width:min(360px,100%); margin:20px auto; }
  `, { id: "asteroid-stamp-style" });
  document.head.append(style);
}
function createDialog(title, id) {
  installStyle();
  const dialog = node("dialog", "", { id, className: "asteroid-panel", "aria-labelledby": `${id}-title` });
  const heading = node("div", "", { className: "panel-heading" });
  const close = button("\xD7", () => dialog.close());
  close.className = "panel-close";
  close.setAttribute("aria-label", `Close ${title}`);
  heading.append(node("h2", title, { id: `${id}-title` }), close);
  dialog.append(heading);
  bindBackdropClose(dialog);
  dialog.addEventListener("keydown", (event) => event.stopPropagation());
  dialog.addEventListener("keyup", (event) => event.stopPropagation());
  document.body.append(dialog);
  return dialog;
}
function bindBackdropClose(dialog, dismiss = () => dialog.close()) {
  let outside = false;
  const isOutside = (event) => {
    const box = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom);
  };
  dialog.addEventListener("pointerdown", (event) => {
    outside = isOutside(event);
  });
  dialog.addEventListener("click", (event) => {
    if (outside && isOutside(event)) dismiss();
    outside = false;
  });
}
function openDialog(dialog) {
  const game = window.asteroidGame;
  if (game?.state === "playing") {
    game.handleAction?.("pause");
    window.asteroidDraw?.();
  }
  if (!dialog.open) dialog.showModal();
}

// src/js/pilots/whitelist.mjs
var RAW = "https://raw.githubusercontent.com/TheJollyLaMa/DecentVoyager/main/contributor-accounts.json";
var LOCAL = new URL("../../../contributor-accounts.json", new URL("js/pilots/whitelist.mjs", document.baseURI).href);
var ADDRESS = /^0x[\da-f]{40}$/i;
function parsePilots(value) {
  if (!Array.isArray(value?.contributors)) throw new Error("Pilot list requires a contributors array");
  return value.contributors.filter((entry) => entry?.whitelisted !== false && ADDRESS.test(entry?.walletAddress || ""));
}
async function loadPilots(fetchImpl = globalThis.fetch) {
  let lastError;
  for (const url of [RAW, LOCAL.href]) {
    try {
      const response = await fetchImpl(url, { cache: "no-store", signal: AbortSignal.timeout(1e4) });
      if (!response.ok) throw new Error(`Pilot list unavailable (${response.status})`);
      return parsePilots(await response.json());
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Decent Pilots list could not be loaded: ${lastError?.message || "network unavailable"}`);
}
function isWhitelisted(address, entries) {
  return !!address && ADDRESS.test(address) && entries.some((entry) => entry.walletAddress.toLowerCase() === address.toLowerCase());
}
function dispatchPilot(address, isPilot) {
  window.dispatchEvent(new CustomEvent("voyager:pilot", { detail: { address: address || null, isPilot: !!isPilot } }));
}
async function contractPilot(address) {
  const response = await fetch("./js/chain/addresses.json", { cache: "no-store" });
  if (!response.ok) return null;
  const addresses = await response.json();
  const contracts = addresses.contracts || addresses;
  const configured = contracts.VoyagerPilots || contracts.voyagerPilots || contracts.base?.VoyagerPilots || contracts["8453"]?.VoyagerPilots;
  const contractAddress2 = typeof configured === "string" ? configured : configured?.address;
  if (!ADDRESS.test(contractAddress2 || "")) return null;
  const ethers = window.ethers || await (await import("./wallet-HETDYOBF.js")).loadEthers();
  const provider = new ethers.JsonRpcProvider(window.DECENT_CONFIG?.chain?.rpcUrls?.[0] || "https://mainnet.base.org");
  return new ethers.Contract(contractAddress2, ["function isPilot(address) view returns (bool)"], provider).isPilot(address);
}
function mountPilots({ fetchImpl = globalThis.fetch, readOnChain = contractPilot } = {}) {
  let pilots = [], loading = null, generation = 0, currentAddress = null;
  const note = document.getElementById("pilot-note");
  const load = () => loading ||= loadPilots(fetchImpl).then((entries) => {
    pilots = entries;
  });
  const update = async (state2) => {
    const address = state2?.connected ? state2.address : null;
    if (address?.toLowerCase() !== currentAddress?.toLowerCase()) {
      currentAddress = address;
      generation++;
    }
    const request = generation;
    if (!address) {
      dispatchPilot(null, false);
      if (note) note.hidden = true;
      return { address: null, isPilot: false };
    }
    try {
      await load();
    } catch (error) {
      if (request === generation) {
        loading = null;
        dispatchPilot(address, false);
        if (note) {
          note.hidden = false;
          note.textContent = error.message;
        }
      }
      throw error;
    }
    let allowed = isWhitelisted(address, pilots);
    if (allowed) {
      try {
        const chainResult = await readOnChain(address);
        if (chainResult !== null) allowed = !!chainResult;
      } catch {
      }
    }
    if (request !== generation) throw new Error("Wallet changed during Pilot verification. Please retry.");
    dispatchPilot(address, allowed);
    if (note) {
      note.hidden = allowed;
      note.textContent = "This wallet is not on the Decent Pilots list yet. Ask in the DecentAgency Discord. Cadet has 10 free levels; Pilot and Ace have 20. NFT rewards require an eligible wallet.";
    }
    return { address, isPilot: allowed };
  };
  const refreshWallet = () => {
    void update(window.DecentHead?.getWallet?.()?.snapshot?.()).catch((error) => {
      console.warn("[Voyager Pilots]", error.message);
    });
  };
  window.addEventListener("decenthead:ready", refreshWallet);
  window.addEventListener("decenthead:wallet", refreshWallet);
  if (window.DecentHead) refreshWallet();
  return { refresh: update, entries: () => pilots };
}
var pilotController = typeof window !== "undefined" && typeof document !== "undefined" ? mountPilots() : null;

// src/js/pilots/run-outbox.mjs
var OUTBOX_KEY = "decent-voyager-run-outbox/1";
function browserStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}
function createRunOutbox({ storage = browserStorage(), fetchImpl = globalThis.fetch, baseUrl = () => globalThis.DECENT_CONFIG?.voyager?.refereeUrl || "", onChange = () => {
}, onAccepted = () => {
} } = {}) {
  let memory = [], retrying = null, storageFailed = false;
  const read = () => {
    if (storageFailed) return [...memory];
    try {
      const value = JSON.parse(storage?.getItem(OUTBOX_KEY) ?? JSON.stringify(memory));
      return Array.isArray(value) ? value : [];
    } catch {
      return [...memory];
    }
  };
  const write = (items) => {
    memory = items;
    try {
      storage?.setItem(OUTBOX_KEY, JSON.stringify(items));
      storageFailed = false;
    } catch (error) {
      storageFailed = true;
      onChange();
      throw new Error(`Could not persist signed flight evidence: ${error.message}. Keep this page open and free browser storage before retrying.`);
    }
    onChange();
  };
  async function submit(item) {
    const url = baseUrl();
    if (!url) throw new Error("Referee server is not configured");
    const response = await fetchImpl(`${url.replace(/\/$/, "")}/${item.checkpoint ? "captures" : "runs"}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(item) });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || `Referee rejected run (${response.status})`);
    }
    return response.json();
  }
  async function enqueue(item) {
    const items = read();
    if (!items.some((entry) => entry.runHash === item.runHash && entry.address?.toLowerCase() === item.address?.toLowerCase())) items.push({ ...item, queuedAt: (/* @__PURE__ */ new Date()).toISOString() });
    write(items);
    await retry();
    return read();
  }
  function retry() {
    if (retrying) return retrying;
    const request = retryBatch().finally(() => {
      if (retrying === request) retrying = null;
    });
    retrying = request;
    return request;
  }
  async function retryBatch() {
    const batch = read();
    const remaining = [];
    for (const item of batch) {
      try {
        onAccepted(item, await submit(item));
      } catch (error) {
        remaining.push({ ...item, lastError: error.message });
      }
    }
    const added = read().filter((item) => !batch.some((entry) => entry.runHash === item.runHash && entry.address?.toLowerCase() === item.address?.toLowerCase()));
    write([...remaining, ...added]);
    return { sent: read().length === 0, pending: read().length };
  }
  return { read, enqueue, retry, submit };
}

// src/js/pilots/ticket.mjs
function parseSeed(value) {
  const seed = typeof value === "string" && /^0x[\da-f]+$/i.test(value) ? Number.parseInt(value, 16) : Number(value);
  return Number.isInteger(seed) && seed >= 0 && seed <= 4294967295 ? seed >>> 0 : null;
}
function timestamp(value) {
  if (typeof value === "number" || typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value)) {
    const number = Number(value);
    return number < 1e12 ? number * 1e3 : number;
  }
  return Date.parse(value);
}
function isExpired(ticket, now) {
  const expiresAt = timestamp(ticket.expiresAt);
  return !Number.isFinite(expiresAt) || expiresAt <= now;
}
function createRunTicketManager({
  fetchImpl = globalThis.fetch,
  baseUrl = () => globalThis.DECENT_CONFIG?.voyager?.refereeUrl || "",
  getGame = () => globalThis.window?.voyager?.game || globalThis.window?.asteroidGame,
  now = () => Date.now(),
  onStatus = () => {
  },
  getRecentOffers = () => [],
  pollInterval = 1e3,
  setIntervalImpl = globalThis.setInterval,
  clearIntervalImpl = globalThis.clearInterval
} = {}) {
  let pilot2 = { address: null, isPilot: false };
  let ticket = null, appliedId = null, inFlight = null, generation = 0, lastRunId = null;
  const desiredDifficulty = () => getGame()?.selectedDifficulty;
  const report = (text) => onStatus(text);
  function ready() {
    const game = getGame();
    return !!(pilot2.isPilot && pilot2.address && baseUrl() && typeof game?.setNextRunSeed === "function");
  }
  function applyBeforeLaunch() {
    const game = getGame();
    if (!ready() || !["title", "gameOver"].includes(game?.state) || !ticket || isExpired(ticket.ticket, now()) || appliedId === ticket.ticket.id) return false;
    try {
      game.setNextRunSeed(ticket.seed, { ticket: ticket.ticket, mac: ticket.mac });
      appliedId = ticket.ticket.id;
      report("Referee flight ticket ready for your next launch.");
      return true;
    } catch (error) {
      report(`Could not prepare referee flight ticket: ${error.message}`);
      return false;
    }
  }
  async function fetchTicket() {
    const address = pilot2.address, url = baseUrl(), token = generation;
    const difficulty = desiredDifficulty();
    if (!pilot2.isPilot || !address) {
      report("Connect a Decent Pilot wallet to prepare referee flight tickets.");
      return null;
    }
    if (!url) {
      report("Rewards need a referee flight ticket. The GitHub fallback remains in \u2625 profile \u2192 Flight Logs \u2192 Request mint on GitHub.");
      return null;
    }
    const game = getGame();
    if (typeof game?.setNextRunSeed !== "function") {
      report("This game build cannot use referee flight tickets. Rewards need the referee; GitHub fallback remains in \u2625 profile \u2192 Flight Logs.");
      return null;
    }
    try {
      const response = await fetchImpl(`${url.replace(/\/$/, "")}/tickets`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          address,
          ...difficulty ? { difficulty, recentOffers: getRecentOffers(address) } : {}
        })
      });
      if (!response.ok) throw new Error(`Referee ticket request failed (${response.status})`);
      const result = await response.json();
      const value = result?.ticket, seed = parseSeed(value?.seed);
      if (token !== generation || pilot2.address?.toLowerCase() !== address.toLowerCase() || difficulty !== desiredDifficulty()) return null;
      if (!value || typeof value.id !== "string" || !value.id || !/^0x[\da-f]{40}$/i.test(value.address || "") || value.address.toLowerCase() !== address.toLowerCase() || seed === null || !result.mac || isExpired(value, now())) {
        throw new Error("Referee returned an invalid or expired flight ticket");
      }
      ticket = { ticket: value, mac: result.mac, seed, requestedDifficulty: difficulty };
      appliedId = null;
      applyBeforeLaunch();
      return ticket;
    } catch (error) {
      if (token === generation) report(`Rewards need a referee flight ticket (${error.message}). GitHub fallback: \u2625 profile \u2192 Flight Logs \u2192 Request mint on GitHub.`);
      return null;
    }
  }
  function ensureTicket() {
    if (!ready()) return Promise.resolve(null);
    if (ticket && ticket.requestedDifficulty !== desiredDifficulty()) {
      ticket = null;
      appliedId = null;
    }
    if (ticket && !isExpired(ticket.ticket, now())) {
      applyBeforeLaunch();
      return Promise.resolve(ticket);
    }
    if (inFlight) return inFlight;
    const request = fetchTicket().finally(() => {
      if (inFlight === request) inFlight = null;
    });
    inFlight = request;
    return request;
  }
  function setPilot(state2 = {}) {
    const address = state2.address || null, isPilot = !!state2.isPilot;
    const changed = address?.toLowerCase() !== pilot2.address?.toLowerCase() || isPilot !== pilot2.isPilot;
    if (changed) {
      generation++;
      ticket = null;
      appliedId = null;
      inFlight = null;
      lastRunId = null;
    }
    pilot2 = { address, isPilot };
    if (isPilot && address) {
      if (!baseUrl()) report("Rewards need a referee flight ticket. The GitHub fallback remains in \u2625 profile \u2192 Flight Logs \u2192 Request mint on GitHub.");
      else if (typeof getGame()?.setNextRunSeed !== "function") report("This game build cannot use referee flight tickets. Rewards need the referee; GitHub fallback remains in \u2625 profile \u2192 Flight Logs.");
      else void ensureTicket();
    } else report("");
  }
  function runStarted(runId2) {
    if (runId2 && runId2 === lastRunId) return;
    lastRunId = runId2 || `run-${now()}`;
    report("");
    if (appliedId || ticket) {
      ticket = null;
      appliedId = null;
    }
    if (pilot2.isPilot) void ensureTicket();
  }
  const timer = setIntervalImpl(() => {
    if (!pilot2.isPilot) return;
    const game = getGame();
    if (["title", "gameOver"].includes(game?.state)) {
      void ensureTicket();
      applyBeforeLaunch();
    }
  }, pollInterval);
  return {
    ensureTicket,
    setPilot,
    runStarted,
    refresh: () => {
      if (ticket && isExpired(ticket.ticket, now())) {
        ticket = null;
        appliedId = null;
      }
      return ensureTicket();
    },
    current: () => ticket,
    stop: () => clearIntervalImpl(timer)
  };
}

// src/js/pilots/reward-state.mjs
var REWARD_KEY = "decent-voyager-rewards/1";
function createRewardState({ storage = globalThis.localStorage, onChange = () => {
} } = {}) {
  const read = () => {
    const value = JSON.parse(storage.getItem(REWARD_KEY) || "[]");
    if (!Array.isArray(value)) throw new Error("Saved reward history is invalid.");
    return value;
  };
  const put = (entry) => {
    const entries = read();
    const index = entries.findIndex((item) => item.id === entry.id && item.address.toLowerCase() === entry.address.toLowerCase());
    if (index < 0) entries.push(entry);
    else entries[index] = { ...entries[index], ...entry };
    storage.setItem(REWARD_KEY, JSON.stringify(entries));
    onChange();
    return entry;
  };
  const accept = (item, result) => {
    put({ id: `verification:${item.runHash}`, kind: "verification", address: item.address, runId: item.run.runId, runHash: item.runHash, status: "verified", result });
    for (const voucher of result.vouchers || []) {
      const previous = read().find((entry) => entry.id === `voucher:${voucher.digest}` && entry.address.toLowerCase() === item.address.toLowerCase());
      put({
        id: `voucher:${voucher.digest}`,
        address: item.address,
        kind: "voucher",
        voucher,
        runId: previous?.runId || item.run.runId,
        status: previous?.status || "verified"
      });
    }
    const capture = read().filter((entry) => entry.kind === "capture" && entry.run?.runId === item.run.runId && entry.address.toLowerCase() === item.address.toLowerCase());
    for (const entry of capture) {
      const voucher = (result.vouchers || []).find((value) => value.kind === "prize" && String(value.tokenId ?? value.voucher?.tokenId) === String(entry.capture.prize?.tokenId ?? entry.capture.tokenId));
      if (voucher) put({ ...entry, voucher, status: entry.status === "collected" ? "collected" : "verified" });
      else if (result.queue?.some((value) => value.status === "already-claimed" && String(value.tokenId) === String(entry.capture.prize?.tokenId ?? entry.capture.tokenId))) put({ ...entry, status: "collected" });
    }
  };
  return { read, put, accept };
}
var state;
function rewardState() {
  if (!state) state = createRewardState({ onChange: () => window.dispatchEvent(new CustomEvent("voyager:reward-history-changed")) });
  return state;
}

// src/js/pilots/reward-transfer.mjs
var ADDRESS2 = /^0x[\da-f]{40}$/i;
var BASE = { chainId: 8453, chainName: "Base", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: ["https://mainnet.base.org"], blockExplorerUrls: ["https://basescan.org"] };
function contractAddress(book, name) {
  const values = book?.contracts || book || {};
  const value = values[name] || values[name[0].toLowerCase() + name.slice(1)] || values.base?.[name] || values["8453"]?.[name];
  return typeof value === "string" ? value : value?.address || null;
}
async function rewardContract(entry, { wallet, ethers, fetchImpl = globalThis.fetch, address, readOnly = false } = {}) {
  if (!readOnly && !wallet?.snapshot?.().connected) throw new Error("Connect your Decent Pilot wallet with the header fox.");
  const response = await fetchImpl("./js/chain/addresses.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Claim contracts are not configured.");
  const bundle = entry.kind === "prize" && entry.protocol === "reward-bundle/1";
  const name = entry.kind === "stamp" ? "VoyagerStamps" : bundle ? "VoyagerRewards" : "VoyagerPrizes";
  const target = contractAddress(await response.json(), name);
  if (!ADDRESS2.test(target || "")) throw new Error(`${name} address is not configured.`);
  const provider = readOnly ? new ethers.JsonRpcProvider(BASE.rpcUrls[0], BASE.chainId) : await wallet.ensureChain(BASE);
  const signer = readOnly ? provider : await provider.getSigner();
  if (!readOnly && (await signer.getAddress()).toLowerCase() !== address?.toLowerCase()) throw new Error("Wallet changed; reconnect and retry.");
  const args = entry.voucher || entry;
  if (args.player?.toLowerCase() !== address?.toLowerCase()) throw new Error("This reward belongs to a different wallet.");
  const abi = entry.kind === "stamp" ? ["function mintWithVoucher(bytes32 gameId,(address player,bytes32 recordId,uint16 level,uint8 difficulty,string metadataURI,uint256 deadline) voucher,bytes signature)", "function usedRecordId(bytes32) view returns (bool)"] : bundle ? ["function claim((bytes32 gameId,address player,address nftContract,uint256 tokenId,uint256 nftAmount,address paymentToken,uint256 tokenAmount,uint256 nativeAmount,bytes32 awardId,bytes32 claimId,bytes32 recordId,uint256 deadline) reward,bytes signature)", "function claimedToken(address,address,uint256) view returns (bool)"] : ["function claim(bytes32 gameId,(address player,address nftContract,uint256 tokenId,uint8 tier,bytes32 runId,uint256 deadline) voucher,bytes signature)", "function claimedToken(address,uint256) view returns (bool)"];
  const contract = new ethers.Contract(target, abi, signer);
  const claimed = () => entry.kind === "stamp" ? contract.usedRecordId(args.recordId) : bundle ? contract.claimedToken(address, args.nftContract, args.tokenId) : contract.claimedToken(address, args.tokenId);
  return { contract, args, claimed, bundle, provider };
}
async function transferReward(entry, options = {}) {
  const { onStatus = () => {
  }, onSubmitted = () => {
  }, onConfirmed = () => {
  } } = options;
  const { contract, args, claimed, bundle } = await rewardContract(entry, options);
  if (await claimed()) {
    onConfirmed({ status: "collected" });
    onStatus("This reward was already collected on Base.");
    return;
  }
  if (!Number.isFinite(Number(args.deadline)) || Number(args.deadline) * 1e3 <= Date.now()) throw new Error("Reward voucher expired. It cannot be transferred as-is.");
  const signature = entry.signature || entry.sig;
  if (!signature) throw new Error("Reward voucher signature is missing.");
  const parameters = bundle ? [args, signature] : [options.ethers.id("decent-voyager"), args, signature];
  const method = entry.kind === "stamp" ? "mintWithVoucher" : "claim";
  const estimate = await contract[method].estimateGas(...parameters);
  if (options.wallet.snapshot().address?.toLowerCase() !== options.address?.toLowerCase()) throw new Error("Wallet changed before transfer; reconnect and retry.");
  onStatus("Approve the Base transfer in your wallet.");
  const tx = await contract[method](...parameters, { gasLimit: estimate * 120n / 100n });
  onSubmitted({ status: "submitted", txHash: tx.hash });
  onStatus("Transfer submitted. Waiting for Base confirmation...");
  let receipt;
  try {
    receipt = await tx.wait();
  } catch (error) {
    if (error.code !== "TRANSACTION_REPLACED" || error.cancelled || !error.receipt) throw error;
    receipt = error.receipt;
  }
  if (!receipt || Number(receipt.status) !== 1) throw new Error("Base transfer was not confirmed successfully.");
  if (!await claimed()) throw new Error("Base did not confirm the reward collection.");
  onConfirmed({ status: "collected", txHash: receipt.hash || tx.hash });
  onStatus("Collected! Base confirmed the transfer to your wallet.");
}

// src/js/pilots/flight-log.mjs
var pilot = { address: null, isPilot: false };
var records = [];
var captures = [];
var runId = null;
var promptedRun = null;
var outbox = createRunOutbox({ onAccepted: (item, result) => rewardState().accept(item, result), onChange: () => {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("voyager:flight-outbox-changed"));
} });
function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function logHash(runLog, ethers = globalThis.ethers) {
  if (!ethers?.keccak256 || !ethers?.toUtf8Bytes) throw new Error("Wallet signing library is unavailable");
  return ethers.keccak256(ethers.toUtf8Bytes(stableJson(runLog)));
}
function mountFlightLog({ getGame = () => window.voyager?.game || window.asteroidGame, getWallet = () => window.DecentHead?.getWallet?.(), onStatus = () => {
}, fetchImpl = globalThis.fetch } = {}) {
  const action = document.getElementById("flight-sign");
  const prompt = document.getElementById("flight-sign-prompt");
  const promptNote = document.getElementById("flight-sign-note");
  const status = document.getElementById("flight-status");
  const transferring = /* @__PURE__ */ new Set();
  let statusTimer = null;
  const notify = (text) => {
    clearTimeout(statusTimer);
    if (status) status.textContent = text;
    if (promptNote && prompt && !prompt.hidden && text && text !== "Referee flight ticket ready for your next launch.") promptNote.textContent = text;
    onStatus(text);
    if (text === "Referee flight ticket ready for your next launch.") {
      statusTimer = setTimeout(() => {
        if (status?.textContent === text) status.textContent = "";
        onStatus("");
      }, 5e3);
    }
  };
  const offerKey = "decent-voyager-recent-offers/1";
  const offers = () => {
    const value = JSON.parse(localStorage.getItem(offerKey) || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Saved Supporter offer history is invalid.");
    return value;
  };
  const tickets = createRunTicketManager({
    fetchImpl,
    getGame,
    onStatus: notify,
    getRecentOffers: (address) => offers()[address.toLowerCase()] || []
  });
  const refreshPrompt = () => {
    if (!prompt) return;
    const state2 = getGame()?.state;
    prompt.hidden = !action || action.hidden || !["gameOver", "victory"].includes(state2);
    prompt.toggleAttribute("data-victory", state2 === "victory");
  };
  window.setInterval(refreshPrompt, 250);
  const retryEvidence = () => {
    void outbox.retry().catch((error) => notify(error.message));
  };
  window.addEventListener("voyager:pilot", (event) => {
    pilot.address = event.detail?.address || null;
    pilot.isPilot = !!event.detail?.isPilot;
    tickets.setPilot(pilot);
    if (!pilot.isPilot && action) action.hidden = true;
    if (pilot.isPilot) retryEvidence();
  });
  window.setInterval(() => {
    if (pilot.isPilot && outbox.read().length) retryEvidence();
  }, 6e4);
  window.addEventListener("asteroid:event", (event) => {
    const detail = event.detail || {};
    if (detail.type === "vaultSpawned") {
      try {
        const game = getGame(), tokenId = game?.vault?.prize?.tokenId, address = game?.pilot?.address?.toLowerCase();
        if (address && Number.isSafeInteger(tokenId)) {
          const history = offers();
          history[address] = [...(history[address] || []).filter((token) => token !== tokenId), tokenId].slice(-2);
          localStorage.setItem(offerKey, JSON.stringify(history));
        }
      } catch (error) {
        notify(`Could not save Supporter rotation history: ${error.message}`);
      }
    }
    if (detail.type === "levelStart") {
      const currentId = getGame()?.getRunLog?.()?.runId || null;
      if (currentId && currentId !== runId) {
        records = [];
        captures = [];
        promptedRun = null;
        notify("");
        if (action) action.hidden = true;
        tickets.runStarted(currentId);
      }
      runId = currentId || runId;
    }
    if (detail.type === "levelRecord" && detail.record && !records.some((record) => record.id === detail.record.id)) {
      records.push(detail.record);
    }
    if (detail.type === "supporterCaptured") {
      captures.push(detail);
      queueMicrotask(() => {
        try {
          const run = getGame()?.getRunLog?.();
          if (pilot.address && run?.ticket) rewardState().put({
            id: `capture:${run.runId}:${detail.prize?.tokenId ?? detail.tokenId}`,
            kind: "capture",
            address: run.pilot.address,
            run,
            capture: detail,
            status: "captured"
          });
        } catch (error) {
          notify(`Could not save captured reward: ${error.message}`);
        }
      });
    }
    if (detail.type === "victory" || detail.type === "gameOver") {
      if (detail.type === "gameOver") void tickets.refresh();
      const game = getGame();
      runId = game?.getRunLog?.()?.runId || runId || `voyager-${Date.now()}`;
      if (pilot.isPilot && promptedRun !== runId && (records.some((record) => record.level === 20) || captures.length)) {
        promptedRun = runId;
        const hasTicket = !!game?.getRunLog?.()?.ticket;
        if (!hasTicket) notify("Rewards need a referee flight ticket. No ticket was attached; GitHub fallback: \u2625 profile \u2192 Flight Logs \u2192 Request mint on GitHub.");
        if (action) {
          action.hidden = !hasTicket;
          action.disabled = false;
          action.textContent = "Sign & collect rewards";
          if (promptNote) promptNote.textContent = "Verify this flight, then approve the Base transfer in your wallet.";
          action.onclick = async () => {
            action.disabled = true;
            action.textContent = "Confirm in your wallet";
            try {
              await signFlight();
              action.hidden = true;
            } catch (error) {
              notify(error.message);
              action.disabled = false;
              action.textContent = "Sign & collect rewards";
            } finally {
              refreshPrompt();
            }
          };
        }
      }
    }
    refreshPrompt();
  });
  async function transfer(entry, onStatus2 = notify) {
    if (!pilot.isPilot || !pilot.address) throw new Error("Decent Pilot wallet required.");
    const address = pilot.address;
    const identity = `${address.toLowerCase()}:${entry.digest}`;
    if (transferring.has(identity)) throw new Error("This reward transfer is already in progress. Check your wallet.");
    transferring.add(identity);
    try {
      const ethers = window.ethers || await (await import("./wallet-HETDYOBF.js")).loadEthers();
      const remember = (update) => {
        rewardState().put({ id: `voucher:${entry.digest}`, kind: "voucher", address, voucher: entry, ...update });
      };
      const previous = rewardState().read().find((item) => item.id === `voucher:${entry.digest}` && item.address.toLowerCase() === address.toLowerCase());
      if (previous?.status === "submitted") {
        const context = await rewardContract(entry, { ethers, address, fetchImpl, readOnly: true });
        try {
          if (await context.claimed()) {
            remember({ status: "collected", txHash: previous.txHash });
            onStatus2("Base confirmed this reward was collected.");
            return;
          }
          const receipt = await context.provider.getTransactionReceipt(previous.txHash);
          if (!receipt) throw new Error("Your transfer is still pending or its receipt is unavailable. Check the BaseScan link in Flight Logs; no duplicate transaction was sent.");
          if (Number(receipt.status) === 1) throw new Error("Transaction succeeded but reward collection is not confirmed. Inspect its BaseScan receipt before retrying.");
          remember({ status: "verified", txHash: previous.txHash });
        } finally {
          context.provider.destroy?.();
        }
      }
      await transferReward(entry, { wallet: getWallet(), address, ethers, fetchImpl, onStatus: onStatus2, onSubmitted: remember, onConfirmed: remember });
    } finally {
      transferring.delete(identity);
    }
  }
  async function retryAndCollect(onStatus2 = notify) {
    if (!pilot.isPilot || !pilot.address) throw new Error("Decent Pilot wallet required.");
    const address = pilot.address;
    await outbox.retry();
    if (pilot.address !== address) throw new Error("Wallet changed; reconnect and retry.");
    const pending = outbox.read().filter((entry) => entry.address.toLowerCase() === address.toLowerCase());
    if (pending.length) throw new Error(`Verification is queued. ${pending[0].lastError || ""}`);
    const entries = rewardState().read().filter((entry) => entry.kind === "voucher" && entry.address.toLowerCase() === address.toLowerCase() && entry.status !== "collected");
    for (const entry of entries) await transfer(entry.voucher, onStatus2);
    if (!entries.length) onStatus2("No uncollected verified rewards. Open Flight Logs to inspect past captures.");
  }
  async function signFlight({ runLog: savedRun, checkpoint = false, tokenId, onStatus: onStatus2 = notify } = {}) {
    if (!pilot.isPilot || !pilot.address) throw new Error("Decent Pilot wallet required");
    const session = getWallet(), game = getGame();
    if (!session?.browserProvider || !game?.getRunLog) throw new Error("Wallet or flight log is unavailable");
    const runLog = savedRun || game.getRunLog();
    if (!runLog || typeof runLog !== "object") throw new Error("Run log is unavailable");
    if (!runLog.ticket) throw new Error("Rewards need a referee flight ticket. GitHub fallback: \u2625 profile \u2192 Flight Logs \u2192 Request mint on GitHub.");
    if (runLog.pilot?.address?.toLowerCase() !== pilot.address.toLowerCase()) throw new Error("This captured flight belongs to a different wallet.");
    const address = pilot.address;
    const ethers = window.ethers || await (await import("./wallet-HETDYOBF.js")).loadEthers();
    const runHash = logHash(runLog, ethers);
    const state2 = rewardState();
    const verified = () => state2.read().find((entry) => entry.id === `verification:${runHash}` && entry.address.toLowerCase() === address.toLowerCase());
    if (!verified()) {
      const queued = outbox.read().find((entry) => entry.runHash === runHash && entry.address.toLowerCase() === address.toLowerCase());
      let signature = queued?.signature;
      if (!signature) {
        const signer = await session.browserProvider.getSigner();
        if ((await signer.getAddress()).toLowerCase() !== address.toLowerCase()) throw new Error("Wallet changed; reconnect and retry");
        onStatus2("Sign the captured flight evidence in your wallet.");
        signature = await signer.signMessage(runHash);
      }
      if (pilot.address !== address) throw new Error("Wallet changed; reconnect and retry.");
      onStatus2("Verifying the flight with the referee...");
      await outbox.enqueue({ address, run: runLog, runHash, signature, checkpoint });
    }
    const result = verified()?.result;
    if (!result) throw new Error(`Signed evidence saved; verification is queued. ${outbox.read().find((entry) => entry.runHash === runHash)?.lastError || "Retry from Flight Logs."}`);
    if (pilot.address !== address) throw new Error("Wallet changed; reconnect and retry.");
    const entries = (result.vouchers || []).filter((entry) => tokenId == null || entry.kind === "prize" && String(entry.tokenId ?? entry.voucher?.tokenId) === String(tokenId));
    for (const entry of entries) await transfer(entry, onStatus2);
    if (!entries.length) {
      if (result.queue?.some((entry) => entry.status === "already-claimed")) onStatus2("Base reports these captured rewards were already collected.");
      else throw new Error("No transferable reward was returned. Your evidence is saved; inspect Flight Logs.");
    }
    return result;
  }
  return { signFlight, transfer, retryAndCollect, outbox, tickets, records: () => [...records], captures: () => [...captures] };
}
var flightLog = typeof window !== "undefined" && typeof document !== "undefined" ? mountFlightLog() : null;

export {
  node,
  button,
  link,
  createDialog,
  bindBackdropClose,
  openDialog,
  pilotController,
  OUTBOX_KEY,
  REWARD_KEY,
  rewardState,
  rewardContract,
  flightLog
};
