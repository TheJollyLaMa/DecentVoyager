import { node, button, link } from '../dnft/ui.mjs';
import { flightLog } from './flight-log.mjs';
import { OUTBOX_KEY } from './run-outbox.mjs';
import { REWARD_KEY, rewardState } from './reward-state.mjs';
import { rewardContract } from './reward-transfer.mjs';

export function normalizeVouchers(value) {
  const payload = value || {};
  const entries = Array.isArray(payload) ? payload : payload.vouchers || [];
  if (entries.length) return {
    stamps: entries.filter(item => item.kind === 'stamp').map(item => ({ ...item, voucher: item.voucher || item })),
    prizes: entries.filter(item => item.kind === 'prize').map(item => ({ ...item, voucher: item.voucher || item }))
  };
  return { stamps: payload.stamps || payload.victoryStamps || [], prizes: payload.prizes || payload.supporterPrizes || [] };
}

export function mountRewardGallery(root, {
  fetchImpl = globalThis.fetch, outbox = flightLog?.outbox,
  getDetails = tokenId => window.AsteroidRender?.supporterDetails?.(tokenId)
} = {}) {
  const status = node('p', '', { role: 'status', 'aria-live': 'polite', className: 'asteroid-status' });
  const list = node('section', '', { 'aria-label': 'Captured NFTs' });
  root.append(node('h2', 'Captured NFTs'), node('p', 'Inspect the projects you captured. Collect here or during the battle: sign the evidence, then approve the Base transfer. Base gas is paid by your wallet.'),
    button('Refresh captured NFTs', () => void load()), status, list);
  let generation = 0, pilot = window.__voyagerPilot || {};
  let active = false;
  const message = text => { status.textContent = text; };
  const local = address => rewardState().read().filter(entry => entry.address.toLowerCase() === address.toLowerCase());
  function draw(address, remote = []) {
    list.replaceChildren();
    const saved = local(address);
    const vouchers = [...new Map([...saved.filter(entry => entry.kind === 'voucher').map(entry => entry.voucher), ...remote]
      .filter(entry => entry.voucher?.player?.toLowerCase() === address.toLowerCase())
      .map(entry => [entry.digest || `${entry.kind}:${entry.voucher?.recordId || entry.voucher?.tokenId}`, entry])).values()];
    const entries = [
      ...vouchers.map(voucher => ({ kind: 'voucher', voucher, ...saved.find(entry => entry.kind === 'voucher' && entry.voucher.digest === voucher.digest) })),
      ...saved.filter(entry => entry.kind === 'capture' && !vouchers.some(voucher => voucher.kind === 'prize' &&
        String(voucher.tokenId ?? voucher.voucher?.tokenId) === String(entry.capture.prize?.tokenId ?? entry.capture.tokenId)))
    ];
    const pending = (outbox?.read() || []).filter(entry => entry.address.toLowerCase() === address.toLowerCase());
    for (const item of pending) {
      const row = node('article');
      row.append(node('h3', 'Signed evidence awaiting verification'), node('p', item.lastError || 'Referee verification queued.'));
      row.append(button('Verify & collect', async () => {
        try { await flightLog.retryAndCollect(message); } catch (error) { message(error.message); }
        finally { void load(); }
      }));
      list.append(row);
    }
    if (!entries.length) list.append(node('p', 'No captured NFTs saved for this wallet yet. Verified vouchers from earlier visits appear here too.'));
    for (const entry of entries) {
      const voucher = entry.voucher, args = voucher?.voucher;
      const tokenId = voucher ? voucher.tokenId ?? args?.tokenId : entry.capture.prize?.tokenId ?? entry.capture.tokenId;
      const details = voucher?.kind === 'stamp' ? null : getDetails(tokenId);
      const row = node('article', '', { className: 'reward-card' });
      row.append(node('h3', details?.name || (voucher?.kind === 'stamp' ? `Level ${args.level} achievement NFT` : `Supporter DNFT #${tokenId}`)));
      if (details) {
        const image = node('img', '', { src: details.image, alt: details.name, loading: 'lazy' });
        image.addEventListener('error', () => { image.hidden = true; row.append(node('p', 'Artwork unavailable; project and metadata links remain below.')); }, { once: true });
        row.append(image, node('p', details.description));
        const links = node('nav', '', { 'aria-label': `${details.name} project links` });
        for (const [label, key] of [['Explore project', 'projectUrl'], ['DecentCanopy', 'canopyUrl'], ['NFT metadata', 'metadataUrl'], ['NFT on Base', 'tokenUrl']]) {
          if (details[key]) links.append(link(label, details[key]));
        }
        row.append(links);
      }
      if (voucher?.awardKind) row.append(node('p', voucher.awardKind.replaceAll('-', ' ')));
      if (voucher?.bonus) row.append(node('p', 'NFT and bonus transfer together in this Base transaction.'));
      const state = node('p', entry.status === 'collected' ? 'Collected on Base.' : entry.status === 'submitted' ? 'Transfer submitted; checking Base confirmation.' : voucher ? 'Verified. Checking Base collection status...' : 'Captured checkpoint saved on this device. Ready to sign & collect.', { role: 'status' });
      row.append(state);
      if (entry.txHash) row.append(link('Transfer on BaseScan', `https://basescan.org/tx/${entry.txHash}`));
      const collect = button(voucher ? 'Collect to wallet' : 'Sign & collect', async () => {
        collect.disabled = true;
        const report = text => { state.textContent = text; message(text); };
        try {
          if (voucher) await flightLog.transfer(voucher, report);
          else await flightLog.signFlight({ runLog: entry.run, checkpoint: !entry.capture.kind, tokenId, onStatus: report });
          collect.textContent = 'Collected';
        } catch (error) { report(error.message); collect.disabled = false; }
      });
      collect.disabled = !!voucher || entry.status === 'collected';
      if (entry.status === 'collected') collect.textContent = 'Collected';
      row.append(collect);
      list.append(row);
      if (voucher) void check(voucher, entry, state, collect, address, generation);
    }
    window.dispatchEvent(new CustomEvent('voyager:rewards-count', { detail: { count: entries.filter(entry => entry.status !== 'collected').length } }));
  }
  async function check(voucher, entry, state, collect, address, request) {
    try {
      const ethers = window.ethers || await (await import('../../vendor/decent-head/2.0.0/js/wallet.js')).loadEthers();
      const context = await rewardContract(voucher, { ethers, address, fetchImpl, readOnly: true });
      let claimed;
      try { claimed = await context.claimed(); }
      finally { context.provider.destroy?.(); }
      if (request !== generation || address !== pilot.address || !active) return;
      if (claimed) {
        state.textContent = 'Collected on Base. This records the transfer, not your current NFT balance.';
        collect.textContent = 'Collected';
        if (entry.status !== 'collected') rewardState().put({ id: `voucher:${voucher.digest}`, kind: 'voucher', address, voucher, status: 'collected' });
      } else if (entry.status === 'submitted') {
        state.textContent = 'Transfer submitted. Use Collect to check its receipt before retrying.';
        collect.textContent = 'Check transfer';
        collect.disabled = false;
      } else {
        const expired = !Number.isFinite(Number(voucher.voucher.deadline)) || Number(voucher.voucher.deadline) * 1000 <= Date.now();
        state.textContent = expired ? 'Voucher expired. A new flight or support review is needed.' : 'Verified and ready. Approve the Base transfer to collect.';
        collect.disabled = expired;
      }
    } catch (error) {
      if (request === generation && address === pilot.address) {
        state.textContent = `Base status unavailable: ${error.message}. Collect will recheck before sending.`;
        collect.disabled = false;
      }
    }
  }
  async function load() {
    if (!active) return;
    const request = ++generation, address = pilot.address;
    list.replaceChildren();
    if (!pilot.isPilot || !address) { message('Connect a Decent Pilot wallet with the header fox to see its captured NFTs.'); return; }
    try { draw(address); } catch (error) { message(`Reward history unavailable: ${error.message}`); return; }
    const base = window.DECENT_CONFIG?.voyager?.refereeUrl;
    if (!base) { message('Referee unavailable. Saved checkpoints remain here; collection needs verification.'); return; }
    try {
      const response = await fetchImpl(`${base.replace(/\/$/, '')}/vouchers/${encodeURIComponent(address)}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Voucher service unavailable (${response.status})`);
      const normalized = normalizeVouchers(await response.json());
      if (request !== generation || address !== pilot.address || !active) return;
      draw(address, [...normalized.stamps.map(entry => ({ ...entry, kind: 'stamp' })), ...normalized.prizes.map(entry => ({ ...entry, kind: 'prize' }))]);
      message('');
    } catch (error) { if (request === generation) message(`${error.message}. Saved captures remain available above.`); }
  }
  window.addEventListener('voyager:pilot', event => { pilot = event.detail || {}; void load(); });
  window.addEventListener('voyager:flight-outbox-changed', () => void load());
  window.addEventListener('storage', event => { if ([OUTBOX_KEY, REWARD_KEY].includes(event.key)) void load(); });
  return { load, activate: () => { active = true; void load(); }, deactivate: () => { active = false; generation++; } };
}
export function mountRewards() {
  window.addEventListener('voyager:open-rewards', event => window.dispatchEvent(new CustomEvent('voyager:open-vault', { detail: event.detail })));
}
if (typeof document !== 'undefined') mountRewards();
