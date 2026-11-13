import {
  OUTBOX_KEY,
  REWARD_KEY,
  bindBackdropClose,
  button,
  createDialog,
  flightLog,
  link,
  node,
  openDialog,
  rewardContract,
  rewardState
} from "./chunks/chunk-LZ47OUS6.js";

// src/js/shell/about-modal.mjs
var Base = globalThis.HTMLElement || class {
};
var art = (name) => new URL(`../../assets/${name}`, new URL("js/shell/about-modal.mjs", document.baseURI).href).href;
var ZERO = "0x0000000000000000000000000000000000000000";
var ESCROW_ABI = [
  "function getListing(uint256) view returns (tuple(address nftContract,uint256 tokenId,uint256 priceETH,address priceToken,uint256 priceAmount,uint256 available,bool active,string note))",
  "function getNFTBalance(address,uint256) view returns (uint256)",
  "function purchaseWithETH(uint256,uint256) payable",
  "function purchaseWithToken(uint256,uint256)"
];
var ERC20_ABI = ["function allowance(address,address) view returns (uint256)", "function approve(address,uint256) returns (bool)", "function decimals() view returns (uint8)", "function symbol() view returns (string)"];
var ABOUT = {
  tagline: "Navigate the cosmic fabric. Every sector you clear is stamped into your flight record.",
  stats: [["20", "levels across two sectors"], ["3", "difficulties \xB7 Cadet \u2192 Ace"], ["5", "ships per battle group"]],
  mission: "Decent Voyager is the DecentAgency arcade: an 8-bit gauntlet with modern firepower. Fly through drifting Mandelblum fields, blast the cores that shoot back, grab weapon upgrades, and survive to the end of each level. Levels 10 and 20 end with a giant Mandelblum boss that locks the gate until destroyed. Expect a few minutes of combat: the core limits damage throughput, so aim steadily and dodge the fan shots. Gold laser lanes warn for 1.5 seconds before firing; move out before they turn pink. Level 20 has twin lasers and a wider fan. Cadet ends at level 10; Pilot and Ace continue through level 20, with no wallet or Supporter capture needed. Clear level 10 or 20 and the Mandelblum elephant escort salutes you. Decent Pilots fly for real rewards.",
  rewards: [
    { icon: "\u25C8", title: "Level 20 achievement NFT", body: "Only completing level 20 on Pilot or Ace earns a new achievement NFT. Earlier levels keep their battle records and stats without minting an NFT. The final achievement carries the date, time, difficulty, telemetry and battle rendering; a full solo marathon also records all 20 levels. Cadet flights are practice only.", note: "Choose Sign & collect rewards after the flight: sign evidence, then approve the Base transfer. Return to Flight Logs with the same wallet to collect later or inspect past NFTs." },
    { icon: "\u2B22", title: "Guarded Supporter pickups", body: "New referee-ticket flights rotate six affordable 10-USDC projects: DecentHead, DecentMarket, DecentCalendar, DecentPilgrimages, DecentCanopy and DecentVoyager. An easier four-guard pickup appears in level 9 or 10; a stronger eight-guard pickup appears in level 17, 18 or 19. Destroy every guard and fly through the token. The ticket fixes a different project for each encounter; recent offers help avoid repeats across flights.", note: "Each capture refills power. Project and Supporter purchase links are in the presentation and Flight Logs. BigNuten is reserved for Perfect Pilot so an earlier pickup cannot block its BNut bonus; rare 100-USDC Busking remains exclusive to Perfect Ace. Older tickets and online arenas retain their original encounter schedule. Transfers require funded custody and referee verification." },
    { icon: "\u2726", title: "Marathon and Perfect awards", body: "Finish all 20 levels in one solo Ace run for a Voyager Supporter award. Perfect Ace also requires zero lives lost and both guarded pickups: earn the rare DecentBusking Supporter. Perfect Pilot uses the same full-run rules at Pilot difficulty: earn a BigNuten Supporter plus 100 BNut in one atomic claim. Cadets earn practice and confidence, not tokens.", note: "The level-20 receipt records full-run stats and award references. References are not transfer receipts. The Voyager multi-asset escrow transfers the Perfect Pilot NFT and BNut together or reverts both. Limited reserves must be funded before rewards are claimable." },
    { icon: "\u2736", title: "Sector II \xB7 Far Future", body: "Clear level 10 on Pilot or Ace and automatically warp into levels 11\u201320, a further-future sector with new Mandelblums and wilder weapons: Prism Splitter, Singularity, and a brighter Nova. Guest flights continue too; Cadet ends at level 10.", note: "Your progress saves locally and can be backed up to IPFS." },
    { icon: "\u2694", title: "Arena pot", body: "Online battles cost $10 USDC per pilot. Every pilot who makes it to the end splits the pot. Pilots who go down forfeit their entry to the survivors.", note: "Couch battles on one screen are always free." }
  ],
  school: [
    { key: "\u2190\u2191\u2192\u2193 / WASD", text: "Fly. On the start screen \u2191/\u2193 picks a difficulty. Every new voyage starts at level 1; game over ends the run, not just the level." },
    { key: "Space", text: "Fire. Hold for continuous fire." },
    { key: "B \xB7 hold", text: "Charge the Nova cannon, then release for a big blast." },
    { key: "E", text: "Cycle collected weapons. On a phone use Next weapon; hold Fire to keep shooting. Tilt is optional and requires permission." },
    { key: "V", text: "Switch between the overview map and the cockpit POV, where the field rushes toward you." },
    { key: "P \xB7 M \xB7 C", text: "Pause, mute, and toggle the CRT glow." },
    { key: "\u{1F3AE}", text: "Gamepads sync automatically. Press A to join; stick to fly, A to fire, B to charge." }
  ],
  pickups: [
    { img: "brand/voyager-disc.png", text: "Fly through glowing capsules for upgrades: S Spread Cannon, R Rapid Laser, P Plasma Lance, O Shield." },
    { img: "vendor-breathe", text: "The breathing ENS\xB7ETH emblem refills your power bar." },
    { img: "game/white-lotus-clear.png", text: "The spinning, glowing White Lotus grants one extra life to the collecting ship, with an original arcade fanfare and +1-life light show. Find one in levels 3, 7, 12 and 16 for a second chance." },
    { img: "game/mini-emblem-sheet.png", sheet: true, text: "The spinning Mini emblem flies down at you in levels 5, 9, 14 and 18. Catch it to shrink your ship to half size; five hits bring you back to full size. Hits still cost power, shield-blocked hits do not count, and losing a life ends Mini mode." },
    { img: null, text: "Orange cores shoot back. Clear them before the gauntlet reaches you." }
  ],
  couch: [
    "On the start screen choose Multiplayer battle \u2192 Same screen.",
    "Pick Co-op (one team) or Versus (individual scores), a difficulty, and 2\u20135 ships.",
    "Each extra pilot presses A on a gamepad, or shares the keyboard.",
    "Launch. Ships shrink a little when three or more fly together."
  ],
  online: [
    { title: "Connect", text: "Click the fox in the header. Online rounds are for Decent Pilots on the DecentAgency list." },
    { title: "Choose", text: "Start screen \u2192 Multiplayer battle \u2192 Online round. Pick Co-op or Versus and a difficulty." },
    { title: "Pair up", text: "Random pairing joins the next open round or opens a new one. Invite wallets locks the round to the addresses or ENS names you list. Join by round # uses an ID a friend shared." },
    { title: "Pay in", text: "Approve $10 USDC on Base and join the round, then sign a free session message. Your wallet shows every step." },
    { title: "Launch", text: "The pilot who opened the round presses Start when everyone is in. Up to five ships fly per group; extra pilots start a new group." },
    { title: "Survive", text: "Reach the end alive and claim your share with Claim payout. If a round expires before launch, Claim refund returns your $10." }
  ],
  pilots: "Wallet features (level 20 achievement NFTs, Supporter Vaults, Sector II rewards and online rounds) are open to whitelisted DecentAgency collaborators, the Decent Pilots. Not on the list yet? Ask in the DecentAgency Discord. Local play stays free: Cadet has 10 levels; Pilot and Ace have 20, with or without a wallet.",
  saving: "Your progress lives in this browser even without a wallet. Before launching, the game reminds you to connect for rewards. The larger wallet orb turns green when connected; Pilot difficulty alone does not mean your wallet is a Decent Pilot. Reward flights wait for Pilot verification and a referee ticket. Captured Supporter DNFTs show their metadata artwork, name, project and Canopy links in a briefing. Local play pauses; the online referee continues. Choose Collect to wallet there: sign the captured checkpoint, then approve the Base transfer and pay gas. No extra menu is needed. Or dismiss and collect later in Flight Logs, where saved captures and confirmed transfer history appear alongside your battle stats. A wallet connection or signature alone is not a transfer. Use the larger left IPFS orb to back up or restore game progress with your own pinning provider; pending reward checkpoints and transaction history remain on this device. Connecting does not automatically pin stats. IPFS is public, so only game progress is exported.",
  recovery: "Busy battles reduce cosmetic load without removing hazards. Glow sprites use a bounded, reusable cache, and HUD and win-screen text uses a built-in pixel font snapped to your screen\u2019s pixels, so it stays sharp and changing scores create no new graphics surfaces. A long stall pauses solo/local play; use P, the mobile Pause/resume control, or Resume battle in the active warning\u2019s Error details panel. Online rounds continue on the referee. Close-up hit glints are subdued and full-screen flashes are replaced with edge pulses. Graphics loss releases cached surfaces; when the browser restores graphics the game redraws by itself at reduced resolution and stays paused until you press P or Resume battle.",
  diagnostics: "An active fault warning offers Error details to download a bounded local diagnostic report with build/ruleset, recent errors, stack locations, battle state, entity counts, canvas size and graphics-resource samples every 15 seconds of active play. Cache counts, allocation totals and estimated surface bytes help diagnose gradual growth; these are not measurements of actual GPU memory or utilization. Reports survive reloads when browser storage is available. Wallet addresses, signatures, pinning credentials, replay inputs and save data are not collected. Nothing is sent automatically; review the JSON before sharing it with a bug issue. Your saved gameplay totals and battle cards are in Flight Logs, the first right-ankh menu entry."
};
var esc = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
var safe = (value) => {
  try {
    const url = new URL(value, location.href);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};
var chips = (items) => (items || []).map((item) => safe(item.url) ? `<a class="chip" href="${esc(safe(item.url))}" target="_blank" rel="noopener noreferrer">${esc(item.label)}</a>` : "").join("");
var STYLE = `
:host { --blue:#56edff; --green:#7dff8c; --gold:#ffe65c; --silver:#c9d6e3; --ink:#e8f2ff; --muted:#9fb4c8; }
dialog { box-sizing:border-box; width:min(1080px,calc(100vw - 24px)); max-height:calc(100dvh - 24px); padding:0; border:1px solid #56edff55; border-radius:24px; color:var(--ink);
  background:radial-gradient(ellipse at 80% -10%,#123a4a 0,transparent 55%),radial-gradient(ellipse at -10% 90%,#0f3326 0,transparent 50%),#060b18;
  box-shadow:0 0 0 1px #c9d6e318,0 30px 120px #000d,0 0 80px #56edff1c; font:15px/1.7 system-ui,-apple-system,'Segoe UI',sans-serif; overflow:auto; overscroll-behavior:contain; }
dialog[open] { animation:rise .45s cubic-bezier(.2,.8,.2,1); }
dialog::backdrop { background:#01040bcc; backdrop-filter:blur(6px); }
.close { position:sticky; top:14px; float:right; margin:14px 14px 0 0; z-index:3; width:42px; height:42px; border-radius:50%; border:1px solid #c9d6e366; background:#0b1428e6; color:var(--ink); font-size:22px; cursor:pointer; }
.close:hover { border-color:var(--gold); color:var(--gold); }
:focus-visible { outline:2px solid var(--gold); outline-offset:3px; }
.hero { position:relative; display:grid; grid-template-columns:minmax(0,1fr) 260px; gap:40px; align-items:center; padding:64px 64px 40px; overflow:hidden; }
.hero::before { content:''; position:absolute; inset:0; pointer-events:none; opacity:.5; background-image:radial-gradient(#c9e9ff 1px,transparent 1.4px),radial-gradient(#7dff8c 1px,transparent 1.4px); background-size:73px 73px,121px 121px; background-position:9px 17px,41px 53px; animation:twinkle 6s ease-in-out infinite; }
.eyebrow { font:700 11px/1 ui-monospace,Menlo,monospace; letter-spacing:.3em; color:var(--green); text-transform:uppercase; }
h1 { margin:14px 0 10px; font:800 clamp(34px,6vw,62px)/1.02 ui-monospace,Menlo,monospace; letter-spacing:-.01em;
  background:linear-gradient(100deg,#ffffff 0%,var(--silver) 30%,var(--blue) 60%,var(--green) 100%); -webkit-background-clip:text; background-clip:text; color:transparent; filter:drop-shadow(0 0 22px #56edff40); }
.tagline { font-size:19px; color:#d6e6f5; max-width:34ch; margin:0; }
.stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin-top:30px; max-width:520px; }
.stat { padding:12px 14px; border:1px solid #c9d6e330; border-radius:14px; background:#0b1630b3; }
.stat b { display:block; font:800 28px/1 ui-monospace,Menlo,monospace; color:var(--gold); }
.stat span { font-size:12px; color:var(--muted); }
.disc { position:relative; width:240px; aspect-ratio:1; justify-self:center; }
.disc img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; animation:spin 40s linear infinite; filter:drop-shadow(0 0 30px #56edff70) drop-shadow(0 0 60px #7dff8c30); }
.disc::after { content:''; position:absolute; inset:-16px; border-radius:50%; border:1px dashed #ffe65c55; animation:spin 60s linear infinite reverse; }
section { padding:40px 64px; border-top:1px solid #c9d6e314; animation:fade .6s both; }
section:nth-of-type(2) { animation-delay:.05s } section:nth-of-type(3) { animation-delay:.1s } section:nth-of-type(4) { animation-delay:.15s }
h2 { margin:0 0 22px; font:800 13px/1 ui-monospace,Menlo,monospace; letter-spacing:.28em; text-transform:uppercase; color:var(--blue); display:flex; align-items:center; gap:14px; }
h2::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,#56edff55,transparent); }
p { margin:0 0 14px; } .lead { font-size:17px; color:#d6e6f5; max-width:70ch; }
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:18px; }
.card { position:relative; padding:24px; border:1px solid #c9d6e324; border-radius:18px; background:linear-gradient(160deg,#0e1d36d9,#08111fd9); transition:transform .25s,border-color .25s,box-shadow .25s; }
.card:hover { transform:translateY(-3px); border-color:#56edff70; box-shadow:0 12px 40px #0008,0 0 24px #56edff18; }
.card .icon { font:800 26px/1 ui-monospace,Menlo,monospace; color:var(--gold); text-shadow:0 0 14px #ffe65c80; }
.card h3 { margin:14px 0 8px; font-size:17px; color:#fff; }
.card p { font-size:14px; color:#c3d3e3; }
.card small { display:block; margin-top:12px; padding-top:12px; border-top:1px dashed #c9d6e328; color:var(--green); font-size:12.5px; }
.keys { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:12px 28px; }
.key { display:flex; gap:16px; align-items:baseline; }
kbd { flex:none; min-width:112px; text-align:center; padding:6px 10px; border:1px solid #c9d6e355; border-bottom-width:3px; border-radius:9px; background:#0b1630; font:700 12px ui-monospace,Menlo,monospace; color:var(--gold); }
.pickups { display:flex; flex-wrap:wrap; gap:14px; margin-top:22px; }
.pickup { flex:1 1 240px; display:flex; gap:12px; align-items:center; padding:12px 14px; border-radius:14px; background:#0b1630a8; border:1px solid #7dff8c2a; font-size:13.5px; color:#c3d3e3; }
.pickup img { width:34px; height:34px; object-fit:contain; } .pickup img.sheet { object-fit:cover; object-position:0 50%; animation:about-sheet 1s steps(12, jump-none) infinite; }
@keyframes about-sheet { to { object-position:100% 50%; } }
.pickup .dot { width:14px; height:14px; margin:0 10px; border-radius:50%; background:#fff1c2; box-shadow:0 0 12px 5px #ff5a1c; flex:none; }
.modes { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.5fr); gap:22px; }
.track { padding:26px; border-radius:18px; border:1px solid #c9d6e324; background:#0a1428c0; }
.track h3 { margin:0 0 4px; font-size:18px; } .track .price { font:700 12px ui-monospace,Menlo,monospace; letter-spacing:.12em; color:var(--green); text-transform:uppercase; }
.track.online .price { color:var(--gold); }
ol { list-style:none; counter-reset:step; margin:18px 0 0; padding:0; }
ol li { counter-increment:step; position:relative; padding:0 0 18px 48px; font-size:14px; color:#c3d3e3; }
ol li::before { content:counter(step); position:absolute; left:0; top:-2px; width:30px; height:30px; display:grid; place-items:center; border-radius:50%; font:800 13px ui-monospace,Menlo,monospace; color:#04101a; background:linear-gradient(135deg,var(--blue),var(--green)); box-shadow:0 0 14px #56edff55; }
ol li:not(:last-child)::after { content:''; position:absolute; left:14.5px; top:30px; bottom:2px; width:1px; background:#56edff40; }
.online ol li::before { background:linear-gradient(135deg,var(--gold),var(--green)); box-shadow:0 0 14px #ffe65c55; }
ol li strong { color:#fff; display:block; }
.supporter { display:grid; grid-template-columns:200px minmax(0,1fr); gap:32px; align-items:center; padding:30px; border-radius:22px; border:1px solid #ffe65c55;
  background:radial-gradient(ellipse at 0 50%,#ffe65c14,transparent 60%),linear-gradient(140deg,#121c30,#0a1422); box-shadow:inset 0 0 40px #ffe65c0c; }
.token { position:relative; aspect-ratio:1; border-radius:20px; display:grid; place-items:center; background:radial-gradient(circle,#173248,#070d18 70%); border:1px solid #c9d6e340; overflow:hidden; }
.token img { width:78%; filter:drop-shadow(0 0 22px #ffe65c66); animation:float 5s ease-in-out infinite; }
.token.card-art img { width:100%; border-radius:18px; filter:drop-shadow(0 0 18px #5ad8ff55); }
.token::after { content:''; position:absolute; inset:0; background:linear-gradient(115deg,transparent 35%,#ffffff22 50%,transparent 65%); animation:sheen 4.5s ease-in-out infinite; }
.badge { display:inline-block; padding:5px 12px; border-radius:99px; font:800 11px/1 ui-monospace,Menlo,monospace; letter-spacing:.2em; text-transform:uppercase; color:#04101a; background:var(--gold); box-shadow:0 0 18px #ffe65c66; }
.badge.live { background:var(--green); box-shadow:0 0 18px #7dff8c66; }
.supporter h3 { margin:14px 0 8px; font-size:24px; }
.buy { margin-top:8px; padding:13px 26px; border:0; border-radius:12px; cursor:pointer; font:800 15px system-ui; color:#04101a; background:linear-gradient(120deg,var(--gold),var(--green)); box-shadow:0 8px 30px #7dff8c33; }
.buy:disabled { opacity:.5; cursor:wait; }
.quiet { font-size:12.5px; color:var(--muted); overflow-wrap:anywhere; }
.duo { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:22px; }
.panel { padding:24px; border-radius:18px; border:1px solid #c9d6e324; background:#0a1428a8; }
.panel h3 { margin:0 0 10px; font-size:16px; color:#fff; } .panel p { font-size:14px; color:#c3d3e3; margin:0; }
.chips { display:flex; flex-wrap:wrap; gap:10px; }
.chip { padding:9px 15px; border-radius:99px; border:1px solid #56edff45; color:#dff6ff; text-decoration:none; font-size:13.5px; background:#0b1630; transition:border-color .2s,color .2s; }
.chip:hover { border-color:var(--gold); color:var(--gold); }
footer { padding:28px 64px 40px; text-align:center; font-size:12.5px; color:var(--muted); border-top:1px solid #c9d6e314; }
@keyframes spin { to { transform:rotate(360deg); } }
@keyframes float { 50% { transform:translateY(-8px) rotate(4deg); } }
@keyframes sheen { 0%,60% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
@keyframes twinkle { 50% { opacity:.25; } }
@keyframes fade { from { opacity:0; transform:translateY(14px); } }
@keyframes rise { from { opacity:0; transform:translateY(24px) scale(.98); } }
@media (max-width:760px) { .hero { grid-template-columns:1fr; padding:56px 22px 28px; gap:24px; } .disc { width:170px; grid-row:1; } section { padding:30px 22px; } footer { padding:24px 22px 32px; } .modes,.supporter { grid-template-columns:1fr; } .supporter { padding:22px; } .token { max-width:200px; } kbd { min-width:92px; } }
@media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none !important; transition:none !important; } }
`;
var VoyagerAbout = class extends Base {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.render();
  }
  open() {
    this.render();
    this.shadowRoot.querySelector("dialog").showModal();
    this.shadowRoot.querySelector("dialog").scrollTop = 0;
    void this.refreshListing();
  }
  close() {
    this.shadowRoot.querySelector("dialog")?.close();
  }
  render() {
    const config = window.DECENT_CONFIG || {}, supporter = config.supporterDnft;
    const listed = !!(supporter && supporter.escrowAddress && supporter.listingId !== void 0 && supporter.contract);
    const breathe = art("../vendor/decent-head/2.0.0/img/Ens_Eth_Breathe.png");
    const tokenTitle = supporter?.title || "Decent Voyager Supporter DNFT";
    this.shadowRoot.innerHTML = `<style>${STYLE}</style><dialog aria-labelledby="about-title">
      <button class="close" type="button" aria-label="Close">\xD7</button>
      <div class="hero"><div>
        <div class="eyebrow">DecentAgency \xB7 Galactic Gauntlet</div>
        <h1 id="about-title">Decent Voyager</h1>
        <p class="tagline">${esc(ABOUT.tagline)}</p>
        <div class="stats">${ABOUT.stats.map(([value, label]) => `<div class="stat"><b>${esc(value)}</b><span>${esc(label)}</span></div>`).join("")}</div>
      </div><div class="disc" aria-hidden="true"><img src="${esc(art("brand/voyager-disc.png"))}" alt=""></div></div>
      <section aria-labelledby="mission"><h2 id="mission">The mission</h2><p class="lead">${esc(ABOUT.mission)}</p></section>
      <section aria-labelledby="rewards"><h2 id="rewards">What you earn</h2><div class="grid">
        ${ABOUT.rewards.map((item) => `<article class="card"><div class="icon" aria-hidden="true">${esc(item.icon)}</div><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p><small>${esc(item.note)}</small></article>`).join("")}
      </div></section>
      <section aria-labelledby="school"><h2 id="school">Flight school</h2>
        <div class="keys">${ABOUT.school.map((item) => `<div class="key"><kbd>${esc(item.key)}</kbd><span>${esc(item.text)}</span></div>`).join("")}</div>
        <div class="pickups">${ABOUT.pickups.map((item) => `<div class="pickup">${item.img === "vendor-breathe" ? `<img src="${esc(breathe)}" alt="">` : item.img ? `<img${item.sheet ? ' class="sheet"' : ""} src="${esc(art(item.img))}" alt="">` : '<span class="dot" aria-hidden="true"></span>'}<span>${esc(item.text)}</span></div>`).join("")}</div>
      </section>
      <section aria-labelledby="multiplayer"><h2 id="multiplayer">Multiplayer walkthrough</h2><div class="modes">
        <div class="track"><h3>Same screen</h3><div class="price">Free \xB7 2\u20135 ships</div><ol>${ABOUT.couch.map((step) => `<li>${esc(step)}</li>`).join("")}</ol></div>
        <div class="track online"><h3>Online round</h3><div class="price">$10 USDC \xB7 winners split the pot</div><ol>${ABOUT.online.map((step) => `<li><strong>${esc(step.title)}</strong>${esc(step.text)}</li>`).join("")}</ol></div>
      </div></section>
      <section aria-labelledby="support"><h2 id="support">Support the voyage</h2><div class="supporter">
        <div class="token${listed && supporter.image ? " card-art" : ""}"><img src="${esc(art(listed && supporter.image ? supporter.image : "brand/voyager-disc.png"))}" alt="Decent Voyager supporter token art"></div>
        <div><span class="badge ${listed ? "live" : ""}">${listed ? "Available now" : "Coming soon"}</span>
          <h3>${esc(tokenTitle)}</h3>
          <p>${listed ? "Back Decent Voyager directly. The token is held in the DecentMarket escrow on Base and transfers to your wallet when you buy." : "The Decent Voyager Supporter DNFT is being minted. Supporters fund new sectors, weapons, and arena prizes, and join the DecentAgency payroll family. It will be purchasable right here when it lands."}</p>
          ${listed ? `<p class="quiet" id="listing">Checking the escrow listing\u2026</p><button class="buy" id="buy" type="button">Buy supporter DNFT</button>` : `<p class="quiet">Until then you can win Supporter tokens from DecentHead, DecentMarket, DecentBusking, BigNuten, DecentCanopy, and Decent Pilgrimages in Ace-mode vaults.</p>`}
          ${listed && safe(supporter.marketUrl) ? `<p style="margin-top:16px"><a class="chip" href="${esc(safe(supporter.marketUrl))}" target="_blank" rel="noopener noreferrer">View on DecentMarket</a></p>` : ""}
          <p class="quiet" id="purchase-status" role="status" aria-live="polite"></p>
        </div></div></section>
      <section aria-labelledby="pilots"><h2 id="pilots">Pilots &amp; your data</h2><div class="duo">
        <div class="panel"><h3>Decent Pilots</h3><p>${esc(ABOUT.pilots)}</p></div>
        <div class="panel"><h3>Save to IPFS</h3><p>${esc(ABOUT.saving)}</p></div>
      </div></section>
      <section aria-labelledby="recovery"><h2 id="recovery">Performance &amp; flight reports</h2>
        <p>${esc(ABOUT.recovery)}</p><p>${esc(ABOUT.diagnostics)}</p>
        <p class="quiet">White Lotus lives do not erase lives lost for Perfect awards. Game over starts a fresh level-1 voyage; saved best scores and historical battle records remain. Phone controls work without a wallet; actual MetaMask/iPhone testing is device-specific.</p>
      </section>
      <section aria-labelledby="links"><h2 id="links">Project links</h2><div class="chips">${chips(config.links)}${chips(config.relatedDapps)}</div></section>
      <footer>Another Decent Frankenstein brought to you by TheJollyLaMa and A Decent Agency</footer>
    </dialog>`;
    const dialog2 = this.shadowRoot.querySelector("dialog");
    this.shadowRoot.querySelector(".close").addEventListener("click", () => dialog2.close());
    bindBackdropClose(dialog2);
    for (const type of ["keydown", "keyup"]) dialog2.addEventListener(type, (event) => {
      if (event.key !== "Escape") event.stopPropagation();
    });
    this.shadowRoot.querySelector("#buy")?.addEventListener("click", () => void this.buy());
  }
  status(message) {
    const node2 = this.shadowRoot.querySelector("#purchase-status");
    if (node2) node2.textContent = message;
  }
  async ethers() {
    return window.ethers || (await import("./chunks/wallet-HETDYOBF.js")).loadEthers();
  }
  async refreshListing() {
    const cfg = window.DECENT_CONFIG?.supporterDnft, label = this.shadowRoot.querySelector("#listing");
    if (!label || !cfg) return;
    try {
      const ethers = await this.ethers(), rpc = cfg.chain?.rpcUrls?.[0] || window.DECENT_CONFIG?.chain?.rpcUrls?.[0];
      const escrow = new ethers.Contract(cfg.escrowAddress, ESCROW_ABI, new ethers.JsonRpcProvider(rpc));
      const listing = await escrow.getListing(cfg.listingId);
      if (!listing.active || listing.available < 1n) {
        label.textContent = "Sold out for now. Check back soon.";
        this.shadowRoot.querySelector("#buy").disabled = true;
        return;
      }
      let price = `${ethers.formatEther(listing.priceETH)} ETH`;
      if (listing.priceETH === 0n) {
        const tokenAddress = listing.priceToken === ZERO ? cfg.paymentToken : listing.priceToken;
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, escrow.runner);
        const [decimals, symbol] = await Promise.all([token.decimals(), token.symbol()]);
        price = `${ethers.formatUnits(listing.priceAmount, decimals)} ${symbol}`;
      }
      label.textContent = `${price} \xB7 ${listing.available} available on Base`;
    } catch {
      label.textContent = "Listing details are unavailable right now; the purchase step re-checks escrow before you sign.";
    }
  }
  async buy() {
    const cfg = window.DECENT_CONFIG?.supporterDnft, button2 = this.shadowRoot.querySelector("#buy");
    if (!cfg || this.busy) return;
    this.busy = true;
    button2.disabled = true;
    try {
      const wallet = window.DecentHead?.getWallet?.();
      if (!wallet) throw new Error("Wallet is unavailable. Reload and try again.");
      if (!wallet.snapshot().connected) await wallet.connect();
      const provider = await wallet.ensureChain(cfg.chain || window.DECENT_CONFIG.chain);
      const ethers = await this.ethers(), signer = await provider.getSigner();
      const escrow = new ethers.Contract(cfg.escrowAddress, ESCROW_ABI, signer);
      this.status("Checking the listing and escrow stock\u2026");
      const listing = await escrow.getListing(cfg.listingId);
      if (listing.nftContract.toLowerCase() !== cfg.contract.toLowerCase() || listing.tokenId !== BigInt(cfg.tokenId)) throw new Error("This listing does not match the Decent Voyager supporter token.");
      if (!listing.active || listing.available < 1n || await escrow.getNFTBalance(cfg.contract, cfg.tokenId) < 1n) throw new Error("The supporter token is not available in escrow right now.");
      if (cfg.expectedPriceAmount !== void 0 && (listing.priceETH !== 0n || listing.priceAmount !== BigInt(cfg.expectedPriceAmount))) throw new Error("The listing price changed. Reopen the About to review it.");
      let tx;
      if (listing.priceETH > 0n) {
        if (!window.confirm(`Buy one supporter DNFT for ${ethers.formatEther(listing.priceETH)} ETH? Review the transaction in your wallet.`)) {
          this.status("Cancelled.");
          return;
        }
        tx = await escrow.purchaseWithETH(cfg.listingId, 1, { value: listing.priceETH });
      } else {
        const tokenAddress = listing.priceToken === ZERO ? cfg.paymentToken : listing.priceToken;
        if (!tokenAddress || tokenAddress === ZERO) throw new Error("The escrow payment token is not configured.");
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const [decimals, symbol] = await Promise.all([token.decimals(), token.symbol()]);
        if (!window.confirm(`Buy one supporter DNFT for ${ethers.formatUnits(listing.priceAmount, decimals)} ${symbol}? Review each wallet step.`)) {
          this.status("Cancelled.");
          return;
        }
        const buyer = await signer.getAddress();
        if (await token.allowance(buyer, cfg.escrowAddress) < listing.priceAmount) {
          this.status(`Approve exactly ${ethers.formatUnits(listing.priceAmount, decimals)} ${symbol} in your wallet\u2026`);
          await (await token.approve(cfg.escrowAddress, listing.priceAmount)).wait();
        }
        tx = await escrow.purchaseWithToken(cfg.listingId, 1);
      }
      this.status("Waiting for confirmation\u2026");
      await tx.wait();
      this.status(`Welcome aboard, supporter! Transaction ${tx.hash}`);
    } catch (error) {
      this.status(error.shortMessage || error.message);
    } finally {
      this.busy = false;
      button2.disabled = false;
    }
  }
};
if (globalThis.customElements && !customElements.get("about-modal")) customElements.define("about-modal", VoyagerAbout);

// src/js/shell/ipfs-save.mjs
var CID_KEY = "asteroid.ipfs.last-cid.v1";
var MAX_SAVE_BYTES = 4 * 1024 * 1024;
var validCID = (cid) => typeof cid === "string" && /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{20,})$/.test(cid) && cid.length <= 128;
function validateSnapshot(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Backup must be a game progress JSON object.");
  let serialized;
  try {
    serialized = JSON.stringify(value);
  } catch {
    throw new Error("Backup must be JSON-safe.");
  }
  if (new TextEncoder().encode(serialized).length > MAX_SAVE_BYTES) throw new Error("Backup exceeds the 4 MB progress limit.");
  return value;
}
function createSaveService({ getGame, getSession, storage, redraw = () => {
} }) {
  const game = () => {
    const value = getGame();
    if (typeof value?.exportSave !== "function" || typeof value?.importSave !== "function") throw new Error("Progress save/restore is unavailable: the game is not ready or its save API is missing.");
    return value;
  };
  const session = () => {
    const value = getSession();
    if (typeof value?.upload !== "function" || typeof value?.restore !== "function") throw new Error("IPFS session is unavailable. Reload the page and choose a provider.");
    return value;
  };
  let pending = false;
  const run = async (task) => {
    if (pending) throw new Error("Another progress operation is already running.");
    pending = true;
    try {
      return await task();
    } finally {
      pending = false;
    }
  };
  return {
    available: () => {
      try {
        game();
        session();
        return true;
      } catch {
        return false;
      }
    },
    lastCID: () => {
      try {
        const cid = storage?.getItem(CID_KEY);
        return validCID(cid) ? cid : "";
      } catch {
        return "";
      }
    },
    save: ({ consent = false } = {}) => run(async () => {
      if (!consent) throw new Error("Confirm that you want to publish your progress to IPFS.");
      const snapshot = validateSnapshot(await game().exportSave());
      const cid = await session().upload(snapshot);
      if (!validCID(cid)) throw new Error("The provider returned an invalid CID.");
      let remembered = true;
      try {
        if (!storage) remembered = false;
        else storage.setItem(CID_KEY, cid);
      } catch {
        remembered = false;
      }
      return { cid, remembered };
    }),
    restore: (cid, { consent = false } = {}) => run(async () => {
      if (!consent) throw new Error("Confirm that you want to replace your saved progress.");
      cid = String(cid || "").trim();
      if (!validCID(cid)) throw new Error("Enter a valid IPFS CID, not a gateway URL.");
      const current = game();
      const snapshot = validateSnapshot(await session().restore(cid));
      await current.importSave(snapshot);
      redraw();
      return { cid };
    })
  };
}
function installProgressPanel(host = window) {
  let storage;
  try {
    storage = host.localStorage;
  } catch {
  }
  const service = createSaveService({ getGame: () => host.asteroidGame, getSession: () => host.DecentHead?.getIpfs(), storage, redraw: () => host.asteroidDraw?.() });
  const doc = host.document;
  const panel = doc.createElement("dialog");
  panel.className = "progress-dialog";
  panel.setAttribute("aria-labelledby", "progress-title");
  panel.innerHTML = `<div class="progress-heading"><h2 id="progress-title">IPFS \xB7 flight progress</h2><button type="button" data-close aria-label="Close progress panel">\xD7</button></div>
    <p>Choose your provider in the header\u2019s IPFS orbit \u2192 Storage provider. Pinata needs your own keys; local Kubo needs a running node with this origin allowed.</p>
    <p class="privacy-note">Uploads are public and unencrypted. A pin request is not permanent storage. Keep your CID and maintain your provider\u2019s retention.</p>
    <p id="progress-provider"></p><p id="progress-ready" role="status"></p>
    <section><h3>Save flight progress</h3><label><input id="save-consent" type="checkbox"> I agree to publish my game progress and retained victory records to IPFS.</label><button id="save-progress" type="button">Save progress to IPFS</button></section>
    <section><h3>Last saved CID</h3><input id="last-cid" readonly aria-label="Last saved CID" placeholder="No save CID remembered in this browser"><div class="progress-actions"><button id="copy-cid" type="button">Copy CID</button><a id="cid-link" target="_blank" rel="noopener noreferrer" hidden>View on gateway \u2197</a></div></section>
    <section><h3>Restore by CID</h3><label>Backup CID<input id="restore-cid" autocomplete="off" spellcheck="false" placeholder="bafy\u2026 or Qm\u2026" maxlength="128"></label><label><input id="restore-consent" type="checkbox"> I agree to replace my saved progress with this validated backup.</label><button id="restore-progress" type="button">Restore progress</button></section>
    <p id="progress-status" role="status" aria-live="polite"></p>`;
  doc.body.append(panel);
  const $ = (id) => panel.querySelector(`#${id}`);
  const status2 = (message) => {
    $("progress-status").textContent = message;
  };
  let busy = false, lastCID = service.lastCID();
  const updateCID = () => {
    $("last-cid").value = lastCID;
    $("copy-cid").disabled = !lastCID;
    $("cid-link").hidden = !lastCID;
    const gateway = host.DecentHead?.getIpfs()?.options?.gateway || "https://ipfs.io/ipfs/";
    if (lastCID) $("cid-link").href = `${gateway.replace(/\/?$/, "/")}${encodeURIComponent(lastCID)}`;
  };
  const update = () => {
    const available = service.available();
    $("progress-ready").textContent = available ? "Game ready. Choose explicit save or restore below." : "Save/restore unavailable: waiting for the game save API. Try reloading if this persists.";
    $("progress-provider").textContent = `Provider: ${host.DecentHead?.getIpfs()?.provider || "unavailable"}. Credentials never enter a progress backup.`;
    for (const id of ["save-progress", "restore-progress"]) $(id).disabled = busy || !available;
    updateCID();
  };
  const perform = async (task) => {
    if (busy) return;
    busy = true;
    update();
    status2("Working\u2026 closing this panel does not cancel a submitted operation.");
    try {
      await task();
    } catch (error) {
      status2(error.message || "Progress operation failed.");
    } finally {
      busy = false;
      update();
    }
  };
  $("save-progress").onclick = () => perform(async () => {
    const result = await service.save({ consent: $("save-consent").checked });
    lastCID = result.cid;
    $("save-consent").checked = false;
    status2(`Provider accepted the save. CID: ${lastCID}. ${result.remembered ? "Remembered in this browser." : "Browser storage is unavailable: copy the CID now."} Retention is not guaranteed.`);
  });
  $("restore-progress").onclick = () => perform(async () => {
    await service.restore($("restore-cid").value, { consent: $("restore-consent").checked });
    $("restore-consent").checked = false;
    host.asteroidGame?.state === "playing" && host.asteroidGame.handleAction("pause");
    host.asteroidDraw?.();
    status2("Validated progress restored and persisted by the game. Close this panel and press P to resume if paused.");
  });
  $("copy-cid").onclick = async () => {
    try {
      await host.navigator.clipboard.writeText(lastCID);
      status2("CID copied. Keep your own copy.");
    } catch {
      $("last-cid").focus();
      $("last-cid").select();
      status2("Clipboard unavailable. Copy the selected CID manually.");
    }
  };
  panel.querySelector("[data-close]").onclick = () => panel.close();
  panel.addEventListener("click", (event) => {
    const rect = panel.getBoundingClientRect();
    if (event.target === panel && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) panel.close();
  });
  host.addEventListener("asteroid:ready", update);
  host.addEventListener("decenthead:ipfs", update);
  return {
    version: 1,
    label: "Decent Voyager flight progress",
    capabilities: { backup: { open: () => {
      update();
      if (host.asteroidGame?.state === "playing") {
        host.asteroidGame.handleAction("pause");
        host.asteroidDraw?.();
      }
      panel.showModal();
    } } },
    getStatus: async () => ({ backup: service.available() ? { state: "idle", detail: "Save or restore validated game progress. Nothing uploaded until you confirm." } : { state: "unavailable", detail: "The game save API is not ready. Reload or wait for startup." } })
  };
}

// src/js/shell/main.mjs
window.DECENT_CONFIG.ipfsAdapter = installProgressPanel();
await import("./chunks/main-H7XFSSC6.js");
var header = document.querySelector("decent-header").shadowRoot;
var quiet = (selector, css) => {
  const root = header.querySelector(selector)?.shadowRoot;
  if (!root || root.querySelector("style[data-voyager]")) return;
  const style = document.createElement("style");
  style.dataset.voyager = "";
  style.textContent = css;
  root.append(style);
};
if (!header.querySelector("style[data-voyager]")) {
  const slim = document.createElement("style");
  slim.dataset.voyager = "";
  slim.textContent = `header{min-height:0!important;padding:6px clamp(10px,2vw,28px) 40px!important;align-items:center!important}
app-title{padding-top:0!important}
@media(max-width:600px){header{padding:6px 6px 8px!important}}`;
  header.append(slim);
}
quiet("wallet-connect", `.identity-note{display:none!important}
#status[data-idle-prompt]{display:none}
.orb[data-state="connected"] #connect{background:radial-gradient(circle at 32% 28%,#baffce55,#124f28 72%);--glow:#7dff8c;box-shadow:0 0 0 3px #7dff8c,0 0 30px #7dff8c77}
#status{max-width:150px;font-size:11px}
@media(max-width:600px){#status{max-width:100px;font-size:10px}}`);
var walletStatus = header.querySelector("wallet-connect")?.shadowRoot?.querySelector("#status");
if (walletStatus) {
  const hideIdlePrompt = () => walletStatus.toggleAttribute("data-idle-prompt", walletStatus.textContent.trim() === "Connect only when you choose.");
  new MutationObserver(hideIdlePrompt).observe(walletStatus, { childList: true, characterData: true, subtree: true });
  hideIdlePrompt();
}
quiet("ipfs-status", "#label{display:none!important}");
for (const side of ["left", "right"]) {
  quiet(`ankh-menu[side="${side}"]`, `.options{z-index:1;max-width:calc(100vw - 32px);box-sizing:border-box}
summary{min-width:44px;min-height:44px}
button{min-height:44px}`);
  header.querySelector(`ankh-menu[side="${side}"]`)?.shadowRoot?.querySelector("details")?.addEventListener("toggle", () => {
    const open = [...header.querySelectorAll("ankh-menu")].some((menu) => menu.shadowRoot?.querySelector("details")?.open);
    document.querySelector(".site-header").classList.toggle("menu-open", open);
  });
}
await import("./chunks/launch-reminder-FR43NHCN.js");
var centreDisc = () => {
  const root = header.querySelector("app-title")?.shadowRoot, name = root?.querySelector(".name"), disc = root?.querySelector("button > img");
  if (!name || !disc || name.dataset.voyager) return;
  const [first, ...rest] = name.textContent.trim().split(/\s+/);
  if (!rest.length) return;
  name.dataset.voyager = "";
  name.replaceChildren(first, disc, rest.join(" "));
  disc.classList.add("voyager-disc");
};
centreDisc();
quiet("app-title", `p{display:none!important}
.name{display:inline-flex;align-items:center;gap:.28em;white-space:nowrap}
button{font-size:clamp(18px,5.2cqi,34px)}
.voyager-disc{width:.95em;height:.95em;animation:voyager-spin 18s linear infinite}
@keyframes voyager-spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.voyager-disc{animation:none}}`);
var radio;
var radioMount;
var slimRadio = () => {
  const root = document.getElementById("dbusk-radio")?.shadowRoot;
  if (!root || root.querySelector("style[data-voyager]")) return;
  const style = document.createElement("style");
  style.dataset.voyager = "";
  style.textContent = `.radio{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;min-width:0}.controls{flex-wrap:nowrap;flex:none}
button,select{padding:1px 6px}.now{flex:1;min-width:0;padding:0;font-size:11px;opacity:.8;text-overflow:ellipsis;overflow:hidden}
.status:empty{display:none}.status{flex:1 0 100%;font-size:10px;white-space:normal;overflow-wrap:anywhere;min-width:0}`;
  root.append(style);
};
var mountRadio = async () => {
  radioMount ||= (await import("./chunks/widget-IX6MQ3EG.js")).mount;
  radio = radioMount(document.getElementById("dbusk-radio"), {
    workerUrl: "https://decentbusking.onrender.com",
    compact: true,
    theme: "dark",
    volume: 0.08,
    stations: [{ id: "wqxr", label: "WQXR", url: "https://stream.wqxr.org/wqxr-web" }]
  });
  slimRadio();
  document.getElementById("radio-status").hidden = true;
};
var startRadio = () => mountRadio().catch((error) => {
  console.error("Radio unavailable:", error);
  const status2 = document.getElementById("radio-status");
  status2.textContent = "Radio unavailable. Reload to retry.";
  status2.hidden = false;
});
startRadio();
window.addEventListener("pagehide", () => radio?.destroy());
window.addEventListener("pageshow", (event) => {
  if (event.persisted) startRadio();
});
var pause = () => {
  if (!window.voyager?.isNetworkMode?.() && window.asteroidGame?.state === "playing") {
    window.asteroidGame.handleAction("pause");
    window.asteroidDraw?.();
  }
};
var observed = /* @__PURE__ */ new WeakSet();
var observeDialogs = (root) => {
  if (observed.has(root)) return;
  observed.add(root);
  const scan = () => {
    for (const dialog2 of root.querySelectorAll("dialog[open]")) pause();
    for (const element of root.querySelectorAll("*")) if (element.shadowRoot) observeDialogs(element.shadowRoot);
  };
  new MutationObserver(scan).observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["open"] });
  scan();
};
observeDialogs(document);
window.addEventListener("decenthead:about", pause);
document.addEventListener("keydown", (event) => {
  const interactive = event.composedPath().some((node2) => node2?.matches?.('input,textarea,select,button,a,[contenteditable="true"],dialog'));
  if (!interactive && window.asteroidGame?.state === "playing" && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
}, { passive: false });

// src/js/shell/capture-briefing.mjs
function mountCaptureBriefing({
  getGame = () => window.asteroidGame,
  getDetails = (tokenId) => window.AsteroidRender.supporterDetails(tokenId),
  isOnline = () => window.voyager?.isNetworkMode?.()
} = {}) {
  const dialog2 = document.getElementById("supporter-briefing");
  const title = dialog2.querySelector("[data-capture-name]");
  const image = dialog2.querySelector("[data-capture-image]");
  const imageStatus = dialog2.querySelector("[data-capture-image-status]");
  const description = dialog2.querySelector("[data-capture-description]");
  const next = dialog2.querySelector("[data-capture-next]");
  const resume2 = dialog2.querySelector("[data-capture-resume]");
  const collect = dialog2.querySelector("[data-capture-collect]");
  const transferStatus = dialog2.querySelector("[data-capture-transfer-status]");
  const queue = [], seen = /* @__PURE__ */ new Set();
  let pausedByUs = false, presentation = 0;
  const show = () => {
    const capture = queue.shift();
    if (!capture) return;
    const current = ++presentation;
    collect.disabled = false;
    collect.textContent = "Collect to wallet";
    transferStatus.textContent = "";
    const tokenId = capture.prize?.tokenId ?? capture.tokenId;
    collect.onclick = async () => {
      collect.disabled = true;
      try {
        await flightLog.signFlight({ runLog: capture.run, checkpoint: !capture.kind, tokenId, onStatus: (text) => {
          if (current === presentation) transferStatus.textContent = text;
        } });
        if (current === presentation) collect.textContent = "Collected";
      } catch (error) {
        if (current === presentation) {
          transferStatus.textContent = error.message;
          collect.disabled = false;
        }
      }
    };
    const details = getDetails(capture.prize?.tokenId ?? capture.tokenId);
    title.textContent = details?.name || `Supporter DNFT #${capture.prize?.tokenId ?? capture.tokenId}`;
    description.textContent = details?.description || "A Supporter capture was recorded. Artwork and project details are unavailable for this token.";
    image.hidden = true;
    imageStatus.textContent = "Loading the metadata-derived artwork...";
    image.onload = () => {
      image.hidden = false;
      imageStatus.textContent = "";
    };
    image.onerror = () => {
      image.hidden = true;
      imageStatus.textContent = "Artwork unavailable. Open NFT metadata below to view its source.";
    };
    if (details) {
      image.alt = details.name;
      image.src = new URL(details.image, document.baseURI).href;
    } else {
      image.removeAttribute("src");
      imageStatus.textContent = "Artwork unavailable for this token.";
    }
    for (const [key, property] of [["project", "projectUrl"], ["support", "supportUrl"], ["canopy", "canopyUrl"], ["metadata", "metadataUrl"], ["token", "tokenUrl"]]) {
      const link2 = dialog2.querySelector(`[data-capture-link="${key}"]`);
      link2.hidden = !details;
      if (details) link2.href = details[property];
      else link2.removeAttribute("href");
      if (key === "support" && details) link2.textContent = `Support this project \xB7 ${details.supportPriceUSDC} USDC listing \u2197`;
    }
    const online = isOnline();
    const game = getGame();
    if (!dialog2.open) {
      pausedByUs = !online && game?.state === "playing";
      if (pausedByUs) game.handleAction("pause");
      dialog2.showModal();
    }
    title.focus({ preventScroll: true });
    next.textContent = `${capture.kind ? "" : "Team power refilled. "}Collect now: sign the flight evidence, then approve the Base transfer. You pay Base gas. Close with the X or Escape to collect later from Flight Logs; your captured checkpoint stays on this device.`;
    dialog2.querySelector("[data-capture-pause-note]").textContent = online ? "Online battle continues on the referee. Close this briefing promptly to keep flying." : "Your local battle is paused while you inspect the reward.";
    resume2.hidden = !queue.length;
    resume2.textContent = "View next reward";
    window.asteroidDraw?.();
  };
  const continueFlight = () => {
    queue.length = 0;
    dialog2.close();
    const game = getGame();
    if (pausedByUs && game?.state === "paused" && !isOnline()) game.handleAction("pause");
    pausedByUs = false;
    document.getElementById("gameCanvas")?.focus({ preventScroll: true });
    window.asteroidDraw?.();
  };
  resume2.addEventListener("click", show);
  dialog2.querySelector("[data-capture-dismiss]").addEventListener("click", continueFlight);
  dialog2.addEventListener("cancel", (event) => {
    event.preventDefault();
    continueFlight();
  });
  for (const type of ["keydown", "keyup"]) {
    dialog2.addEventListener(type, (event) => {
      event.stopPropagation();
      if (event.key === " " || event.repeat) event.preventDefault();
    });
  }
  window.addEventListener("asteroid:event", (event) => {
    if (event.detail?.type !== "supporterCaptured") return;
    const capture = event.detail;
    const key = `${getGame()?.runId}:${capture.prize?.tokenId ?? capture.tokenId}:${capture.tier}`;
    if (seen.has(key)) return;
    if (seen.size >= 40) seen.delete(seen.values().next().value);
    seen.add(key);
    queue.push({ ...capture, run: getGame()?.getRunLog?.() });
    if (!dialog2.open) show();
    else resume2.hidden = false;
  });
  return { continueFlight };
}
if (typeof document !== "undefined") mountCaptureBriefing();

// src/js/shell/flight-reports.mjs
var dialog = createDialog("Battle diagnostics", "flight-diagnostics");
dialog.append(
  node("button", "Download report", { id: "diagnostic-download", type: "button" }),
  node("button", "Resume battle", { id: "diagnostic-resume", type: "button" }),
  node("p", "", { id: "diagnostic-status", role: "status", "aria-live": "polite" })
);
var opener = null;
window.addEventListener("voyager:open-reports", (event) => {
  opener = event.detail?.opener || null;
  if (window.voyager?.isNetworkMode?.()) {
    if (!dialog.open) dialog.showModal();
  } else openDialog(dialog);
});
dialog.addEventListener("close", () => opener?.focus?.());
var status = document.getElementById("diagnostic-status");
var download = document.getElementById("diagnostic-download");
var resume = document.getElementById("diagnostic-resume");
var alert = document.getElementById("flight-fault");
var api = () => window.voyagerDiagnostics;
var FAULT_LABEL = { "frame-error": "Flight error", "context-lost": "Graphics restarting", "performance-pause": "Performance pause" };
function refresh() {
  const report = api()?.report();
  download.disabled = !report;
  const fault = api()?.activeFault?.();
  alert.hidden = !fault;
  if (fault) {
    const details = node("button", "Error details", { type: "button" });
    details.addEventListener("click", () => window.dispatchEvent(new CustomEvent("voyager:open-reports", { detail: { opener: details } })));
    alert.replaceChildren(`${FAULT_LABEL[fault.kind] || "Flight notice"}: ${fault.message} `, details);
  }
  const entry = report?.entries.filter((item) => !["battle-event", "graphics-sample"].includes(item.kind)).at(-1);
  if (!entry) return;
  if (entry.kind === "manual-resume") {
    status.textContent = "Recovery requested.";
    return;
  }
  const when = entry.session === report.session ? "" : "Previous visit \xB7 ";
  status.textContent = `${when}${entry.kind}: ${entry.message} Local report saved${report.storageError ? " in memory only (browser storage unavailable)" : " in this browser"}. Online rounds continue on the referee.`;
}
download.addEventListener("click", () => {
  const report = api()?.report();
  if (!report) {
    status.textContent = "Diagnostics are unavailable; reload the page and try again.";
    return;
  }
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "voyager-flight-report.json";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
  status.textContent = "Report downloaded. Review before sharing.";
});
resume.addEventListener("click", () => {
  try {
    if (!api()) throw new Error("Diagnostics are unavailable. Reload the page.");
    dialog.close();
    api().resume();
  } catch (error) {
    status.textContent = error.message;
  }
});
window.addEventListener("voyager:diagnostic", refresh);
window.addEventListener("asteroid:ready", refresh);
refresh();

// src/js/pilots/rewards.mjs
function normalizeVouchers(value) {
  const payload = value || {};
  const entries = Array.isArray(payload) ? payload : payload.vouchers || [];
  if (entries.length) return {
    stamps: entries.filter((item) => item.kind === "stamp").map((item) => ({ ...item, voucher: item.voucher || item })),
    prizes: entries.filter((item) => item.kind === "prize").map((item) => ({ ...item, voucher: item.voucher || item }))
  };
  return { stamps: payload.stamps || payload.victoryStamps || [], prizes: payload.prizes || payload.supporterPrizes || [] };
}
function mountRewardGallery(root, {
  fetchImpl = globalThis.fetch,
  getDetails = (tokenId) => window.AsteroidRender?.supporterDetails?.(tokenId)
} = {}) {
  const status2 = node("p", "", { role: "status", "aria-live": "polite", className: "asteroid-status" });
  const list = node("section", "", { "aria-label": "Captured NFTs", className: "reward-rolodex" });
  const controls = node("nav", "", { "aria-label": "Browse captured NFTs" });
  for (const [label, direction] of [["Previous NFT", -1], ["Next NFT", 1]]) {
    controls.append(button(label, () => list.scrollBy({ left: direction * 210, behavior: "smooth" })));
  }
  root.append(node("h2", "Captured NFTs"), controls, status2, list);
  const detail = createDialog("Captured NFT", "voyager-reward-detail");
  const detailBody = node("section");
  detail.append(detailBody);
  let detailOpener = null;
  detail.addEventListener("close", () => {
    const opener2 = [...list.querySelectorAll("button")].find((item) => item.getAttribute("aria-label") === detailOpener?.getAttribute("aria-label"));
    opener2?.focus();
  });
  let generation = 0, pilot = window.__voyagerPilot || {};
  let active = false;
  const message = (text) => {
    status2.textContent = text;
  };
  const local = (address) => rewardState().read().filter((entry) => entry.address.toLowerCase() === address.toLowerCase());
  function draw(address, remote = []) {
    list.replaceChildren();
    const saved = local(address);
    const vouchers = [...new Map([...saved.filter((entry) => entry.kind === "voucher").map((entry) => entry.voucher), ...remote].filter((entry) => entry.voucher?.player?.toLowerCase() === address.toLowerCase()).map((entry) => [entry.digest || `${entry.kind}:${entry.voucher?.recordId || entry.voucher?.tokenId}`, entry])).values()];
    const entries = [
      ...vouchers.map((voucher) => ({ kind: "voucher", voucher, ...saved.find((entry) => entry.kind === "voucher" && entry.voucher.digest === voucher.digest) })),
      ...saved.filter((entry) => entry.kind === "capture" && !vouchers.some((voucher) => voucher.kind === "prize" && String(voucher.tokenId ?? voucher.voucher?.tokenId) === String(entry.capture.prize?.tokenId ?? entry.capture.tokenId)))
    ];
    controls.hidden = entries.length < 2;
    if (!entries.length) list.append(node("p", "No captured NFTs saved for this wallet yet. Verified vouchers from earlier visits appear here too."));
    for (const entry of entries) {
      const voucher = entry.voucher, args = voucher?.voucher;
      const tokenId = voucher ? voucher.tokenId ?? args?.tokenId : entry.capture.prize?.tokenId ?? entry.capture.tokenId;
      const details = voucher?.kind === "stamp" ? null : getDetails(tokenId);
      const row = node("article", "", { className: "reward-card" });
      const name = details?.name || (voucher?.kind === "stamp" ? `Level ${args.level} achievement NFT` : `Supporter DNFT #${tokenId}`);
      row.append(node("h3", name));
      if (details) {
        const image = node("img", "", { src: details.image, alt: details.name, loading: "lazy" });
        image.addEventListener("error", () => {
          image.hidden = true;
          row.append(node("p", "Artwork unavailable; project and metadata links remain below."));
        }, { once: true });
        row.append(image, node("p", details.description));
        const links = node("nav", "", { "aria-label": `${details.name} project links` });
        for (const [label, key] of [["Explore project", "projectUrl"], [`Support project \xB7 ${details.supportPriceUSDC} USDC listing`, "supportUrl"], ["DecentCanopy", "canopyUrl"], ["NFT metadata", "metadataUrl"], ["NFT on Base", "tokenUrl"]]) {
          if (details[key]) links.append(link(label, details[key]));
        }
        row.append(links);
      }
      if (voucher?.awardKind) row.append(node("p", voucher.awardKind.replaceAll("-", " ")));
      if (voucher?.bonus) row.append(node("p", "NFT and bonus transfer together in this Base transaction."));
      const state2 = node("p", entry.status === "collected" ? "Collected on Base." : entry.status === "submitted" ? "Transfer submitted; checking Base confirmation." : voucher ? "Verified. Checking Base collection status..." : "Captured checkpoint saved on this device. Ready to sign & collect.", { role: "status" });
      row.append(state2);
      if (entry.txHash) row.append(link("Transfer on BaseScan", `https://basescan.org/tx/${entry.txHash}`));
      const collect = button(voucher ? "Collect to wallet" : "Sign & collect", async () => {
        collect.disabled = true;
        const report = (text) => {
          state2.textContent = text;
          message(text);
        };
        try {
          if (voucher) await flightLog.transfer(voucher, report);
          else await flightLog.signFlight({ runLog: entry.run, checkpoint: !entry.capture.kind, tokenId, onStatus: report });
          collect.textContent = "Collected";
        } catch (error) {
          report(error.message);
          collect.disabled = false;
        }
      });
      collect.disabled = !!voucher || entry.status === "collected";
      if (entry.status === "collected") collect.textContent = "Collected";
      row.append(collect);
      const inspect = button("", () => {
        detailOpener = inspect;
        detail.querySelector("h2").textContent = name;
        detailBody.replaceChildren(row);
        detail.showModal();
        if (voucher) void check(voucher, entry, state2, collect, address, generation);
      });
      inspect.className = "reward-thumbnail";
      inspect.setAttribute("aria-label", `Inspect ${name}`);
      if (details) {
        const thumbnail = node("img", "", { src: details.image, alt: "", loading: "lazy" });
        thumbnail.addEventListener("error", () => {
          thumbnail.hidden = true;
        }, { once: true });
        inspect.append(thumbnail);
      }
      inspect.append(node("strong", name), node("span", entry.status === "collected" ? "Collected on Base" : "Captured"));
      list.append(inspect);
    }
    window.dispatchEvent(new CustomEvent("voyager:rewards-count", { detail: { count: entries.filter((entry) => entry.status !== "collected").length } }));
  }
  async function check(voucher, entry, state2, collect, address, request) {
    try {
      const ethers = window.ethers || await (await import("./chunks/wallet-HETDYOBF.js")).loadEthers();
      const context = await rewardContract(voucher, { ethers, address, fetchImpl, readOnly: true });
      let claimed;
      try {
        claimed = await context.claimed();
      } finally {
        context.provider.destroy?.();
      }
      if (request !== generation || address !== pilot.address || !active) return;
      if (claimed) {
        state2.textContent = "Collected on Base.";
        collect.textContent = "Collected";
        collect.disabled = true;
        if (entry.status !== "collected") rewardState().put({ id: `voucher:${voucher.digest}`, kind: "voucher", address, voucher, status: "collected" });
      } else if (entry.status === "submitted") {
        state2.textContent = "Transfer submitted. Use Collect to check its receipt before retrying.";
        collect.textContent = "Check transfer";
        collect.disabled = false;
      } else {
        const expired = !Number.isFinite(Number(voucher.voucher.deadline)) || Number(voucher.voucher.deadline) * 1e3 <= Date.now();
        state2.textContent = expired ? "Voucher expired. A new flight or support review is needed." : "Verified and ready. Approve the Base transfer to collect.";
        collect.disabled = expired;
      }
    } catch (error) {
      if (request === generation && address === pilot.address) {
        state2.textContent = `Base status unavailable: ${error.message}. Collect will recheck before sending.`;
        collect.disabled = false;
      }
    }
  }
  async function load() {
    if (!active) return;
    const request = ++generation, address = pilot.address;
    list.replaceChildren();
    if (!pilot.isPilot || !address) {
      message("Connect a Decent Pilot wallet with the header fox to see its captured NFTs.");
      return;
    }
    try {
      draw(address);
    } catch (error) {
      message(`Reward history unavailable: ${error.message}`);
      return;
    }
    const base = window.DECENT_CONFIG?.voyager?.refereeUrl;
    if (!base) {
      message("Referee unavailable. Saved checkpoints remain here; collection needs verification.");
      return;
    }
    try {
      const response = await fetchImpl(`${base.replace(/\/$/, "")}/vouchers/${encodeURIComponent(address)}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Voucher service unavailable (${response.status})`);
      const normalized = normalizeVouchers(await response.json());
      if (request !== generation || address !== pilot.address || !active) return;
      draw(address, [...normalized.stamps.map((entry) => ({ ...entry, kind: "stamp" })), ...normalized.prizes.map((entry) => ({ ...entry, kind: "prize" }))]);
      message("");
    } catch (error) {
      if (request === generation) message(`${error.message}. Saved captures remain available above.`);
    }
  }
  window.addEventListener("voyager:pilot", (event) => {
    if (detail.open) detail.close();
    pilot = event.detail || {};
    void load();
  });
  window.addEventListener("voyager:reward-history-changed", () => void load());
  window.addEventListener("voyager:flight-outbox-changed", () => void load());
  window.addEventListener("storage", (event) => {
    if ([OUTBOX_KEY, REWARD_KEY].includes(event.key)) void load();
  });
  return { load, activate: () => {
    active = true;
    void load();
  }, deactivate: () => {
    active = false;
    generation++;
    if (detail.open) detail.close();
  } };
}
function mountRewards() {
  window.addEventListener("voyager:open-rewards", (event) => window.dispatchEvent(new CustomEvent("voyager:open-vault", { detail: event.detail })));
}
if (typeof document !== "undefined") mountRewards();

// src/js/arena/state.mjs
var GROUP_CAP = 5;
var ENTRY_USDC = "10";
var transitions = {
  idle: ["local", "connecting"],
  local: ["idle"],
  connecting: ["lobby", "error", "idle"],
  lobby: ["playing", "error", "idle"],
  playing: ["results", "error", "idle"],
  results: ["claiming", "refunding", "idle", "error"],
  claiming: ["results", "error"],
  refunding: ["results", "error"],
  error: ["idle", "connecting"]
};
function createArenaState() {
  let value = { phase: "idle", mode: null, network: null, roundId: null, players: [], message: "" };
  return {
    get: () => ({ ...value, players: [...value.players] }),
    transition(phase, patch = {}) {
      if (!transitions[value.phase]?.includes(phase)) throw new Error(`Invalid arena transition: ${value.phase} \u2192 ${phase}`);
      value = { ...value, ...patch, phase };
      if (value.players.length > GROUP_CAP) throw new Error("Arena groups are limited to five ships");
      return this.get();
    },
    acceptPlayers(players) {
      if (!Array.isArray(players)) throw new Error("Arena players must be a list");
      value.players = players.slice(0, GROUP_CAP);
      return { players: value.players, overflow: Math.max(0, players.length - GROUP_CAP), message: players.length > GROUP_CAP ? "Group full \u2192 start a new group for the extra players." : "" };
    }
  };
}
function arenaWebSocketUrl(refereeUrl) {
  if (!refereeUrl) return null;
  return `${refereeUrl.replace(/^http/i, "ws").replace(/\/$/, "")}/arena`;
}

// src/js/arena/client.mjs
function createArenaClient({ refereeUrl, WebSocketImpl = globalThis.WebSocket, onMessage = () => {
}, onState = () => {
} } = {}) {
  let socket = null;
  const send = (payload) => {
    if (!socket || socket.readyState !== 1) throw new Error("Arena relay is not connected");
    socket.send(JSON.stringify(payload));
  };
  return {
    connect() {
      const url = arenaWebSocketUrl(refereeUrl);
      if (!url || !WebSocketImpl) throw new Error("Online arena is unavailable: referee server is not configured");
      socket = new WebSocketImpl(url);
      socket.addEventListener("open", () => onState("connected"));
      socket.addEventListener("close", () => onState("disconnected"));
      socket.addEventListener("error", () => onState("error"));
      socket.addEventListener("message", (event) => {
        try {
          onMessage(JSON.parse(event.data));
        } catch {
          onState("invalid-message");
        }
      });
      return socket;
    },
    send,
    close() {
      socket?.close();
      socket = null;
    },
    get connected() {
      return socket?.readyState === 1;
    }
  };
}

// src/js/pilots/gate.mjs
function isPilotState(state2) {
  return !!state2?.isPilot;
}
function requirePilot(state2, action = "This wallet action") {
  if (!isPilotState(state2)) throw new Error(`${action} is for Decent Pilots. Ask to join in the DecentAgency Discord.`);
  return true;
}

// src/js/arena/lobby.mjs
var state = createArenaState();
var modeValue = (mode) => mode === "versus" ? 1 : 0;
async function addresses() {
  const response = await fetch(window.DECENT_CONFIG?.voyager?.contracts?.addressesUrl || "./js/chain/addresses.json", { cache: "no-store" });
  if (!response.ok) return null;
  const json = await response.json();
  return json.contracts || json;
}
function addressOf(source, name) {
  const value = source?.[name] || source?.[name[0].toLowerCase() + name.slice(1)] || source?.base?.[name] || source?.["8453"]?.[name];
  return typeof value === "string" ? value : value?.address || null;
}
var ADDRESS = /^0x[\da-f]{40}$/i;
function parseInvites(text) {
  const entries = String(text || "").split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean);
  const seen = /* @__PURE__ */ new Set(), unique = entries.filter((value) => !seen.has(value.toLowerCase()) && seen.add(value.toLowerCase()));
  if (unique.length > 4) throw new Error("Invite up to four wingmates (five ships per group).");
  for (const value of unique) if (!ADDRESS.test(value) && !/^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i.test(value)) throw new Error(`${value} is not a wallet address or .eth name.`);
  return unique;
}
async function resolveInvites(entries) {
  const names = entries.filter((value) => !ADDRESS.test(value));
  if (!names.length) return entries;
  const ethers = window.ethers || await (await import("./chunks/wallet-HETDYOBF.js")).loadEthers();
  const provider = new ethers.JsonRpcProvider(window.DECENT_CONFIG?.ens?.rpcUrl || "https://ethereum-rpc.publicnode.com");
  return Promise.all(entries.map(async (value) => {
    if (ADDRESS.test(value)) return value;
    const resolved = await provider.resolveName(value);
    if (!resolved) throw new Error(`${value} does not resolve to a wallet.`);
    return resolved;
  }));
}
var refereeBase = () => (window.DECENT_CONFIG?.voyager?.refereeUrl || "").replace(/\/$/, "");
function mountArena() {
  const mount = document.getElementById("arena-lobby");
  if (!mount) return null;
  const form = mount.querySelector("[data-arena-form]");
  const status2 = mount.querySelector("[data-arena-status]");
  const field = (name) => form.querySelector(`[name=${name}]`);
  const choice = (name) => form.querySelector(`[name=${name}]:checked`)?.value;
  const mode = { get value() {
    return choice("arena-mode") || "coop";
  } };
  const playerCount = field("arena-players");
  const difficulty = field("arena-difficulty");
  const roundIdInput = field("arena-round-id");
  const go = mount.querySelector("[data-arena-go]");
  const startButton = mount.querySelector("[data-arena-start]");
  const roundButtons = mount.querySelectorAll("[data-arena-claim], [data-arena-refund], [data-arena-reset]");
  const inviteList = mount.querySelector("[data-arena-invites]");
  const setStatus = (message) => {
    status2.textContent = message;
  };
  let client;
  const currentPilot = () => window.__voyagerPilot?.isPilot === true;
  const sync = () => {
    const online = choice("arena-network") === "online", pairing = choice("arena-pairing") || "random";
    for (const node2 of form.querySelectorAll("[data-online-only]")) node2.hidden = !online;
    for (const node2 of form.querySelectorAll("[data-couch-only]")) node2.hidden = online;
    for (const node2 of form.querySelectorAll("[data-pairing]")) node2.hidden = !online || node2.dataset.pairing !== pairing;
    inviteList.hidden = !online || !inviteList.childElementCount;
    go.textContent = !online ? "Launch couch battle" : pairing === "invite" ? "Pay $10 & invite wingmates" : pairing === "round" ? "Pay $10 & join round" : "Pay $10 & find a battle";
    if (online && !currentPilot()) setStatus("Online rounds are for Decent Pilots. Connect your wallet with the fox; not on the list? Ask in the DecentAgency Discord.");
    else if (["idle", "local", "error"].includes(state.get().phase)) setStatus(online ? "Each pilot pays $10 USDC on Base. Survivors split the pot." : "Free on this screen. Extra pilots press A on a gamepad.");
  };
  const showRound = (active) => {
    for (const control of roundButtons) control.hidden = !active;
    startButton.hidden = !active;
    go.hidden = active;
  };
  form.addEventListener("change", sync);
  window.addEventListener("voyager:arena-open", () => {
    const selected = window.asteroidGame?.selectedDifficulty;
    if (selected && [...difficulty.options].some((option) => option.value === selected)) difficulty.value = selected;
    sync();
    void loadInvites();
  });
  window.addEventListener("voyager:pilot", (event) => {
    window.__voyagerPilot = event.detail || {};
    sync();
    void loadInvites();
  });
  async function loadInvites() {
    const base = refereeBase(), address = window.__voyagerPilot?.isPilot ? window.__voyagerPilot.address : null;
    inviteList.replaceChildren();
    if (!base || !address) {
      sync();
      return;
    }
    try {
      const response = await fetch(`${base}/arena/invites/${address}`, { cache: "no-store" });
      if (!response.ok) return;
      for (const invite of (await response.json()).invites || []) {
        const join = document.createElement("button");
        join.type = "button";
        join.textContent = `Join round #${invite.paidRoundId} \xB7 ${invite.mode} \xB7 ${invite.difficulty} \xB7 ${invite.players}/${invite.maxPlayers} ships`;
        join.addEventListener("click", () => {
          form.querySelector('[name=arena-mode][value="' + invite.mode + '"]').checked = true;
          difficulty.value = invite.difficulty;
          void startOnline(String(invite.paidRoundId));
        });
        inviteList.append(join);
      }
      if (inviteList.childElementCount) inviteList.prepend(Object.assign(document.createElement("p"), { textContent: "You have been invited:" }));
    } catch {
    }
    sync();
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (choice("arena-network") !== "online") {
      couch();
      return;
    }
    const pairing = choice("arena-pairing") || "random";
    if (pairing === "round") {
      void startOnline(roundIdInput.value.trim());
      return;
    }
    if (pairing === "invite") {
      let invites;
      try {
        invites = parseInvites(field("arena-invites").value);
        if (!invites.length) throw new Error("List at least one wallet to invite.");
      } catch (error) {
        setStatus(error.message);
        return;
      }
      void startOnline(null, { visibility: "invite", invites });
      return;
    }
    void startOnline(null, { visibility: "public", random: true });
  });
  function couch() {
    const game = window.voyager?.game || window.asteroidGame;
    if (!game?.setPlayers) {
      setStatus("Local couch play is not available in this game build yet.");
      return;
    }
    if (state.get().phase === "local") state.transition("idle");
    const players = Math.max(2, Math.min(5, Number(playerCount?.value) || 2));
    if (game.selectedDifficulty !== difficulty.value && typeof game.setDifficulty === "function") game.setDifficulty(difficulty.value);
    game.setPlayers(players, { mode: mode.value });
    state.transition("local", { mode: mode.value, network: "couch", players: Array.from({ length: players }, (_, index) => `local-${index + 1}`), message: "Free couch mode ready." });
    window.dispatchEvent(new CustomEvent("voyager:arena-launch", { detail: { network: "couch", players, mode: mode.value } }));
  }
  startButton.addEventListener("click", () => {
    try {
      client?.send({ type: "start", seed: Date.now() % 2147483647 });
      setStatus("Round launched. Good luck, pilots!");
      window.dispatchEvent(new CustomEvent("voyager:arena-launch", { detail: { network: "online" } }));
    } catch (error) {
      setStatus(error.message);
    }
  });
  sync();
  async function startOnline(existingRoundId = null, { visibility = "public", invites = [], random = false } = {}) {
    try {
      requirePilot(window.__voyagerPilot, "Online arena");
    } catch (error) {
      setStatus(`${error.message} Couch mode is free.`);
      return;
    }
    if (!currentPilot()) {
      setStatus("Online rounds are for Decent Pilots. Ask to join in the DecentAgency Discord; couch mode is free.");
      return;
    }
    const refereeUrl = window.DECENT_CONFIG?.voyager?.refereeUrl;
    if (!refereeUrl) {
      setStatus("Online arena unavailable: referee server is not configured. Local couch mode remains free.");
      return;
    }
    if (existingRoundId !== null && !/^\d+$/.test(existingRoundId)) {
      setStatus("Enter a numeric paid round ID.");
      return;
    }
    if (random && existingRoundId === null) {
      try {
        const response = await fetch(`${refereeBase()}/arena/open?mode=${encodeURIComponent(mode.value)}&difficulty=${encodeURIComponent(difficulty.value)}`, { cache: "no-store" });
        const open = response.ok ? (await response.json()).rounds || [] : [];
        if (open.length) {
          existingRoundId = String(open[0].paidRoundId);
          setStatus(`Found open round #${existingRoundId}. Joining\u2026`);
        }
      } catch {
      }
    }
    let invitees = [];
    if (visibility === "invite") {
      try {
        invitees = await resolveInvites(invites);
      } catch (error) {
        setStatus(error.message);
        return;
      }
    }
    if (state.get().phase === "local") state.transition("idle");
    let contracts;
    try {
      contracts = await addresses();
    } catch {
      contracts = null;
    }
    const arenaAddress = addressOf(contracts, "VoyagerArena"), usdcAddress = addressOf(contracts, "USDC");
    if (!arenaAddress || !usdcAddress) {
      setStatus("Online arena unavailable: Base arena or USDC contract address is not configured.");
      return;
    }
    const wallet = window.DecentHead?.getWallet?.();
    if (!wallet?.snapshot?.().connected) {
      setStatus("Connect your wallet using the header fox to join an online round.");
      return;
    }
    try {
      state.transition("connecting", { mode: mode.value, network: "online" });
      const provider = await wallet.ensureChain(window.DECENT_CONFIG.voyager.chainId ? { ...window.DECENT_CONFIG.chain, chainId: window.DECENT_CONFIG.voyager.chainId } : void 0);
      const ethers = window.ethers || await (await import("./chunks/wallet-HETDYOBF.js")).loadEthers();
      const signer = await provider.getSigner();
      const pilotAddress = await signer.getAddress();
      if (!currentPilot() || pilotAddress.toLowerCase() !== window.__voyagerPilot.address?.toLowerCase()) throw new Error("Decent Pilot wallet changed; reconnect and retry");
      const arena = new ethers.Contract(arenaAddress, ["function createRound(bytes32,uint8,uint256,uint8,uint256) returns (uint256)", "function join(uint256)", "event RoundCreated(uint256 indexed roundId,bytes32 indexed gameId,address indexed referee,uint8 mode,uint256 entryFee,uint8 maxPlayers,uint256 joinDeadline)"], signer);
      const usdc = new ethers.Contract(usdcAddress, ["function approve(address,uint256) returns (bool)"], signer);
      const fee = ethers.parseUnits(ENTRY_USDC, 6), deadline = Math.floor(Date.now() / 1e3) + 3600;
      const gameId = ethers.id("decent-voyager");
      const approvalGas = await usdc.approve.estimateGas(arenaAddress, fee);
      let roundId = existingRoundId;
      let createGas = null, predictedRoundId = null;
      if (roundId === null) {
        predictedRoundId = await arena.createRound.staticCall(gameId, modeValue(mode.value), fee, 5, deadline);
        createGas = await arena.createRound.estimateGas(gameId, modeValue(mode.value), fee, 5, deadline);
      }
      const details = roundId === null ? `Create a ${mode.value} round and join with $${ENTRY_USDC} USDC? Estimated gas: approval ${approvalGas}; create ${createGas}.` : `Join paid round ${roundId} with $${ENTRY_USDC} USDC? Estimated approval gas: ${approvalGas}.`;
      if (!window.confirm(`${details} Your wallet will request approval, arena, and session-signature actions.`)) {
        state.transition("idle");
        return;
      }
      const approval = await usdc.approve(arenaAddress, fee);
      await approval.wait();
      if (roundId === null) {
        const tx = await arena.createRound(gameId, modeValue(mode.value), fee, 5, deadline), receipt = await tx.wait();
        for (const log of receipt.logs || []) {
          try {
            const event = arena.interface.parseLog(log);
            if (event?.name === "RoundCreated") roundId = String(event.args.roundId ?? event.args[0]);
          } catch {
          }
        }
        if (!roundId && predictedRoundId !== void 0 && predictedRoundId !== null) roundId = String(predictedRoundId);
        if (!roundId) throw new Error("Round was created but the referee contract did not expose a RoundCreated event ID. Contact the admin; do not retry create.");
      }
      const joinTx = await arena.join(roundId);
      await joinTx.wait();
      const timestamp = Math.floor(Date.now() / 1e3), nonceBytes = crypto.getRandomValues(new Uint8Array(18));
      const nonce = btoa(String.fromCharCode(...nonceBytes)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      const authMessage = `DecentVoyager arena session
${pilotAddress.toLowerCase()}
${timestamp}
${nonce}`;
      const signature = await signer.signMessage(authMessage);
      let latestSnapshot = null;
      client = createArenaClient({ refereeUrl, onState: (message) => setStatus(`Arena relay: ${message}`), onMessage: (message) => {
        if (message.type === "snapshot") latestSnapshot = message.state || message.snapshot;
        if (message.type === "started" && state.get().phase === "lobby") state.transition("playing");
        if (message.type === "settled" || message.type === "results" || message.type === "roundEnd") {
          if (state.get().phase === "lobby") state.transition("playing");
          state.transition("results", { roundId, message });
          setStatus("Round finished. Review results to claim payout or refund on-chain.");
        }
        if (message.type === "group-full") setStatus("Group full \u2192 new group created for the extra players.");
        if (message.type === "error") setStatus(message.error || "Arena relay error.");
      } });
      const socket = client.connect();
      socket.addEventListener("open", () => {
        try {
          client.send({ type: "join", address: pilotAddress, mode: mode.value, difficulty: difficulty.value, paidRoundId: roundId, timestamp, nonce, signature, visibility, invites: invitees });
        } catch (error) {
          setStatus(error.message);
        }
      }, { once: true });
      const networkMode = window.voyager?.setNetworkMode;
      if (typeof networkMode === "function") networkMode({ onInput: (inputs) => client?.send({ type: "input", roundId, input: Array.isArray(inputs) ? inputs[0] : inputs }), snapshots: () => latestSnapshot });
      state.transition("lobby", { roundId, players: [pilotAddress], message: "Paid round joined." });
      showRound(true);
      setStatus(`Joined round #${roundId} with $${ENTRY_USDC} USDC. ${visibility === "invite" ? "Share this round number with your invited wingmates." : "Waiting for pilots."} Up to 5 ships per group.`);
    } catch (error) {
      try {
        state.transition("error", { message: error.message });
      } catch {
      }
      const message = /RoundFull|Round full/i.test(error.message) ? "Group full \u2192 create a new paid round for a new group." : `Online arena unavailable: ${error.message}`;
      setStatus(message);
    }
  }
  mount.addEventListener("click", (event) => {
    if (event.target.matches("[data-arena-reset]")) {
      try {
        client?.send({ type: "leave" });
      } catch {
      }
      client?.close();
      window.voyager?.setNetworkMode?.(null);
      try {
        state.transition("idle");
      } catch {
      }
      showRound(false);
      setStatus("Left the arena.");
    }
    if (event.target.matches("[data-arena-claim]")) void settleAction("claim");
    if (event.target.matches("[data-arena-refund]")) void settleAction("cancelExpiredRound");
  });
  async function settleAction(action) {
    try {
      const contracts = await addresses(), arenaAddress = addressOf(contracts, "VoyagerArena");
      if (!arenaAddress || !state.get().roundId) throw new Error("Round contract is unavailable");
      requirePilot(window.__voyagerPilot, "Arena claim or refund");
      const wallet = window.DecentHead?.getWallet?.(), provider = wallet?.browserProvider;
      if (!provider) throw new Error("Connect the round wallet first");
      const ethers = window.ethers || await (await import("./chunks/wallet-HETDYOBF.js")).loadEthers();
      const method = action === "cancelExpiredRound" ? action : "claim";
      const contract = new ethers.Contract(arenaAddress, [`function ${method}(uint256)`], await provider.getSigner());
      const tx = await contract[method](state.get().roundId);
      await tx.wait();
      setStatus(method === "claim" ? "Payout or refund claimed on-chain." : "Expired round cancelled; refund credited. Use Claim round payout to withdraw USDC.");
    } catch (error) {
      setStatus(error.message);
    }
  }
  return { state, startOnline, client: () => client };
}
if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountArena, { once: true });
  else mountArena();
}

// src/js/dnft/validation.mjs
var CLAIM_SCHEMA = "asteroid-dnft-claim/1";
var CID_RE = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{20,120})$/;
var ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
var validAddress = (value) => typeof value === "string" && ADDRESS_RE.test(value) && !/^0x0{40}$/i.test(value);
var validIpfs = (value) => typeof value === "string" && value.startsWith("ipfs://") && CID_RE.test(value.slice(7));
function assertJsonSafe(value, depth = 0) {
  if (depth > 30) throw new Error("JSON nesting is too deep");
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number" && Number.isFinite(value)) return;
  if (typeof value !== "object" || !Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype) throw new Error("Expected plain JSON-safe data");
  for (const item of Object.values(value)) assertJsonSafe(item, depth + 1);
}
var finiteRange = (value, min, max) => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
function validateRecord(record) {
  assertJsonSafe(record);
  if (record?.schema !== "asteroid-level-record/1" || typeof record.id !== "string" || !/^[\w:.+-]{1,180}$/.test(record.id) || !Number.isInteger(record.level) || record.level < 1 || record.level > 20 || record.level > 10 && record.difficulty === "cadet" || !["cadet", "pilot", "ace"].includes(record.difficulty)) throw new Error("Invalid level record identity");
  if (typeof record.levelName !== "string" || !record.levelName || typeof record.game !== "string" || typeof record.gameVersion !== "string" || !Number.isFinite(Date.parse(record.completedAt)) || !Number.isFinite(Date.parse(record.startedAt)) || !finiteRange(record.durationSec, 0, Number.MAX_SAFE_INTEGER)) throw new Error("Invalid level record details");
  if (!record.ship || typeof record.ship !== "object" || Array.isArray(record.ship) || !record.stats || typeof record.stats !== "object" || Array.isArray(record.stats) || !finiteRange(record.stats.accuracy, 0, 1) || !record.score || !["total", "level", "bonus"].every((key) => finiteRange(record.score[key], 0, Number.MAX_SAFE_INTEGER))) throw new Error("Invalid level record statistics");
  return record;
}
function validateClaim(input) {
  assertJsonSafe(input);
  if (!input || input.schema !== CLAIM_SCHEMA) throw new Error("Unknown victory claim schema");
  if (typeof input.recordId !== "string" || !/^[\w:.+-]{1,180}$/.test(input.recordId)) throw new Error("Invalid recordId");
  if (!validIpfs(input.tokenURI) || !validIpfs(input.image)) throw new Error("Metadata and image must be ipfs://CID URIs");
  if (!validAddress(input.claimant)) throw new Error("Invalid claimant wallet address");
  if (!Number.isInteger(input.level) || input.level < 1 || input.level > 20 || input.level > 10 && input.difficulty === "cadet") throw new Error("Level must be 1\u201320 (Cadet: 1\u201310)");
  if (!["cadet", "pilot", "ace"].includes(input.difficulty)) throw new Error("Unknown difficulty");
  for (const key of ["completedAt", "requestedAt"]) {
    if (typeof input[key] !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(input[key]) || !finiteRange(Date.parse(input[key]), 0, 864e13)) throw new Error(`Invalid ${key}`);
  }
  if (Date.parse(input.requestedAt) < Date.parse(input.completedAt)) throw new Error("Request predates the win");
  if (!input.score || !["total", "level", "bonus"].every((key) => finiteRange(input.score[key], 0, Number.MAX_SAFE_INTEGER))) throw new Error("Invalid score");
  return Object.fromEntries(["schema", "recordId", "tokenURI", "image", "claimant", "level", "difficulty", "completedAt", "score", "requestedAt"].map((key) => [key, JSON.parse(JSON.stringify(input[key]))]));
}
function parseQueue(input) {
  if (!input || !Array.isArray(input.pending) || !Array.isArray(input.minted)) throw new Error("Queue requires pending and minted arrays");
  if (input.pending.length + input.minted.length > 1e4) throw new Error("Queue is too large");
  const seenRecords = /* @__PURE__ */ new Set(), seenURIs = /* @__PURE__ */ new Set();
  for (const entry of [...input.pending, ...input.minted]) {
    validateClaim(entry);
    if (seenRecords.has(entry.recordId) || seenURIs.has(entry.tokenURI)) throw new Error("Duplicate record or token URI in queue");
    seenRecords.add(entry.recordId);
    seenURIs.add(entry.tokenURI);
  }
  assertJsonSafe(input);
  return JSON.parse(JSON.stringify(input));
}

// src/js/dnft/vault.mjs
var VAULT_KEY = "asteroid-victory-vault/1";
var VictoryVault = class {
  constructor(storage) {
    this.storage = storage;
    this.entries = [];
    this.error = "";
    try {
      this.storage ||= globalThis.localStorage;
      if (!this.storage) throw new Error("Storage unavailable");
      const saved = JSON.parse(this.storage.getItem(VAULT_KEY) || "[]");
      assertJsonSafe(saved);
      if (Array.isArray(saved)) this.entries = saved.filter((entry) => {
        try {
          validateRecord(entry.record);
          return true;
        } catch {
          return false;
        }
      }).slice(-200);
    } catch {
      this.error = "Stored vault was unavailable. Wins remain in the game save; export claims before clearing browser storage.";
    }
  }
  persist() {
    try {
      if (!this.storage) throw new Error("Storage unavailable");
      this.storage.setItem(VAULT_KEY, JSON.stringify(this.entries));
      this.error = "";
    } catch {
      this.error = "Browser storage is full/unavailable. Copy your claim JSON now; this claim is not durably saved.";
    }
  }
  merge(records = []) {
    for (const record of records) {
      try {
        validateRecord(record);
      } catch {
        continue;
      }
      if (!this.entries.some((entry) => entry.record.id === record.id)) this.entries.push({ record: JSON.parse(JSON.stringify(record)), status: "not pinned" });
    }
    this.entries = this.entries.slice(-200);
    this.persist();
    return this.entries;
  }
  update(id, patch) {
    const entry = this.entries.find((item) => item.record.id === id);
    if (!entry) throw new Error("Victory record not found");
    Object.assign(entry, patch);
    this.persist();
    return entry;
  }
};

// src/js/dnft/metadata.mjs
var METADATA_SCHEMA = "asteroid-victory-metadata/1";
function attributesOf(value, prefix, output) {
  if (value !== null && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) attributesOf(item, prefix ? `${prefix}.${key}` : key, output);
  } else output.push({ trait_type: prefix, value: value === null ? "Unavailable" : value });
}
function buildMetadata(record, { image, claimant, externalUrl = "https://thejollylama.github.io/DecentVoyager/" } = {}) {
  validateRecord(record);
  if (!validAddress(claimant)) throw new Error("Connect your wallet with the header fox before stamping");
  if (!validIpfs(image)) throw new Error("Pin the battle card before metadata");
  const attributes = [];
  for (const key of ["stats", "score", "ship", "marathon"]) if (record[key] !== void 0) attributesOf(record[key], key, attributes);
  for (const key of ["level", "levelName", "difficulty", "difficultyLabel", "seed", "startedAt", "durationSec"]) if (record[key] !== void 0) attributesOf(record[key], key, attributes);
  attributes.push({ trait_type: "completedAt", display_type: "date", value: Math.floor(Date.parse(record.completedAt) / 1e3) });
  const label = record.difficultyLabel || `${record.difficulty[0].toUpperCase()}${record.difficulty.slice(1)}`;
  return {
    name: record.marathon ? `Decent Voyager \xB7 ${label} Marathon Victory \xB7 Levels 1\u201320` : `Decent Voyager Victory \xB7 L${record.level} ${record.levelName} \xB7 ${label}`,
    description: `Victory stamp for level ${record.level} of Decent Voyager: Galactic Gauntlet on ${record.completedAt}. Player-submitted game telemetry; reviewed and batch minted by the administrator on Base.`,
    image,
    external_url: externalUrl,
    attributes,
    properties: { record: JSON.parse(JSON.stringify(record)), schema: METADATA_SCHEMA, game: record.game, gameVersion: record.gameVersion, claimant, chain: "base" }
  };
}
function buildClaim(record, { tokenURI, image, claimant, requestedAt = (/* @__PURE__ */ new Date()).toISOString() }) {
  if (record.difficulty === "cadet") throw new Error("Cadet flights are practice only; fly Pilot or Ace to earn tokens.");
  if (record.level !== 20) throw new Error("Achievement NFTs are awarded only for completing level 20. Other level records remain flight history.");
  return validateClaim({ schema: "asteroid-dnft-claim/1", recordId: record.id, tokenURI, image, claimant, level: record.level, difficulty: record.difficulty, completedAt: record.completedAt, score: record.score, requestedAt });
}

// src/js/dnft/pin.mjs
function gatewayUrl(uri, gateway = "https://ipfs.io/ipfs/") {
  if (!validIpfs(uri)) return "";
  try {
    const url = new URL(gateway.replace(/\/?$/, "/") + uri.slice(7));
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
async function pinFile(session, blob, name, fetchImpl = globalThis.fetch) {
  if (!session?.options || !["pinata", "local"].includes(session.provider)) throw new Error("Configure your IPFS session with the header IPFS controls first");
  if (!(blob instanceof Blob) || !blob.size || blob.size > 20 * 1024 * 1024) throw new Error("Upload must be nonempty and at most 20 MB");
  const body = new FormData();
  body.append("file", blob, name);
  const local = session.provider === "local";
  const endpoint = local ? `${session.options.local.apiUrl.replace(/\/$/, "")}/api/v0/add?pin=true` : session.options.pinata.uploadUrl;
  const response = await fetchImpl(endpoint, { method: "POST", body, ...local ? {} : { headers: session.headers() }, signal: AbortSignal.timeout(6e4) });
  if (!response.ok) throw new Error(`IPFS pin failed (HTTP ${response.status}). Check credentials / local Kubo CORS.`);
  const result = local ? JSON.parse((await response.text()).trim().split("\n").at(-1)) : await response.json();
  const cid = local ? result.Hash : result.IpfsHash;
  if (!CID_RE.test(cid || "")) throw new Error("IPFS provider returned an invalid CID");
  return `ipfs://${cid}`;
}
function canvasBlob(canvas) {
  if (!canvas?.toBlob) throw new Error("Battle card renderer is unavailable; try again after game assets load");
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Battle card could not be rendered as PNG")), "image/png");
    } catch (error) {
      reject(error);
    }
  });
}

// src/js/dnft/flight-stats.mjs
function flightStatGroups(totals = {}) {
  const number = (key) => Number(totals[key]) || 0;
  const count = (key) => number(key).toLocaleString();
  const metrics = (fields) => fields.map(([label, key]) => [label, count(key)]);
  return [
    ["Voyages", [
      ...metrics([["Flights launched", "campaignsStarted"], ["Campaign victories", "victories"], ["Levels attempted", "levelsPlayed"], ["Levels cleared", "levelsCleared"], ["Levels failed", "levelsFailed"], ["Levels abandoned", "levelsAbandoned"]]),
      ["Flight time", `${Math.floor(number("playTimeSec") / 3600)}h ${Math.floor(number("playTimeSec") % 3600 / 60)}m`]
    ]],
    ["Firepower", [
      ...metrics([["Bullets fired", "shotsFired"], ["Trigger pulls", "volleys"], ["Bullets on target", "hits"]]),
      ["Accuracy", `${(number("shotsFired") ? Math.min(1, number("hits") / number("shotsFired")) * 100 : 0).toFixed(1)}%`],
      ...metrics([["Mandelblums encountered", "asteroidsSpawned"], ["Mandelblums destroyed", "asteroidsDestroyed"], ["Mandelblums missed", "asteroidsMissed"], ["Shooters destroyed", "shootersDestroyed"], ["Fragments destroyed", "fragmentsDestroyed"], ["Bosses defeated", "bossesDestroyed"], ["Best combo", "maxCombo"]])
    ]],
    ["Survival", [
      ...metrics([["Lives lost", "livesLost"], ["Hits taken", "hitsTaken"], ["Collisions", "collisions"], ["Damage taken", "damageTaken"], ["Shield blocks", "shieldBlocks"], ["Enemy shots fired", "enemyShotsFired"], ["Shots dodged", "enemyShotsDodged"], ["Pickups missed", "pickupsMissed"], ["Mini hits absorbed", "miniHitsAbsorbed"]]),
      ["Closest dodge", totals.closestCall == null || totals.closestCall < 0 ? "Not recorded" : `${number("closestCall").toFixed(1)} px`],
      ["POV time", `${Math.round(number("timeInPov"))} sec`],
      ["Overview time", `${Math.round(number("timeInOverview"))} sec`]
    ]],
    ["Weapons used", Object.entries(totals.shotsByWeapon || {}).map(([name, value]) => [name, Number(value).toLocaleString()])],
    ["Cargo collected", Object.entries(totals.pickupsCollected || {}).map(([name, value]) => [name, Number(value).toLocaleString()])]
  ];
}

// src/js/dnft/claims.mjs
function issueUrl(claim) {
  const json = JSON.stringify(claim, null, 2);
  const params = new URLSearchParams({ template: "victory-stamp.yml", labels: "victory-stamp", title: `Victory stamp: L${claim.level} ${claim.difficulty} \xB7 ${claim.recordId}`, claim: json, body: `### Claim JSON

\`\`\`json
${json}
\`\`\`` });
  return `https://github.com/TheJollyLaMa/DecentVoyager/issues/new?${params}`;
}
function walletAddress() {
  const state2 = window.DecentHead?.getWallet?.()?.snapshot?.();
  return state2?.connected && validAddress(state2.address) ? state2.address : null;
}
function requireDecentPilot(action) {
  requirePilot(window.__voyagerPilot, action);
}
function mountClaims() {
  if (document.getElementById("asteroid-victory-vault")) return;
  const vault = new VictoryVault(), busy = /* @__PURE__ */ new Set();
  const dialog2 = createDialog("\u2726 Flight Logs", "asteroid-victory-vault");
  const hero = node("div", "", { className: "flight-log-hero" });
  hero.append(node("img", "", { src: new URL("../../assets/brand/voyager-disc.png", new URL("js/dnft/claims.mjs", document.baseURI).href).href, alt: "Mandelblum flight insignia" }), node("p", "Your voyages, firepower and survival record. Saved totals include failed and abandoned attempts, not just victories. The current attempt joins these totals when it ends."));
  const totals = node("section", "", { "aria-label": "Total flight stats" });
  const intro = node("p", "Every cleared level keeps its battle card below. Level 20 earns an achievement NFT. Captured NFTs and their wallet collection actions are above.");
  const status2 = node("p", "", { role: "status", "aria-live": "polite", className: "asteroid-status" });
  const rewards = node("section");
  const list = node("section", "", { "aria-label": "Cleared levels" });
  dialog2.append(rewards, hero, totals, node("h2", "Battle archive"), intro, status2, list);
  const gallery = mountRewardGallery(rewards);
  let renderGeneration = 0;
  let opener2 = null;
  const announce = () => window.dispatchEvent(new CustomEvent("voyager:vault-count", { detail: { count: vault.entries.length } }));
  window.addEventListener("voyager:open-vault", (event) => {
    opener2 = event.detail?.opener || null;
    sync();
    openDialog(dialog2);
    render();
    gallery.activate();
  });
  function sync() {
    vault.merge(window.asteroidGame?.getWinRecords?.() || []);
    announce();
  }
  async function action(entry, task) {
    if (busy.has(entry.record.id)) return;
    busy.add(entry.record.id);
    render();
    try {
      await task();
    } catch (error) {
      status2.textContent = error.message;
    } finally {
      busy.delete(entry.record.id);
      render();
    }
  }
  function render() {
    const generation = ++renderGeneration;
    const retainFocus = dialog2.contains(document.activeElement);
    totals.replaceChildren();
    const lifetime = window.asteroidGame?.getLifetimeStats?.();
    if (!lifetime) totals.append(node("p", "Flight stats are unavailable while the game loads. Reopen Flight Logs to retry."));
    for (const [title, metrics] of lifetime ? flightStatGroups(lifetime) : []) {
      const grid = node("div", "", { className: "flight-log-grid" });
      for (const [label, value] of metrics) {
        const metric = node("div");
        metric.append(node("strong", value), node("span", label));
        grid.append(metric);
      }
      totals.append(node("h3", title), grid);
    }
    for (const canvas of list.querySelectorAll("canvas")) {
      canvas.width = 0;
      canvas.height = 0;
    }
    list.replaceChildren();
    announce();
    if (vault.error) status2.textContent = vault.error;
    if (!vault.entries.length) list.append(node("p", "No cleared levels yet. Failed flights still count in your totals above."));
    const entries = [...vault.entries].reverse();
    for (const [index, entry] of entries.entries()) {
      const record = entry.record, card = node("article");
      card.append(node("h3", `L${record.level} ${record.levelName} \xB7 ${record.difficultyLabel || record.difficulty}`), node("p", `${new Date(record.completedAt).toLocaleString()} \xB7 Score ${record.score.total} \xB7 Accuracy ${(record.stats.accuracy * 100).toFixed(1)}%`), node("p", `Status: ${entry.status}`));
      if (dialog2.open && index < 3) {
        const preview = node("div");
        card.append(preview);
        void (async () => {
          let canvas;
          try {
            if (!window.AsteroidRender?.renderBattleCard) throw new Error("Battle renderer is still loading. Reopen Flight Logs to retry.");
            canvas = await window.AsteroidRender.renderBattleCard(record, { width: 480, height: 480 });
            if (generation !== renderGeneration || !dialog2.open) {
              canvas.width = 0;
              canvas.height = 0;
              return;
            }
            canvas.className = "battle-preview";
            canvas.setAttribute("role", "img");
            canvas.setAttribute("aria-label", `Battle map and stats for level ${record.level}`);
            preview.append(canvas);
          } catch (error) {
            if (generation === renderGeneration) preview.textContent = `Battle preview unavailable: ${error.message}`;
          }
        })();
      }
      const details = node("details"), summary = node("summary", "Full level telemetry");
      details.append(summary);
      for (const [title, metrics] of flightStatGroups(record.stats)) {
        if (title === "Voyages") continue;
        const grid = node("div", "", { className: "flight-log-grid" });
        for (const [label, value] of metrics) {
          const metric = node("div");
          metric.append(node("strong", value), node("span", label));
          grid.append(metric);
        }
        details.append(node("h4", title), grid);
      }
      card.append(details);
      const gateway = window.DecentHead?.getIpfs?.()?.options?.gateway;
      for (const [label, uri] of [["Battle PNG", entry.image], ["Metadata", entry.tokenURI]]) if (uri) {
        card.append(node("p", `${label} CID: ${uri.slice(7)}`), link(`Open ${label}`, gatewayUrl(uri, gateway)));
      }
      if (entry.txHash && /^0x[\da-f]{64}$/i.test(entry.txHash)) card.append(link("Mint transaction on BaseScan", `https://basescan.org/tx/${entry.txHash}`));
      if (entry.status !== "minted" && record.level === 20 && record.difficulty !== "cadet") {
        const isPilot = window.__voyagerPilot?.isPilot === true;
        const stamp = button(entry.tokenURI ? "Re-stamp for connected wallet" : "Stamp DNFT", () => action(entry, async () => {
          requireDecentPilot("Stamping a victory record");
          const claimant = walletAddress();
          if (!claimant) throw new Error("Click the fox in the header to connect your wallet. No accounts are requested automatically.");
          const session = window.DecentHead?.getIpfs?.();
          if (!entry.image) {
            if (!window.AsteroidRender?.renderBattleCard) throw new Error("Battle card renderer is not available yet. Your win is saved; retry after loading the game.");
            status2.textContent = "Rendering and pinning battle PNG\u2026";
            const image = await pinFile(session, await canvasBlob(await window.AsteroidRender.renderBattleCard(record)), `asteroid-L${record.level}.png`);
            vault.update(record.id, { image, status: "PNG pinned; metadata not pinned" });
          }
          status2.textContent = "Pinning metadata with every win stat\u2026";
          const metadata = buildMetadata(record, { image: entry.image, claimant, externalUrl: location.origin + location.pathname });
          const tokenURI = await pinFile(session, new Blob([JSON.stringify(metadata)], { type: "application/json" }), `asteroid-L${record.level}-metadata.json`);
          vault.update(record.id, { tokenURI, claimant, status: "pinned", claim: null });
          status2.textContent = "Pinned. Request mint to submit to the administrator; no mint transaction has been sent.";
        }));
        stamp.disabled = !isPilot || busy.has(record.id) || entry.status === "requested";
        card.append(stamp);
        if (entry.tokenURI) {
          const request = button("Request mint on GitHub", () => {
            try {
              requireDecentPilot("Requesting a victory stamp");
              const claimant = walletAddress();
              if (!claimant) throw new Error("Connect your wallet with the header fox before requesting a mint.");
              if (claimant.toLowerCase() !== entry.claimant?.toLowerCase()) throw new Error("Wallet changed. Re-stamp the metadata for this wallet first.");
              const claim = entry.claim || buildClaim(record, { tokenURI: entry.tokenURI, image: entry.image, claimant });
              const tab = window.open(issueUrl(claim), "_blank");
              if (tab) tab.opener = null;
              vault.update(record.id, { claim, status: "requested" });
              status2.replaceChildren(node("span", "Claim prepared. Submit the opened GitHub form to actually join the queue. If blocked, "), link("open issue form", issueUrl(claim)), node("span", ". Requested is not minted."));
              render();
            } catch (error) {
              status2.textContent = error.message;
            }
          });
          request.disabled = !isPilot || busy.has(record.id);
          card.append(request);
          const copy = button("Copy claim JSON", () => action(entry, async () => {
            requireDecentPilot("Copying a victory claim");
            const claimant = walletAddress();
            if (!claimant || claimant.toLowerCase() !== entry.claimant?.toLowerCase()) throw new Error("Connect the wallet used to stamp this record with the header fox.");
            const claim = entry.claim || buildClaim(record, { tokenURI: entry.tokenURI, image: entry.image, claimant });
            vault.update(record.id, { claim });
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(JSON.stringify(claim, null, 2));
              status2.textContent = "Claim JSON copied. Submit it in a victory-stamp GitHub issue.";
            } else {
              const text = node("textarea", JSON.stringify(claim, null, 2), { "aria-label": "Claim JSON" });
              status2.replaceChildren(text);
              text.focus();
              text.select();
            }
          }));
          copy.disabled = !isPilot || busy.has(record.id);
          card.append(copy);
        }
      }
      list.append(card);
    }
    if (retainFocus && document.activeElement === document.body) dialog2.querySelector("button")?.focus();
  }
  async function reconcile() {
    try {
      const response = await fetch("https://raw.githubusercontent.com/TheJollyLaMa/DecentVoyager/main/victory-stamps.json", { cache: "no-store", signal: AbortSignal.timeout(1e4) });
      if (!response.ok) return;
      for (const minted of parseQueue(await response.json()).minted) {
        const entry = vault.entries.find((item) => item.record.id === minted.recordId && item.tokenURI === minted.tokenURI && item.claimant?.toLowerCase() === minted.claimant.toLowerCase());
        if (entry && /^0x[\da-f]{64}$/i.test(minted.txHash || "") && /^\d+$/.test(String(minted.tokenId))) vault.update(entry.record.id, { status: "minted", txHash: minted.txHash, tokenId: String(minted.tokenId) });
      }
      render();
    } catch {
    }
  }
  window.addEventListener("asteroid:event", (event) => {
    if (event.detail?.type === "levelRecord" && event.detail.record) {
      vault.merge([event.detail.record]);
      render();
    }
  });
  window.addEventListener("asteroid:ready", () => {
    sync();
    render();
  });
  window.addEventListener("asteroid:save-imported", () => {
    sync();
    render();
  });
  window.addEventListener("decenthead:wallet", render);
  window.addEventListener("voyager:pilot", (event) => {
    window.__voyagerPilot = event.detail;
    render();
  });
  dialog2.addEventListener("close", () => {
    if (dialog2.open) return;
    gallery.deactivate();
    renderGeneration++;
    for (const canvas of list.querySelectorAll("canvas")) {
      canvas.width = 0;
      canvas.height = 0;
    }
    opener2?.focus?.();
  });
  sync();
  render();
  void reconcile();
  return { vault, dialog: dialog2, refresh: sync };
}
if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountClaims, { once: true });
  else mountClaims();
}

// src/js/shell/profile-menu.mjs
var counts = { vault: 0, rewards: 0 };
var ENTRIES = [
  { id: "vault", label: (count) => `\u2726 Flight Logs${count ? ` \xB7 ${count}` : ""}`, event: "voyager:open-vault" },
  { id: "rewards", label: (count) => `\u2726 Captured rewards${count ? ` \xB7 ${count}` : ""}`, event: "voyager:open-rewards" }
];
function menuRoot() {
  return document.querySelector("decent-header")?.shadowRoot?.querySelector('ankh-menu[side="right"]')?.shadowRoot || null;
}
function attach() {
  const root = menuRoot(), options = root?.querySelector(".options");
  if (!options) return false;
  if (!options.querySelector("[data-voyager-entry]")) {
    const details = root.querySelector("details");
    options.replaceChildren(...ENTRIES.map((entry) => {
      const button2 = document.createElement("button");
      button2.type = "button";
      button2.dataset.voyagerEntry = entry.id;
      button2.style.cursor = "pointer";
      button2.style.whiteSpace = "nowrap";
      button2.addEventListener("click", () => {
        if (details) details.open = false;
        const opener2 = root.querySelector("summary");
        if (entry.about) document.querySelector("decent-header")?.shadowRoot?.querySelector("about-modal")?.open?.();
        else window.dispatchEvent(new CustomEvent(entry.event, { detail: { opener: opener2 } }));
      });
      return button2;
    }));
  }
  for (const entry of ENTRIES) {
    const button2 = options.querySelector(`[data-voyager-entry="${entry.id}"]`);
    if (button2) button2.textContent = entry.label(counts[entry.id] || 0);
  }
  const summary = root.querySelector("summary"), waiting = counts.rewards;
  if (summary) summary.setAttribute("aria-label", waiting ? `Profile menu, ${waiting} reward${waiting === 1 ? "" : "s"} waiting` : "Profile menu");
  return true;
}
function mountProfileMenu() {
  window.addEventListener("voyager:vault-count", (event) => {
    counts.vault = Number(event.detail?.count) || 0;
    attach();
  });
  window.addEventListener("voyager:rewards-count", (event) => {
    counts.rewards = Number(event.detail?.count) || 0;
    attach();
  });
  const tryAttach = () => {
    if (!attach()) setTimeout(tryAttach, 200);
  };
  window.addEventListener("decenthead:ready", tryAttach);
  tryAttach();
}
if (typeof document !== "undefined") mountProfileMenu();

// src/js/shell/launch-pad.mjs
function mountLaunchPad({ getGame = () => window.voyager?.game || window.asteroidGame } = {}) {
  const pad = document.getElementById("launch-pad"), arena = document.getElementById("arena-lobby"), canvas = document.getElementById("gameCanvas");
  if (!pad || !arena) return null;
  let arenaOpen = false;
  const refresh2 = () => {
    const onTitle = getGame()?.state === "title";
    pad.hidden = !onTitle || arenaOpen;
    arena.hidden = !arenaOpen;
  };
  const closeArena = () => {
    arenaOpen = false;
    refresh2();
    canvas?.focus({ preventScroll: true });
  };
  document.addEventListener("pointerdown", (event) => {
    if (arenaOpen && !event.composedPath().includes(arena)) closeArena();
  });
  const launch = () => {
    const game = getGame();
    if (!game) return;
    closeArena();
    if (game.state === "title") {
      game.handleAction("confirm");
      window.asteroidDraw?.();
    }
  };
  pad.querySelector("[data-launch-solo]")?.addEventListener("click", () => {
    const game = getGame();
    if (game?.playerCount > 1 && typeof game.setPlayers === "function") game.setPlayers(1, { mode: "coop" });
    launch();
  });
  pad.querySelector("[data-launch-multi]")?.addEventListener("click", () => {
    arenaOpen = true;
    refresh2();
    window.dispatchEvent(new CustomEvent("voyager:arena-open"));
    arena.querySelector("input:checked, input, button")?.focus({ preventScroll: true });
  });
  arena.querySelector("[data-arena-back]")?.addEventListener("click", closeArena);
  arena.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeArena();
    }
    event.stopPropagation();
  });
  arena.addEventListener("keyup", (event) => event.stopPropagation());
  window.addEventListener("voyager:arena-launch", (event) => {
    if (event.detail?.network === "couch") launch();
    else closeArena();
  });
  window.addEventListener("asteroid:event", refresh2);
  setInterval(refresh2, 250);
  refresh2();
  return { refresh: refresh2, openArena: () => pad.querySelector("[data-launch-multi]")?.click(), closeArena };
}
if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => mountLaunchPad(), { once: true });
  else mountLaunchPad();
}

// src/js/input/mobile-controls.mjs
var clamp = (value) => Math.max(-1, Math.min(1, value));
var wrap = (value) => ((value + 180) % 360 + 360) % 360 - 180;
function tiltVector(sample, origin, angle = 0) {
  if (![sample?.beta, sample?.gamma, origin?.beta, origin?.gamma, angle].every(Number.isFinite)) return { ax: 0, ay: 0 };
  const beta = wrap(sample.beta - origin.beta), gamma = wrap(sample.gamma - origin.gamma);
  const radians = angle * Math.PI / 180;
  const deadzone = (value) => Math.abs(value) < 0.1 ? 0 : clamp((value - Math.sign(value) * 0.1) / 0.9);
  return {
    ax: deadzone((gamma * Math.cos(radians) + beta * Math.sin(radians)) / 25),
    ay: deadzone((-beta * Math.cos(radians) + gamma * Math.sin(radians)) / 25)
  };
}
function createTiltController({ windowObject: win = window, onVector = () => {
}, onStatus = () => {
} } = {}) {
  let active = false, origin = null, timer = null, generation = 0;
  const zero = () => onVector({ ax: 0, ay: 0 });
  const clearTimer = () => {
    if (timer !== null) win.clearTimeout(timer);
    timer = null;
  };
  const disable = (message = "Tilt off. Touch controls remain available.") => {
    generation++;
    active = false;
    origin = null;
    clearTimer();
    win.removeEventListener("deviceorientation", sample);
    zero();
    onStatus(message, false);
  };
  const armTimeout = () => {
    clearTimer();
    timer = win.setTimeout(() => disable("No motion readings. Use touch controls or enable tilt again."), 2500);
  };
  function sample(event) {
    if (!active || !Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;
    armTimeout();
    if (!origin) {
      origin = { beta: event.beta, gamma: event.gamma };
      zero();
      onStatus("Tilt ready. Hold comfortably; Recenter resets neutral.", true);
      return;
    }
    const angle = win.screen?.orientation?.angle ?? win.orientation ?? 0;
    onVector(tiltVector(event, origin, angle));
  }
  return {
    async enable() {
      if (active) return true;
      const attempt = ++generation;
      if (!win.isSecureContext || !win.DeviceOrientationEvent) {
        disable("Tilt unavailable here. Use touch controls (motion needs HTTPS and browser support).");
        return false;
      }
      try {
        if (typeof win.DeviceOrientationEvent.requestPermission === "function") {
          const permission = await win.DeviceOrientationEvent.requestPermission();
          if (attempt !== generation) return false;
          if (permission !== "granted") {
            disable("Motion permission denied. Touch controls still work.");
            return false;
          }
        }
        if (attempt !== generation) return false;
        active = true;
        origin = null;
        win.addEventListener("deviceorientation", sample);
        armTimeout();
        onStatus("Hold comfortably. Waiting for motion to calibrate\u2026", true);
        return true;
      } catch {
        if (attempt === generation) disable("Motion permission unavailable. Use touch controls.");
        return false;
      }
    },
    disable,
    calibrate() {
      if (!active) return;
      origin = null;
      zero();
      onStatus("Hold comfortably. Waiting for motion to recenter\u2026", true);
    },
    get active() {
      return active;
    }
  };
}
async function enterFlightScreen(element, win = window) {
  if (!element?.requestFullscreen) return "Fullscreen unavailable. Rotate your device if you prefer landscape; portrait still works.";
  try {
    await element.requestFullscreen();
  } catch {
    return "Fullscreen was not available. Keep playing inline; portrait and landscape both work.";
  }
  try {
    if (typeof win.screen?.orientation?.lock === "function") await win.screen.orientation.lock("landscape");
    else return "Fullscreen ready. Rotate manually for landscape.";
  } catch {
    return "Fullscreen ready; rotation lock unavailable. Rotate manually or keep portrait.";
  }
  return "Fullscreen ready. Use Exit screen to return.";
}
function mountMobileControls({
  windowObject: win = window,
  documentObject: doc = document,
  getVoyager = () => win.voyager
} = {}) {
  const deck = doc.getElementById("flight-deck"), canvas = doc.getElementById("gameCanvas");
  if (!deck || !canvas || doc.getElementById("mobile-controls")) return null;
  const panel = doc.createElement("section");
  panel.id = "mobile-controls";
  panel.className = "mobile-controls";
  panel.setAttribute("aria-label", "Touch flight controls");
  panel.innerHTML = `
        <div class="mobile-difficulty" role="group" aria-label="Choose flight difficulty">
            <button type="button" data-mobile-difficulty="cadet" aria-pressed="false">Cadet<br><small>10 levels</small></button>
            <button type="button" data-mobile-difficulty="pilot" aria-pressed="false">Pilot<br><small>20 levels</small></button>
            <button type="button" data-mobile-difficulty="ace" aria-pressed="false">Ace<br><small>Extreme</small></button>
        </div>
        <div class="mobile-toolbar">
            <button type="button" data-mobile-command="confirm">Launch / continue</button>
            <button type="button" data-mobile-command="pause">Pause / resume</button>
            <button type="button" data-mobile-command="toggleView">View</button>
            <button type="button" data-mobile-screen>Full screen</button>
        </div>
        <div class="mobile-flight">
            <div class="mobile-dpad" role="group" aria-label="Hold to steer">
                <button type="button" data-mobile-held="up" aria-label="Move forward">\u25B2</button>
                <button type="button" data-mobile-held="left" aria-label="Move left">\u25C0</button>
                <button type="button" data-mobile-held="down" aria-label="Move back">\u25BC</button>
                <button type="button" data-mobile-held="right" aria-label="Move right">\u25B6</button>
            </div>
            <div class="mobile-weapons" role="group" aria-label="Weapons">
                <button type="button" data-mobile-held="fire" class="mobile-fire">Fire<br><small>tap / hold</small></button>
                <button type="button" data-mobile-held="special">Nova</button>
                <button type="button" data-mobile-held="weaponNext">Next weapon</button>
            </div>
        </div>
        <div class="mobile-motion">
            <button type="button" data-mobile-tilt aria-pressed="false">Enable tilt</button>
            <button type="button" data-mobile-center disabled>Recenter</button>
            <span>Touch always works \xB7 rotate for a wider view</span>
        </div>
        <p data-mobile-status role="status" aria-live="polite">Hold arrows to steer. Tap or hold Fire; hold charges compatible weapons. Tilt is optional.</p>`;
  deck.append(panel);
  const status2 = panel.querySelector("[data-mobile-status]");
  const tiltButton = panel.querySelector("[data-mobile-tilt]");
  const centerButton = panel.querySelector("[data-mobile-center]");
  const screenButton = panel.querySelector("[data-mobile-screen]");
  const disposers = [], pointers = /* @__PURE__ */ new Map(), sources = /* @__PURE__ */ new Set();
  let mounted = true;
  const difficulty = panel.querySelector(".mobile-difficulty");
  const dpad = panel.querySelector(".mobile-dpad");
  let lastState;
  const refresh2 = () => {
    const game = getVoyager()?.game;
    const onTitle = game?.state === "title";
    difficulty.hidden = !onTitle;
    for (const button2 of difficulty.querySelectorAll("button")) button2.setAttribute("aria-pressed", String(game?.selectedDifficulty === button2.dataset.mobileDifficulty));
    dpad.setAttribute("aria-label", onTitle ? "Choose difficulty with arrows" : "Hold to steer");
    if (lastState !== game?.state) {
      status2.textContent = onTitle ? "Tap Cadet, Pilot or Ace. Arrows also change difficulty; then choose Launch." : "Hold arrows to steer. Tap or hold Fire; hold charges compatible weapons. Tilt is optional.";
      lastState = game?.state;
    }
  };
  const listen = (target, type, fn) => {
    target?.addEventListener(type, fn);
    disposers.push(() => target?.removeEventListener(type, fn));
  };
  const setState = (source, state2) => {
    sources.add(source);
    getVoyager()?.input?.setVirtualState(source, state2);
  };
  const wakeCanvas = () => {
    canvas.focus({ preventScroll: true });
    canvas.dispatchEvent(new win.Event("pointerdown"));
  };
  const titleArrow = (action) => {
    const game = getVoyager()?.game;
    if (game?.state !== "title" || !["up", "down", "left", "right"].includes(action)) return false;
    game.handleAction(["up", "left"].includes(action) ? "difficultyPrev" : "difficultyNext");
    win.asteroidDraw?.();
    refresh2();
    return true;
  };
  const tilt = createTiltController({
    windowObject: win,
    onVector: (vector) => setState("mobile:tilt", vector),
    onStatus: (message, enabled) => {
      status2.textContent = message;
      tiltButton.setAttribute("aria-pressed", String(enabled));
      tiltButton.textContent = enabled ? "Disable tilt" : "Enable tilt";
      centerButton.disabled = !enabled;
    }
  });
  const releasePointer = (event, cancelled = false) => {
    const held = pointers.get(event.pointerId);
    if (!held) return;
    pointers.delete(event.pointerId);
    setState(held.source, cancelled ? null : {});
    held.button.classList.toggle("is-held", Array.from(pointers.values()).some((value) => value.button === held.button));
  };
  for (const button2 of panel.querySelectorAll("[data-mobile-held]")) {
    const action = button2.dataset.mobileHeld;
    listen(button2, "pointerdown", (event) => {
      if (event.button !== 0 || !getVoyager()?.input?.setVirtualState) return;
      event.preventDefault();
      wakeCanvas();
      if (titleArrow(action)) return;
      const source = `mobile:pointer:${event.pointerId}`;
      pointers.set(event.pointerId, { source, button: button2 });
      setState(source, { [action]: true });
      button2.classList.add("is-held");
      try {
        button2.setPointerCapture(event.pointerId);
      } catch {
      }
    });
    listen(button2, "lostpointercapture", (event) => releasePointer(event, true));
    listen(button2, "contextmenu", (event) => event.preventDefault());
    listen(button2, "click", (event) => {
      if (event.detail !== 0) return;
      wakeCanvas();
      if (titleArrow(action)) return;
      const source = `mobile:activate:${action}`;
      setState(source, { [action]: true });
      if (["fire", "special", "weaponNext"].includes(action)) setState(source, {});
      else win.setTimeout(() => {
        if (mounted) setState(source, null);
      }, 100);
    });
  }
  listen(win, "pointerup", (event) => releasePointer(event));
  listen(win, "pointercancel", (event) => releasePointer(event, true));
  for (const type of ["keydown", "keyup"]) {
    listen(panel, type, (event) => {
      if (event.key === "Enter" || event.key === " ") event.stopPropagation();
    });
  }
  for (const button2 of panel.querySelectorAll("[data-mobile-command]")) {
    listen(button2, "click", () => {
      wakeCanvas();
      getVoyager()?.game?.handleAction(button2.dataset.mobileCommand);
      win.asteroidDraw?.();
      refresh2();
    });
  }
  for (const button2 of difficulty.querySelectorAll("button")) {
    listen(button2, "click", () => {
      const game = getVoyager()?.game;
      if (game?.state !== "title") return;
      wakeCanvas();
      game.setDifficulty(button2.dataset.mobileDifficulty);
      win.asteroidDraw?.();
      refresh2();
    });
  }
  listen(win, "asteroid:event", refresh2);
  const refreshTimer = win.setInterval(refresh2, 250);
  disposers.push(() => win.clearInterval(refreshTimer));
  refresh2();
  listen(tiltButton, "click", async () => {
    if (tilt.active) {
      tilt.disable();
      return;
    }
    tiltButton.disabled = true;
    await tilt.enable();
    tiltButton.disabled = false;
  });
  listen(centerButton, "click", () => tilt.calibrate());
  listen(screenButton, "click", async () => {
    if (doc.fullscreenElement) {
      try {
        await doc.exitFullscreen();
      } catch {
        status2.textContent = "Use your browser\u2019s fullscreen exit control.";
      }
    } else status2.textContent = await enterFlightScreen(deck, win);
  });
  listen(doc, "fullscreenchange", () => {
    screenButton.textContent = doc.fullscreenElement ? "Exit screen" : "Full screen";
  });
  const reset = () => {
    pointers.clear();
    for (const source of sources) getVoyager()?.input?.setVirtualState(source, null);
    sources.clear();
    for (const button2 of panel.querySelectorAll(".is-held")) button2.classList.remove("is-held");
    const wasActive = tilt.active;
    tilt.disable(wasActive ? "Tilt paused after leaving the game. Enable again when ready." : "Touch controls ready. Tilt is optional.");
  };
  listen(win, "blur", reset);
  listen(win, "pagehide", reset);
  listen(doc, "visibilitychange", () => {
    if (doc.hidden) reset();
  });
  listen(doc, "focusin", (event) => {
    const path = event.composedPath?.() || [event.target];
    const editing = path.some((node2) => node2?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "DIALOG"].includes(node2?.tagName));
    if (editing || event.target !== doc.body && !deck.contains(event.target)) reset();
  });
  listen(win.screen?.orientation || win, win.screen?.orientation ? "change" : "orientationchange", () => {
    for (const event of Array.from(pointers.keys(), (pointerId) => ({ pointerId }))) releasePointer(event, true);
    tilt.calibrate();
  });
  listen(win, "voyager:arena-open", reset);
  return {
    tilt,
    reset,
    destroy() {
      mounted = false;
      reset();
      tilt.disable();
      for (const dispose of disposers) dispose();
      panel.remove();
    }
  };
}
if (typeof document !== "undefined") {
  const mount = () => mountMobileControls();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
}

// src/js/admin/config.mjs
var DEFAULT_ADMIN = "0x807061DF657A7697c04045dA7d16D941861cAABc";
var VERIFIED_CONTRACT = "0x64D5aDc50E5513975EfF7e9ba366B7eE58586fa3";
function adminConfig(config = globalThis.window?.DECENT_CONFIG?.asteroid || {}) {
  return { adminWallet: config.adminWallet || DEFAULT_ADMIN, contractAddress: config.contractAddress || VERIFIED_CONTRACT, royaltyFeeBps: config.royaltyFeeBps ?? 500, gateway: config.gateway || "https://ipfs.io/ipfs/", rpcUrl: config.rpcUrl || "https://mainnet.base.org" };
}
function isAdmin(address, expected = adminConfig().adminWallet) {
  return typeof address === "string" && /^0x[\da-f]{40}$/i.test(address) && address.toLowerCase() === expected.toLowerCase();
}
var BASE_CHAIN = { chainId: 8453, chainName: "Base", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: ["https://mainnet.base.org"], blockExplorerUrls: ["https://basescan.org"] };

// src/js/admin/batch.mjs
var PRODUCT_BATCH_ABI = [
  "function registerAndMintProductsBatch((address recipient,uint256 amount,uint256 maxSupply,string tokenURI,address royaltyReceiver,uint96 royaltyFeeBps)[] products) returns (uint256[] tokenIds)",
  "function hasRole(bytes32 role,address account) view returns (bool)",
  "event TokenRegistered(uint256 indexed tokenId,address indexed creator,uint256 maxSupply,uint8 kind,string uri)",
  "event EditionMinted(uint256 indexed tokenId,address indexed to,uint256 amount,address indexed minter)"
];
function buildProducts(claims, { adminWallet, royaltyFeeBps = 500 }) {
  if (!Array.isArray(claims) || !claims.length || claims.length > 20) throw new Error("Select 1\u201320 stamps");
  if (!validAddress(adminWallet) || !Number.isInteger(royaltyFeeBps) || royaltyFeeBps < 0 || royaltyFeeBps > 1e4) throw new Error("Invalid royalty configuration");
  if (new Set(claims.map((claim) => claim.tokenURI)).size !== claims.length || new Set(claims.map((claim) => claim.recordId)).size !== claims.length) throw new Error("Duplicate stamps selected");
  return claims.map((input) => {
    const claim = validateClaim(input);
    if (claim.level !== 20 || claim.difficulty === "cadet") throw new Error("New achievement mints require a Pilot or Ace level 20 win. Historical queue records are retained.");
    return { recipient: claim.claimant, amount: 1, maxSupply: 1, tokenURI: claim.tokenURI, royaltyReceiver: adminWallet, royaltyFeeBps };
  });
}
async function verifyContract(provider, Contract, config) {
  const code = await provider.getCode(config.contractAddress);
  if (!code || code === "0x" || !code.toLowerCase().includes("04491a20")) throw new Error("Unverified/unavailable: deployed batch function could not be verified");
  const contract = new Contract(config.contractAddress, PRODUCT_BATCH_ABI, provider);
  if (!await contract.hasRole(`0x${"0".repeat(64)}`, config.adminWallet)) throw new Error("Unverified/unavailable: configured admin lacks DEFAULT_ADMIN_ROLE");
  return contract;
}
function reconcileReceipt(receipt, contract, products, owner) {
  if (Number(receipt?.status) !== 1) throw new Error("Transaction has not successfully confirmed");
  const events = (receipt.logs || []).filter((log) => log.address?.toLowerCase() === contract.target.toLowerCase()).flatMap((log) => {
    try {
      const event = contract.interface.parseLog(log);
      return event ? [event] : [];
    } catch {
      return [];
    }
  });
  return products.map((product) => {
    const registered = events.filter((event) => event.name === "TokenRegistered" && event.args.uri === product.tokenURI && event.args.creator.toLowerCase() === owner.toLowerCase() && BigInt(event.args.kind) === 0n && BigInt(event.args.maxSupply) === 1n);
    if (registered.length !== 1) throw new Error("Confirmed transaction has ambiguous registration proof; do NOT retry minting");
    const id = BigInt(registered[0].args.tokenId);
    const minted = events.filter((event) => event.name === "EditionMinted" && BigInt(event.args.tokenId) === id && event.args.to.toLowerCase() === product.recipient.toLowerCase() && event.args.minter.toLowerCase() === owner.toLowerCase() && BigInt(event.args.amount) === 1n);
    if (minted.length !== 1) throw new Error("Confirmed transaction lacks matching mint proof; do NOT retry minting");
    return String(id);
  });
}

// src/js/admin/pending.mjs
function isLegacySupporterRelease(entry) {
  return (entry.kind === "supporter-prize" || entry.kind === "supporterPrize") && !entry.protocol && !entry.bonus;
}
function pendingCounts({ stamps = null, payroll = null, arena = null } = {}) {
  const count = (value) => Array.isArray(value) ? value.length : 0;
  return {
    stamps: count(stamps?.pending),
    prizes: count(payroll?.pending?.filter?.(isLegacySupporterRelease)),
    payroll: count(payroll?.pending),
    arena: count(arena?.pending)
  };
}
function waitingTotal(counts2) {
  return counts2.stamps + counts2.prizes + counts2.arena;
}

// src/js/admin/ens-cache.mjs
var KEY = "decent-voyager-ens-cache/1";
var TTL = 30 * 24 * 60 * 60 * 1e3;
function createEnsCache({ storage = globalThis.localStorage, lookupName, lookupAvatar = async () => null, now = Date.now } = {}) {
  const inflight = /* @__PURE__ */ new Map();
  const cached = (address) => {
    try {
      const entries = JSON.parse(storage?.getItem(KEY) || "{}");
      const item = entries[address.toLowerCase()];
      return item && now() - item.savedAt < TTL ? item : null;
    } catch {
      return null;
    }
  };
  const store = (address, value) => {
    try {
      const entries = JSON.parse(storage?.getItem(KEY) || "{}");
      entries[address.toLowerCase()] = { ...value, savedAt: now() };
      storage?.setItem(KEY, JSON.stringify(entries));
    } catch {
    }
  };
  async function resolve(address) {
    if (!/^0x[\da-f]{40}$/i.test(address || "")) return { name: null, avatar: null };
    const normalized = address.toLowerCase(), saved = cached(normalized);
    if (saved) return { name: saved.name || null, avatar: saved.avatar || null };
    if (inflight.has(normalized)) return inflight.get(normalized);
    const task = (async () => {
      try {
        if (!lookupName) return { name: null, avatar: null };
        const name = await lookupName(address);
        const avatar = name ? await lookupAvatar(name) : null;
        const value = { name: name || null, avatar: avatar || null };
        store(address, value);
        return value;
      } catch {
        return { name: null, avatar: null };
      } finally {
        inflight.delete(normalized);
      }
    })();
    inflight.set(normalized, task);
    return task;
  }
  return { resolve, clear(address) {
    try {
      const entries = JSON.parse(storage?.getItem(KEY) || "{}");
      delete entries[address.toLowerCase()];
      storage?.setItem(KEY, JSON.stringify(entries));
    } catch {
    }
  } };
}
async function mainnetEnsCache() {
  const ethers = window.ethers || await (await import("./chunks/wallet-HETDYOBF.js")).loadEthers();
  const rpc = window.DECENT_CONFIG?.ens?.rpcUrl || "https://ethereum-rpc.publicnode.com";
  const provider = new ethers.JsonRpcProvider(rpc);
  return createEnsCache({ lookupName: (address) => provider.lookupAddress(address), lookupAvatar: (name) => provider.getAvatar(name) });
}

// src/js/admin/admin-panel.mjs
var RAW = "https://raw.githubusercontent.com/TheJollyLaMa/DecentVoyager/main/";
var JOURNAL = "asteroid-mint-journal/1";
var SUPPORTER_NFT = "0xe63EC9f8228720bAAC2fD528C0A6d06B3Dc5439B";
var SUPPORTER_PRIZES = {
  "70": { project: "DecentHead", label: "DecentHead v2.0.0 #70", tier: 1, metadataURI: "ipfs://QmVGmpz63TS9XkTHMxf2sybHv5k9Vdoyr2Spi9QqZ4pzfj" },
  "71": { project: "DecentMarket", label: "DecentMarket v0.3.1 #71", tier: 1, metadataURI: "ipfs://QmUR29d2NeRH94ceLDxHqDvDi4eNdSRTNM1wZ6UPDsvWqi" },
  "75": { project: "DecentBusking", label: "DecentBusking v1.0.0 #75", tier: 2, metadataURI: "ipfs://QmZroFCEhaKoctVqW682Uzv5i6WWiQtuWvTAYkQBYfH6TD" },
  "76": { project: "BigNuten_Vanilla", label: "BigNuten_Vanilla v3.3.0 #76", tier: 2, metadataURI: "ipfs://QmSrAwCU5p1ga3RzpuDHZxezsNjob76ZSFpRzCuG15yYqU" },
  "77": { project: "DecentCalendar", label: "DecentCalendar v0.1.0 #77", tier: 2, metadataURI: "ipfs://QmPqCy2g53t4BaffprtfjfM4L5imACB1nWZK63HyN9o3Tj" },
  "78": { project: "DecentPilgrimages", label: "DecentPilgrimages v0.1.1 #78", tier: 2, metadataURI: "ipfs://QmNe9SYSyrZYV66X29Wp4hBLbCDpQDjnJsAJLDdAytALEN" },
  "79": { project: "DecentCanopy", label: "DecentCanopy v0.1.0 #79", tier: 2, metadataURI: "ipfs://QmQqQtuSeab78F3pdBcMbvSopYZLa51zJ4JxcodQ2ugy9d" },
  "80": { project: "DecentVoyager", label: "DecentVoyager v1.0.0 #80", tier: 2, metadataURI: "ipfs://QmacnQSJCxmqjWnMxDqhkLXCJv1zqp1EKoeF7nY782rGpe" }
};
function assertLegacySupporterRelease(entries) {
  if (entries.some((entry) => entry.protocol || entry.bonus)) throw new Error("Atomic rewards must be claimed through VoyagerRewards; legacy NFT release would omit signed assets.");
}
async function loadLedger(name, fetchImpl = globalThis.fetch) {
  for (const url of [RAW + name, new URL(`../../../${name}`, new URL("js/admin/admin-panel.mjs", document.baseURI).href).href]) {
    try {
      const response = await fetchImpl(url, { cache: "no-store", signal: AbortSignal.timeout(15e3) });
      if (response.ok) return await response.json();
    } catch {
    }
  }
  throw new Error(`${name} unavailable. Publish the root ledger on main, provide a hosted copy, or paste JSON below.`);
}
function parseWorkers(input) {
  assertJsonSafe(input);
  if (!Array.isArray(input?.contributors)) throw new Error("Contributors ledger requires a contributors array");
  return input.contributors.filter((worker) => worker.whitelisted === true).map((worker) => {
    if (!/^[-\w]{1,39}$/.test(worker.github || "") || worker.walletAddress && !validAddress(worker.walletAddress)) throw new Error("Invalid contributor identity");
    return worker;
  });
}
async function ethersLibrary() {
  if (window.ethers) return window.ethers;
  return (await import("./chunks/wallet-HETDYOBF.js")).loadEthers();
}
function mountAdmin() {
  if (document.getElementById("asteroid-admin")) return;
  const config = adminConfig(), preview = new URLSearchParams(location.search).get("adminPreview") === "1";
  const wallet = () => window.DecentHead?.getWallet?.();
  const authorized = () => !!wallet()?.snapshot?.().connected && isAdmin(wallet().snapshot().address, config.adminWallet);
  const dialog2 = createDialog("\u2625 Decent Voyager Admin", "asteroid-admin");
  dialog2.classList.add("voyager-admin");
  const status2 = node("p", preview ? "READ-ONLY PREVIEW \u2014 no wallet prompts, uploads, or transactions." : "UI gating is not security. Contract roles authorize on-chain actions.", { className: "asteroid-status", role: "status", "aria-live": "polite" });
  const nav = node("nav", "", { role: "tablist", "aria-label": "Admin sections" });
  const victories = node("section", "", { role: "tabpanel", id: "asteroid-victory-tab", "aria-labelledby": "asteroid-victory-tab-button" });
  const prizes = node("section", "", { role: "tabpanel", id: "asteroid-prizes-tab", "aria-labelledby": "asteroid-prizes-tab-button" });
  prizes.hidden = true;
  const arena = node("section", "", { role: "tabpanel", id: "asteroid-arena-tab", "aria-labelledby": "asteroid-arena-tab-button" });
  arena.hidden = true;
  const workers = node("section", "", { role: "tabpanel", id: "asteroid-worker-tab", "aria-labelledby": "asteroid-worker-tab-button" });
  workers.hidden = true;
  const panels = [victories, prizes, arena, workers];
  const tabDefinitions = [["Victory Stamps", victories], ["Supporter Prizes", prizes], ["Arena Rounds", arena], ["Decent Pilots", workers]];
  const tabs = tabDefinitions.map(([label, panel], index) => {
    const tab = button(label, () => {
      panels.forEach((item) => {
        item.hidden = item !== panel;
      });
      tabs.forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
    });
    tab.setAttribute("role", "tab");
    tab.id = `${panel.id}-button`;
    tab.setAttribute("aria-controls", panel.id);
    tab.setAttribute("aria-selected", String(index === 0));
    nav.append(tab);
    return tab;
  });
  nav.addEventListener("keydown", (event) => {
    const index = tabs.indexOf(document.activeElement);
    if (index < 0 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus();
    tabs[next].click();
  });
  dialog2.append(status2, nav, victories, prizes, arena, workers);
  const prizeCards = node("div");
  const arenaCards = node("div");
  const batchPreview = node("pre", "", { className: "supporter-batch-preview", "aria-label": "Generated supporter release batch" });
  const releaseSelected = button("Simulate & confirm supporter release batch", () => void runSupporterBatch());
  let queue = { pending: [], minted: [] }, selected = /* @__PURE__ */ new Set(), metadata = /* @__PURE__ */ new Map(), minting = false;
  let prizeQueue = [], ensCachePromise = null, previewButton = null;
  let journal;
  try {
    journal = JSON.parse(localStorage.getItem(JOURNAL) || "null");
  } catch {
    journal = { unresolved: true };
  }
  let report = null;
  const exportArea = node("textarea", "", { "aria-label": "Minted records export", readonly: "" });
  const cards = node("div");
  const importBox = node("textarea", "", { "aria-label": "Paste victory-stamps.json", placeholder: 'Paste { "pending": [...], "minted": [...] }' });
  const mint = button("Estimate & batch mint selected", () => void mintSelected());
  const switchButton = button("Switch wallet to Base", async () => {
    try {
      if (preview || !authorized()) throw new Error("Connect the admin wallet with the header fox.");
      await wallet().ensureChain(BASE_CHAIN);
      status2.textContent = "Wallet switched to Base.";
    } catch (error) {
      status2.textContent = error.message;
    }
  });
  const check = button("Check saved transaction receipt", () => void checkSaved());
  const recoveryHash = node("input", "", { type: "text", "aria-label": "Original or replacement mint transaction hash", placeholder: "0x\u2026 transaction hash from wallet history" });
  const recover = button("Recover original/replacement transaction", async () => {
    try {
      if (!journal?.claims || !/^0x[\da-f]{64}$/i.test(recoveryHash.value.trim())) throw new Error("A saved mint attempt and a valid wallet-history transaction hash are required");
      const { contract, provider } = await contractContext();
      const transaction = await provider.getTransaction(recoveryHash.value.trim());
      const products = buildProducts(journal.claims.map(validateClaim), config);
      if (!transaction || !isAdmin(transaction.from, journal.owner) || transaction.to?.toLowerCase() !== journal.contractAddress.toLowerCase() || transaction.value !== 0n || transaction.data.toLowerCase() !== contract.interface.encodeFunctionData("registerAndMintProductsBatch", [products]).toLowerCase()) throw new Error("Transaction does not match the saved owner, contract and exact products");
      journal.txHash = transaction.hash;
      localStorage.setItem(JOURNAL, JSON.stringify(journal));
      await checkSaved();
    } catch (error) {
      status2.textContent = error.message;
    }
  });
  prizes.append(node("h3", "Supporter Prizes \xB7 Base"), node("p", "Review queued supporter NFTs. The generated owner batch transfers each token from DecentMarket escrow into VoyagerPrizes, then calls VoyagerPrizes.adminRelease. Simulations and an explicit confirmation are required; preview mode never sends transactions."), button("Reload supporter queue", () => void refreshPrizes()), releaseSelected, batchPreview, prizeCards);
  arena.append(node("h3", "Arena Rounds"), node("p", "Read-only Base rounds appear here when VoyagerArena is deployed. Settlement, claims, and refunds require an explicit wallet action."), button("Reload arena queue", () => void refreshArena()), arenaCards);
  victories.append(node("h3", "Victory Stamps \xB7 Base"), node("p", "Player-submitted records are not anti-cheat proofs. Review metadata before selecting up to 20 stamps. Amount and maximum supply are one. This browser exports confirmed results; it cannot update GitHub."), switchButton, mint, check, recoveryHash, recover, button("Reload public queue", () => void refreshQueue()), importBox, button("Import pasted queue", () => {
    try {
      queue = parseQueue(JSON.parse(importBox.value));
      selected.clear();
      metadata.clear();
      renderCards();
    } catch (error) {
      status2.textContent = error.message;
    }
  }), cards, node("h3", "Confirmed mint export"), exportArea, button("Copy confirmed export", async () => {
    try {
      if (!report) throw new Error("No confirmed mint export yet");
      await navigator.clipboard.writeText(exportArea.value);
      status2.textContent = "Copied. Remove these records from pending and append to minted in victory-stamps.json in an owner-reviewed PR.";
    } catch (error) {
      status2.textContent = error.message;
      exportArea.focus();
      exportArea.select();
    }
  }));
  async function refreshPendingBadge() {
    if (!authorized() && !preview) return;
    try {
      const [stamps, payroll] = await Promise.all([loadLedger("victory-stamps.json"), loadLedger("payroll-queue.json")]);
      const rounds = await readArenaRounds();
      const counts2 = pendingCounts({ stamps, payroll, arena: { pending: (rounds || []).filter((round) => round.status === "Open") } });
      const total = waitingTotal(counts2);
      tabs[0].textContent = `Victory Stamps${counts2.stamps ? ` \xB7 ${counts2.stamps}` : ""}`;
      tabs[1].textContent = `Supporter Prizes${counts2.prizes ? ` \xB7 ${counts2.prizes}` : ""}`;
      tabs[2].textContent = `Arena Rounds${counts2.arena ? ` \xB7 ${counts2.arena}` : ""}`;
      tabs[3].textContent = "Decent Pilots";
      if (previewButton) previewButton.textContent = `\u2625 Admin preview \xB7 ${total} waiting for you`;
      adminLabel = `\u{1F6E1} Admin \xB7 ${total} waiting for you`;
      attach2();
    } catch {
      adminLabel = "\u{1F6E1} Admin \xB7 queues unavailable";
      attach2();
    }
  }
  async function ensCache() {
    if (!ensCachePromise) ensCachePromise = mainnetEnsCache().catch(() => null);
    return ensCachePromise;
  }
  async function refreshPrizes() {
    prizeCards.replaceChildren();
    batchPreview.textContent = "";
    prizeQueue = [];
    try {
      const payroll = await loadLedger("payroll-queue.json");
      prizeQueue = (payroll.pending || []).filter(isLegacySupporterRelease);
      if (!prizeQueue.length) {
        prizeCards.append(node("p", "No legacy admin releases waiting. Gameplay captures are collected by the player in the presentation or Flight Logs."));
        return;
      }
      for (const [index, original] of prizeQueue.entries()) {
        const card = node("article");
        const entry = { ...SUPPORTER_PRIZES[String(original.tokenId)] || {}, ...original, nftContract: original.nftContract || original.nft || SUPPORTER_NFT };
        let artwork = entry.image || entry.metadata?.image || "";
        if (!artwork && entry.metadataURI) {
          try {
            const response = await fetch(gatewayUrl(entry.metadataURI, config.gateway), { signal: AbortSignal.timeout(1e4) });
            if (response.ok) artwork = (await response.json()).image || "";
          } catch {
          }
        }
        const icon = node("img", "", { src: artwork ? gatewayUrl(artwork, config.gateway) : "./assets/brand/mandelblum-gate.png", alt: `${entry.project || "Supporter"} token artwork`, loading: "lazy" });
        icon.onerror = () => {
          icon.src = "./assets/game/gate.png";
        };
        card.append(icon, node("h3", entry.label || `${entry.project || "Supporter NFT"} \xB7 #${entry.tokenId}`), node("p", `Tier ${entry.tier ?? "\u2014"} \xB7 token ${entry.tokenId ?? "\u2014"} \xB7 recipient ${entry.player || entry.claimant || "unassigned"}`));
        if (entry.protocol === "reward-bundle/1") card.append(node("p", `${entry.awardKind || "Atomic reward"} \xB7 player claims from VoyagerRewards${entry.bonus ? " \xB7 includes 100 BNut in the same transaction" : ""}. Never release through the legacy NFT-only batch.`));
        const metadataURI = entry.metadataURI || entry.tokenURI || entry.uri;
        if (metadataURI) card.append(link("Prize metadata", gatewayUrl(metadataURI, config.gateway)));
        if (artwork) card.append(link("Token artwork", gatewayUrl(artwork, config.gateway)));
        const check2 = node("input", "", { type: "checkbox", "aria-label": `Select ${entry.label || `token ${entry.tokenId}`}` });
        check2.checked = selected.has(`prize:${index}`);
        check2.disabled = preview || !authorized() || Boolean(entry.protocol || entry.bonus);
        check2.addEventListener("change", () => {
          if (check2.checked) selected.add(`prize:${index}`);
          else selected.delete(`prize:${index}`);
        });
        card.prepend(check2);
        prizeCards.append(card);
        const recipient = entry.player || entry.claimant;
        if (recipient && validAddress(recipient)) {
          const info = node("span", recipient);
          card.append(info);
          void ensCache().then((cache) => cache?.resolve(recipient)).then((identity) => {
            if (identity?.name) {
              info.textContent = `${identity.name} \xB7 ${recipient}`;
              if (identity.avatar) {
                const avatar = node("img", "", { src: identity.avatar, alt: `${identity.name} avatar`, width: "36", height: "36", className: "ens-avatar" });
                card.prepend(avatar);
              }
            }
          });
        }
      }
    } catch (error) {
      prizeCards.append(node("p", error.message));
    }
  }
  async function readArenaRounds() {
    try {
      const response = await fetch(window.DECENT_CONFIG?.voyager?.contracts?.addressesUrl || "./js/chain/addresses.json", { cache: "no-store" });
      if (!response.ok) return null;
      const book = await response.json(), contracts = book.contracts || book;
      const configured = contracts.VoyagerArena || contracts.voyagerArena || contracts.base?.VoyagerArena || contracts["8453"]?.VoyagerArena;
      const arenaAddress = typeof configured === "string" ? configured : configured?.address;
      if (!validAddress(arenaAddress)) return null;
      const ethers = await ethersLibrary(), provider = new ethers.JsonRpcProvider(config.rpcUrl);
      if ((await provider.getNetwork()).chainId !== 8453n) return null;
      const contract = new ethers.Contract(arenaAddress, ["function nextRoundId() view returns (uint256)", "function rounds(uint256) view returns (bytes32,address,uint8,uint8,uint256,uint256,uint8,uint256)"], provider);
      const next = Number(await contract.nextRoundId()), first = Math.max(1, next - 50);
      const rows = await Promise.all(Array.from({ length: Math.max(0, next - first) }, (_, index) => first + index).map(async (id) => {
        const round = await contract.rounds(id), stateCode = Number(round.state ?? round[6]);
        return { id, mode: Number(round.mode ?? round[2]) === 1 ? "versus" : "co-op", maxPlayers: Number(round.maxPlayers ?? round[3]), participantCount: Number(round.participantCount ?? round[7]), status: ["Open", "Settled", "Cancelled"][stateCode] || "Unknown", entryFee: String(round.entryFee ?? round[4]) };
      }));
      return rows.reverse();
    } catch {
      return null;
    }
  }
  async function refreshArena() {
    arenaCards.replaceChildren();
    const rounds = await readArenaRounds();
    if (!rounds) {
      arenaCards.append(node("p", "Arena queue unavailable: VoyagerArena is not deployed/configured on Base."));
      return;
    }
    const pending = rounds.filter((round) => round.status === "Open");
    if (!rounds.length) arenaCards.append(node("p", "No arena rounds have been created on Base yet."));
    for (const round of rounds) arenaCards.append(node("article", `Round ${round.id} \xB7 ${round.mode} \xB7 ${round.status} \xB7 ${round.participantCount}/${round.maxPlayers} pilots \xB7 ${round.entryFee} USDC units`));
    if (pending.length) arenaCards.prepend(node("p", `${pending.length} open arena round(s) waiting for you.`));
  }
  async function runSupporterBatch() {
    try {
      if (preview || !authorized()) throw new Error("Admin wallet required; preview cannot send transactions.");
      const selectedEntries = prizeQueue.filter((_, index) => selected.has(`prize:${index}`)).map((entry) => ({ ...SUPPORTER_PRIZES[String(entry.tokenId)] || {}, ...entry, nftContract: entry.nftContract || entry.nft || SUPPORTER_NFT }));
      if (!selectedEntries.length) throw new Error("Select at least one supporter prize");
      assertLegacySupporterRelease(selectedEntries);
      const response = await fetch(window.DECENT_CONFIG?.voyager?.contracts?.addressesUrl || "./js/chain/addresses.json", { cache: "no-store" });
      if (!response.ok) throw new Error("VoyagerPrizes and escrow addresses are not configured");
      const book = await response.json(), contracts = book.contracts || book;
      const prizeValue = contracts.VoyagerPrizes || contracts.voyagerPrizes || contracts.base?.VoyagerPrizes || contracts["8453"]?.VoyagerPrizes;
      const prizeAddress = typeof prizeValue === "string" ? prizeValue : prizeValue?.address;
      const escrowAddress = contracts.DecentMarketEscrow || contracts.escrow || "0x31b07b83e99A9bdF379bf40225b8A80d3804C89d";
      if (!validAddress(prizeAddress) || !validAddress(escrowAddress)) throw new Error("Supporter release contract addresses are not configured");
      const walletSession = wallet(), provider = walletSession.browserProvider;
      if (!provider || (await provider.getNetwork()).chainId !== 8453n) throw new Error("Connect the admin wallet on Base.");
      const ethers = await ethersLibrary(), signer = await provider.getSigner();
      const escrow = new ethers.Contract(escrowAddress, ["function withdrawNFT(address,uint256,uint256,address)"], signer);
      const prizesContract = new ethers.Contract(prizeAddress, ["function adminRelease(address,address,uint256,uint256)", "function inventory(address,uint256) view returns (uint256)"], signer);
      const batch = selectedEntries.map((entry) => {
        const nft = entry.nftContract || entry.nft || entry.contractAddress || SUPPORTER_NFT;
        const id = String(entry.tokenId ?? entry.id ?? "");
        const to = entry.player || entry.claimant;
        if (!validAddress(nft) || !validAddress(to) || !/^\d+$/.test(id)) throw new Error("Selected prize is missing a valid NFT contract, token ID, or recipient");
        return { label: entry.label || `${entry.project || "Supporter"} #${id}`, nft, tokenId: id, amount: String(entry.amount || 1), recipient: to, escrowArgs: [nft, id, String(entry.amount || 1), prizeAddress], releaseArgs: [to, nft, id, String(entry.amount || 1)] };
      });
      const estimates = [];
      for (const item of batch) {
        const inventory = await prizesContract.inventory(item.nft, item.tokenId), amount = BigInt(item.amount);
        const needsDeposit = inventory < amount;
        const escrowGas = needsDeposit ? await escrow.withdrawNFT.estimateGas(...item.escrowArgs) : null;
        const releaseGas = needsDeposit ? null : await prizesContract.adminRelease.estimateGas(...item.releaseArgs);
        estimates.push({ label: item.label, inventory: String(inventory), needsDeposit, escrowGas: escrowGas == null ? null : String(escrowGas), releaseGas: releaseGas == null ? null : String(releaseGas) });
        item.needsDeposit = needsDeposit;
      }
      batchPreview.textContent = JSON.stringify({ escrow: escrowAddress, voyagerPrizes: prizeAddress, batch, estimates }, null, 2);
      const depositsOnly = batch.some((item) => item.needsDeposit);
      if (!window.confirm(`Simulations ${depositsOnly ? "passed for escrow deposits" : "passed for releases"} across ${batch.length} supporter prize(s). ${depositsOnly ? "Deposit inventory into VoyagerPrizes now; reload and release after confirmation?" : "Confirm VoyagerPrizes.adminRelease transactions?"}`)) return;
      for (const item of batch) {
        if (item.needsDeposit) {
          const withdrawn = await escrow.withdrawNFT(...item.escrowArgs);
          await withdrawn.wait();
        } else {
          const released = await prizesContract.adminRelease(...item.releaseArgs);
          await released.wait();
        }
      }
      status2.textContent = depositsOnly ? "Escrow deposits confirmed where needed. Reload after confirmation to simulate and release from VoyagerPrizes." : `Released ${batch.length} supporter prize(s) to their recipients.`;
      if (!depositsOnly) selected.clear();
      await refreshPrizes();
    } catch (error) {
      status2.textContent = error.message;
    }
  }
  function renderCards() {
    cards.replaceChildren();
    releaseSelected.disabled = preview || !authorized();
    mint.disabled = preview || !authorized() || minting || !!journal || !selected.size;
    switchButton.disabled = preview || !authorized() || minting;
    check.disabled = preview || !authorized() || !journal?.txHash || minting;
    recover.disabled = preview || !authorized() || !journal?.claims || minting;
    if (journal) cards.append(node("p", `Saved/uncertain mint transaction ${journal.txHash || "(unknown)"}. Minting is locked. Check its receipt; never clear storage or re-mint to resolve uncertainty.`));
    if (!queue.pending.length) cards.append(node("p", "No pending victory stamps loaded. An unavailable queue is not proof that no requests exist."));
    for (const claim of queue.pending) {
      const card = node("article");
      const select = node("input", "", { type: "checkbox", "aria-label": `Select ${claim.recordId}` });
      select.checked = selected.has(claim.recordId);
      select.disabled = preview || !authorized() || minting || !!journal || !metadata.has(claim.recordId);
      select.addEventListener("change", () => {
        if (select.checked && selected.size >= 20) {
          select.checked = false;
          status2.textContent = "Select at most 20 stamps";
          return;
        }
        if (select.checked) selected.add(claim.recordId);
        else selected.delete(claim.recordId);
        mint.disabled = preview || !authorized() || minting || !!journal || !selected.size;
      });
      const image = node("img", "", { src: gatewayUrl(claim.image, config.gateway), alt: `Battle card for L${claim.level} ${claim.difficulty}`, loading: "lazy", referrerpolicy: "no-referrer" });
      image.addEventListener("error", () => {
        image.replaceWith(node("p", "Battle thumbnail unavailable \u2014 use the metadata gateway link."));
      }, { once: true });
      card.append(select, image, node("h3", `L${claim.level} \xB7 ${claim.difficulty} \xB7 Score ${claim.score.total}`), node("p", `${claim.completedAt} \xB7 Claimant ${claim.claimant}`), link("Metadata on IPFS", gatewayUrl(claim.tokenURI, config.gateway)));
      if (claim.issueNumber) card.append(link(`Review GitHub issue #${claim.issueNumber}`, `https://github.com/TheJollyLaMa/DecentVoyager/issues/${claim.issueNumber}`));
      if (metadata.has(claim.recordId)) {
        card.append(node("pre", JSON.stringify(metadata.get(claim.recordId).properties.record.stats, null, 2)));
      } else card.append(button("Load & review every stat", async () => {
        try {
          const response = await fetch(gatewayUrl(claim.tokenURI, config.gateway), { signal: AbortSignal.timeout(2e4) });
          if (!response.ok) throw new Error(`Metadata unavailable (${response.status})`);
          const value = await response.json();
          assertJsonSafe(value);
          const record = validateRecord(value.properties?.record);
          if (value.properties?.schema !== "asteroid-victory-metadata/1" || value.properties.chain !== "base" || value.image !== claim.image || value.properties.claimant?.toLowerCase() !== claim.claimant.toLowerCase() || record?.id !== claim.recordId || record.level !== claim.level || record.difficulty !== claim.difficulty || record.completedAt !== claim.completedAt || !["total", "level", "bonus"].every((key) => record.score?.[key] === claim.score[key]) || !record.stats) throw new Error("Metadata does not match this claim");
          metadata.set(claim.recordId, value);
          renderCards();
        } catch (error) {
          status2.textContent = error.message;
        }
      }));
      cards.append(card);
    }
  }
  async function refreshQueue() {
    try {
      queue = parseQueue(await loadLedger("victory-stamps.json"));
      if (journal?.confirmed && journal.export?.every((saved) => queue.minted.some((entry) => entry.recordId === saved.recordId && entry.tokenURI === saved.tokenURI && entry.txHash === saved.txHash && String(entry.tokenId) === saved.tokenId))) {
        report = journal.export;
        exportArea.value = JSON.stringify({ minted: report }, null, 2);
        journal = null;
        localStorage.removeItem(JOURNAL);
      }
      selected.clear();
      metadata.clear();
      renderCards();
      status2.textContent = preview ? "Read-only preview. Public queue loaded." : "Public queue loaded. Review metadata before selecting stamps.";
    } catch (error) {
      status2.textContent = error.message;
      renderCards();
    }
  }
  async function refreshWorkers() {
    workers.replaceChildren(node("h3", "Decent Pilots \xB7 contributor allowlist"));
    try {
      const [accounts, payroll] = await Promise.all([loadLedger("contributor-accounts.json"), loadLedger("payroll-queue.json")]);
      if (!Array.isArray(payroll.pending)) throw new Error("Payroll queue unavailable / invalid");
      for (const worker of parseWorkers(accounts)) {
        const pending = payroll.pending.filter((entry) => entry.contributorGithub?.toLowerCase() === worker.github.toLowerCase());
        const card = node("article");
        card.append(node("h3", worker.displayName || worker.github), link(`@${worker.github}`, `https://github.com/${worker.github}`), node("p", `${worker.role || "Contributor"} \xB7 ${worker.walletAddress || "No wallet \u2014 not eligible for wallet actions"}`), node("p", `Earned: ${JSON.stringify(worker.totalEarnedByCurrency || {})} \xB7 Pending: ${JSON.stringify(worker.pendingBalanceByCurrency || {})}`), node("p", `Issues closed: ${(worker.issuesClosed || []).length}`));
        for (const reference of worker.issuesClosed || []) {
          const match = /^TheJollyLaMa\/(?:DecentVoyager|AsteRoid)#(\d+)$/.exec(reference);
          if (match) card.append(link(`Closed issue #${match[1]}`, `https://github.com/TheJollyLaMa/DecentVoyager/issues/${match[1]}`));
        }
        for (const entry of pending) {
          card.append(node("p", `Pending ${entry.amount} ${entry.currency} \xB7 ${entry.role || "Contributor"}`));
          if (Number.isSafeInteger(entry.issueNumber)) card.append(link(`Issue #${entry.issueNumber}`, `https://github.com/TheJollyLaMa/DecentVoyager/issues/${entry.issueNumber}`));
        }
        workers.append(card);
      }
      workers.append(node("p", "Pilot eligibility requires a wallet address and whitelisted status. Client checks are convenience only; contracts and referee verify eligibility. Payroll settlement is separate and is never initiated here."));
      await Promise.all(parseWorkers(accounts).filter((worker) => validAddress(worker.walletAddress)).map(async (worker) => {
        const identity = await (await ensCache())?.resolve(worker.walletAddress);
        if (!identity?.name) return;
        const card = [...workers.querySelectorAll("article")].find((item) => item.textContent.includes(worker.github));
        if (!card) return;
        const title = card.querySelector("h3");
        title.textContent = identity.name;
        if (identity.avatar) {
          const image = node("img", "", { src: identity.avatar, alt: `${identity.name} avatar`, width: "36", height: "36", className: "ens-avatar" });
          title.before(image);
        }
      }));
    } catch (error) {
      workers.append(node("p", error.message));
    }
  }
  async function contractContext() {
    if (preview || !authorized()) throw new Error("Admin wallet required. Click the header fox; preview cannot mint.");
    const session = wallet(), provider = session.browserProvider;
    if (!provider || (await provider.getNetwork()).chainId !== 8453n) throw new Error("Wallet must be on Base (8453). Use Switch wallet to Base.");
    const ethers = await ethersLibrary();
    await verifyContract(provider, ethers.Contract, config);
    const signer = await provider.getSigner();
    if (!isAdmin(await signer.getAddress(), config.adminWallet)) throw new Error("Wallet changed; reconnect the configured admin.");
    return { contract: new ethers.Contract(config.contractAddress, PRODUCT_BATCH_ABI, signer), provider };
  }
  function publishExport(ids, receipt) {
    report = journal.claims.map((claim, index) => ({ ...claim, tokenId: ids[index], txHash: receipt.hash || journal.txHash, chainId: 8453, contractAddress: config.contractAddress, mintedAt: (/* @__PURE__ */ new Date()).toISOString() }));
    exportArea.value = JSON.stringify({ minted: report }, null, 2);
    journal = { ...journal, confirmed: true, export: report };
    localStorage.setItem(JOURNAL, JSON.stringify(journal));
    const idsSet = new Set(report.map((entry) => entry.recordId));
    queue.pending = queue.pending.filter((entry) => !idsSet.has(entry.recordId));
    queue.minted = queue.minted.filter((entry) => !idsSet.has(entry.recordId));
    queue.minted.push(...report);
    selected.clear();
    status2.textContent = "Confirmed on Base. Copy the export, remove matching pending entries, and append to minted in an owner-reviewed ledger PR. Minting remains locked until the public queue contains these exact confirmations.";
  }
  async function mintSelected() {
    if (minting || journal) return;
    minting = true;
    renderCards();
    try {
      const claims = queue.pending.filter((claim) => selected.has(claim.recordId));
      if (claims.some((claim) => !metadata.has(claim.recordId))) throw new Error("Review metadata for every selected record first");
      const products = buildProducts(claims, config);
      let { contract } = await contractContext();
      const gas = await contract.registerAndMintProductsBatch.estimateGas(products), gasLimit = gas * 120n / 100n;
      if (gasLimit > 8000000n) throw new Error("Gas too high; select fewer stamps");
      status2.textContent = `Estimated gas ${gas}. Limit with 20% margin ${gasLimit}. Contract ${config.contractAddress}`;
      if (!window.confirm(`Mint ${claims.length} one-of-one victory stamps on Base?
Estimated gas: ${gas}; limit: ${gasLimit}
Contract: ${config.contractAddress}
Recipients: the listed claimants
Royalty: ${config.royaltyFeeBps / 100}% to admin
Wallet will show the final fee.`)) return;
      ({ contract } = await contractContext());
      journal = { claims, products, owner: config.adminWallet, contractAddress: config.contractAddress, startedAt: (/* @__PURE__ */ new Date()).toISOString() };
      localStorage.setItem(JOURNAL, JSON.stringify(journal));
      let transaction;
      try {
        transaction = await contract.registerAndMintProductsBatch(products, { gasLimit });
      } catch (error) {
        if (error.code === "ACTION_REJECTED" || error.code === 4001) {
          journal = null;
          localStorage.removeItem(JOURNAL);
        }
        throw error;
      }
      journal.txHash = transaction.hash;
      localStorage.setItem(JOURNAL, JSON.stringify(journal));
      status2.textContent = `Broadcast ${transaction.hash}; waiting for confirmation. Do NOT retry.`;
      const receipt = await transaction.wait();
      publishExport(reconcileReceipt(receipt, contract, products, config.adminWallet), receipt);
    } catch (error) {
      status2.textContent = `${error.message}${journal ? "\nSaved transaction remains locked. Check receipt; do not re-mint." : ""}`;
    } finally {
      minting = false;
      renderCards();
    }
  }
  async function checkSaved() {
    if (!journal?.txHash) return;
    try {
      const { contract, provider } = await contractContext();
      if (journal.contractAddress.toLowerCase() !== config.contractAddress.toLowerCase()) throw new Error("Saved transaction belongs to a different contract. Restore that configuration.");
      const receipt = await provider.getTransactionReceipt(journal.txHash);
      if (!receipt) throw new Error("Transaction still pending or unavailable. Minting remains locked.");
      if (Number(receipt.status) === 0) {
        journal = null;
        localStorage.removeItem(JOURNAL);
        status2.textContent = "Saved transaction reverted; no mint was confirmed. Review before retrying.";
      } else {
        const claims = journal.claims.map(validateClaim);
        const products = buildProducts(claims, config);
        publishExport(reconcileReceipt(receipt, contract, products, config.adminWallet), receipt);
      }
    } catch (error) {
      status2.textContent = error.message;
    }
    renderCards();
  }
  async function open() {
    if (!preview && !authorized()) return;
    openDialog(dialog2);
    await Promise.all([refreshQueue(), refreshWorkers(), refreshPrizes(), refreshArena(), refreshPendingBadge()]);
  }
  const observed2 = /* @__PURE__ */ new WeakSet();
  let adminLabel = "\u{1F6E1} Admin \xB7 waiting for you";
  function attach2(root = document) {
    for (const element of root.querySelectorAll("*")) {
      if (element.localName === "ankh-menu" && element.getAttribute("side") !== "right" && element.shadowRoot) {
        const entry = element.shadowRoot.querySelector(".options button");
        const locked = !preview && !authorized();
        if (entry) {
          entry.hidden = false;
          entry.disabled = locked;
          const label = locked ? "\u{1F6E1} Admin \xB7 connect the admin wallet" : preview ? "\u{1F6E1} Admin (read-only preview)" : adminLabel;
          if (entry.textContent !== label) entry.textContent = label;
          entry.title = locked ? "Admin tools for the Decent Voyager steward wallet." : "";
          entry.style.cursor = locked ? "not-allowed" : "pointer";
          entry.style.opacity = locked ? ".62" : "";
          if (!entry.dataset.asteroidAdmin) {
            entry.dataset.asteroidAdmin = "1";
            entry.addEventListener("click", () => void open());
          }
        }
        element.hidden = false;
        element.style.display = "";
        element.style.visibility = "";
        element.inert = false;
        element.removeAttribute("aria-hidden");
      }
      if (element.shadowRoot) {
        if (!observed2.has(element.shadowRoot)) {
          observed2.add(element.shadowRoot);
          new MutationObserver(() => attach2()).observe(element.shadowRoot, { childList: true, subtree: true });
        }
        attach2(element.shadowRoot);
      }
    }
  }
  new MutationObserver(() => attach2()).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("decenthead:wallet", () => {
    attach2();
    if (!preview && !authorized() && dialog2.open) dialog2.close();
    renderCards();
    if (authorized()) void refreshPendingBadge();
  });
  window.addEventListener("decenthead:ready", () => attach2());
  attach2();
  renderCards();
  if (authorized()) void refreshPendingBadge();
  if (preview) {
    previewButton = button("\u2625 Admin preview \xB7 waiting for you", () => void open());
    previewButton.id = "asteroid-admin-preview";
    document.body.append(previewButton);
    void refreshPendingBadge();
  }
  return { dialog: dialog2, open };
}
if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAdmin, { once: true });
  else mountAdmin();
}
