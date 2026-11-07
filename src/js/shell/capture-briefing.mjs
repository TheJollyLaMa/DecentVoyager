import { bindBackdropClose } from '../dnft/ui.mjs';
import { flightLog } from '../pilots/flight-log.mjs';

export function mountCaptureBriefing({
  getGame = () => window.asteroidGame,
  getDetails = tokenId => window.AsteroidRender.supporterDetails(tokenId),
  isOnline = () => window.voyager?.isNetworkMode?.()
} = {}) {
  const dialog = document.getElementById('supporter-briefing');
  const title = dialog.querySelector('[data-capture-name]');
  const image = dialog.querySelector('[data-capture-image]');
  const imageStatus = dialog.querySelector('[data-capture-image-status]');
  const description = dialog.querySelector('[data-capture-description]');
  const next = dialog.querySelector('[data-capture-next]');
  const resume = dialog.querySelector('[data-capture-resume]');
  const collect = dialog.querySelector('[data-capture-collect]');
  const transferStatus = dialog.querySelector('[data-capture-transfer-status]');
  const queue = [], seen = new Set();
  let pausedByUs = false, presentation = 0;
  const show = () => {
    const capture = queue.shift();
    if (!capture) return;
    const current = ++presentation;
    collect.disabled = false;
    collect.textContent = 'Collect to wallet';
    transferStatus.textContent = '';
    const tokenId = capture.prize?.tokenId ?? capture.tokenId;
    collect.onclick = async () => {
      collect.disabled = true;
      try {
        await flightLog.signFlight({ runLog: capture.run, checkpoint: !capture.kind, tokenId, onStatus: text => { if (current === presentation) transferStatus.textContent = text; } });
        if (current === presentation) collect.textContent = 'Collected';
      } catch (error) { if (current === presentation) { transferStatus.textContent = error.message; collect.disabled = false; } }
    };
    const details = getDetails(capture.prize?.tokenId ?? capture.tokenId);
    title.textContent = details?.name || `Supporter DNFT #${capture.prize?.tokenId ?? capture.tokenId}`;
    description.textContent = details?.description || 'A Supporter capture was recorded. Artwork and project details are unavailable for this token.';
    image.hidden = true;
    imageStatus.textContent = 'Loading the metadata-derived artwork...';
    image.onload = () => { image.hidden = false; imageStatus.textContent = ''; };
    image.onerror = () => { image.hidden = true; imageStatus.textContent = 'Artwork unavailable. Open NFT metadata below to view its source.'; };
    if (details) { image.alt = details.name; image.src = new URL(details.image, document.baseURI).href; }
    else { image.removeAttribute('src'); imageStatus.textContent = 'Artwork unavailable for this token.'; }
    for (const [key, property] of [['project', 'projectUrl'], ['support', 'supportUrl'], ['canopy', 'canopyUrl'], ['metadata', 'metadataUrl'], ['token', 'tokenUrl']]) {
      const link = dialog.querySelector(`[data-capture-link="${key}"]`);
      link.hidden = !details;
      if (details) link.href = details[property];
      else link.removeAttribute('href');
      if (key === 'support' && details) link.textContent = `Support this project · ${details.supportPriceUSDC} USDC listing ↗`;
    }
    const online = isOnline();
    const game = getGame();
    if (!dialog.open) {
      pausedByUs = !online && game?.state === 'playing';
      if (pausedByUs) game.handleAction('pause');
      dialog.showModal();
    }
    next.textContent = `${capture.kind ? '' : 'Team power refilled. '}Collect now: sign the flight evidence, then approve the Base transfer. You pay Base gas. Or dismiss and collect later from Flight Logs; your captured checkpoint stays on this device.`;
    dialog.querySelector('[data-capture-pause-note]').textContent = online
      ? 'Online battle continues on the referee. Close this briefing promptly to keep flying.'
      : 'Your local battle is paused while you inspect the reward.';
    resume.hidden = !queue.length;
    resume.textContent = 'View next reward';
    window.asteroidDraw?.();
  };
  const continueFlight = () => {
    queue.length = 0;
    dialog.close();
    const game = getGame();
    if (pausedByUs && game?.state === 'paused' && !isOnline()) game.handleAction('pause');
    pausedByUs = false;
    document.getElementById('gameCanvas')?.focus({ preventScroll: true });
    window.asteroidDraw?.();
  };
  resume.addEventListener('click', show);
  dialog.querySelector('[data-capture-dismiss]').addEventListener('click', continueFlight);
  dialog.addEventListener('cancel', event => { event.preventDefault(); continueFlight(); });
  bindBackdropClose(dialog, continueFlight);
  window.addEventListener('asteroid:event', event => {
    if (event.detail?.type !== 'supporterCaptured') return;
    const capture = event.detail;
    const key = `${getGame()?.runId}:${capture.prize?.tokenId ?? capture.tokenId}:${capture.tier}`;
    if (seen.has(key)) return;
    if (seen.size >= 40) seen.delete(seen.values().next().value);
    seen.add(key);
    queue.push({ ...capture, run: getGame()?.getRunLog?.() });
    if (!dialog.open) show();
    else resume.hidden = false;
  });
  return { continueFlight };
}

if (typeof document !== 'undefined') mountCaptureBriefing();
