import { createRunOutbox } from './run-outbox.mjs';
import { createRunTicketManager } from './ticket.mjs';
import { rewardState } from './reward-state.mjs';
import { rewardContract, transferReward } from './reward-transfer.mjs';
const pilot = { address: null, isPilot: false };
let records = [], captures = [], runId = null, promptedRun = null;
const outbox = createRunOutbox({ onAccepted: (item, result) => rewardState().accept(item, result), onChange: () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('voyager:flight-outbox-changed'));
} });

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
export function logHash(runLog, ethers = globalThis.ethers) {
  if (!ethers?.keccak256 || !ethers?.toUtf8Bytes) throw new Error('Wallet signing library is unavailable');
  return ethers.keccak256(ethers.toUtf8Bytes(stableJson(runLog)));
}

export function mountFlightLog({ getGame = () => window.voyager?.game || window.asteroidGame, getWallet = () => window.DecentHead?.getWallet?.(), onStatus = () => {}, fetchImpl = globalThis.fetch } = {}) {
  const action = document.getElementById('flight-sign');
  const prompt = document.getElementById('flight-sign-prompt');
  const promptNote = document.getElementById('flight-sign-note');
  const retryAction = document.getElementById('flight-retry');
  const status = document.getElementById('flight-status');
  const transferring = new Set();
  let statusTimer = null;
  const notify = text => {
    clearTimeout(statusTimer);
    if (status) status.textContent = text;
    if (promptNote && prompt && !prompt.hidden && text && text !== 'Referee flight ticket ready for your next launch.') promptNote.textContent = text;
    onStatus(text);
    if (text === 'Referee flight ticket ready for your next launch.') {
      statusTimer = setTimeout(() => { if (status?.textContent === text) status.textContent = ''; onStatus(''); }, 5000);
    }
  };
  const offerKey = 'decent-voyager-recent-offers/1';
  const offers = () => {
    const value = JSON.parse(localStorage.getItem(offerKey) || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Saved Supporter offer history is invalid.');
    return value;
  };
  const tickets = createRunTicketManager({ fetchImpl, getGame, onStatus: notify,
    getRecentOffers: address => offers()[address.toLowerCase()] || []
  });
  const refreshPrompt = () => {
    if (!prompt) return;
    const state = getGame()?.state;
    prompt.hidden = !action || action.hidden || !['gameOver', 'victory'].includes(state);
    prompt.toggleAttribute('data-victory', state === 'victory');
  };
  window.setInterval(refreshPrompt, 250);
  const refreshOutbox = () => { if (retryAction) retryAction.hidden = !pilot.isPilot || !outbox.read().length; }
  retryAction?.addEventListener('click', async () => { try { await retryAndCollect(); refreshOutbox(); } catch (error) { notify(error.message); } });
  window.addEventListener('voyager:pilot', event => { pilot.address = event.detail?.address || null; pilot.isPilot = !!event.detail?.isPilot; tickets.setPilot(pilot); if (!pilot.isPilot && action) action.hidden = true; if (pilot.isPilot) { void outbox.retry().finally(refreshOutbox); } else refreshOutbox(); });
  window.setInterval(() => { if (pilot.isPilot && outbox.read().length) void outbox.retry().finally(refreshOutbox); }, 60000);
  refreshOutbox();
  window.addEventListener('asteroid:event', event => {
    const detail = event.detail || {};
    if (detail.type === 'vaultSpawned') {
      try {
        const game = getGame(), tokenId = game?.vault?.prize?.tokenId, address = game?.pilot?.address?.toLowerCase();
        if (address && Number.isSafeInteger(tokenId)) {
          const history = offers();
          history[address] = [...(history[address] || []).filter(token => token !== tokenId), tokenId].slice(-2);
          localStorage.setItem(offerKey, JSON.stringify(history));
        }
      } catch (error) { notify(`Could not save Supporter rotation history: ${error.message}`); }
    }
    if (detail.type === 'levelStart') {
      const currentId = getGame()?.getRunLog?.()?.runId || null;
      if (currentId && currentId !== runId) { records = []; captures = []; promptedRun = null; if (action) action.hidden = true; tickets.runStarted(currentId); }
      runId = currentId || runId;
    }
    if (detail.type === 'levelRecord' && detail.record && !records.some(record => record.id === detail.record.id)) { records.push(detail.record); }
    if (detail.type === 'supporterCaptured') {
      captures.push(detail);
      queueMicrotask(() => {
        try {
          const run = getGame()?.getRunLog?.();
          if (pilot.address && run?.ticket) rewardState().put({ id: `capture:${run.runId}:${detail.prize?.tokenId ?? detail.tokenId}`, kind: 'capture',
            address: run.pilot.address, run, capture: detail, status: 'captured' });
        } catch (error) { notify(`Could not save captured reward: ${error.message}`); }
      });
    }
    if (detail.type === 'victory' || detail.type === 'gameOver') {
      if (detail.type === 'gameOver') void tickets.refresh();
      const game = getGame();
      runId = game?.getRunLog?.()?.runId || runId || `voyager-${Date.now()}`;
      if (pilot.isPilot && promptedRun !== runId && (records.some(record => record.level === 20) || captures.length)) {
        promptedRun = runId;
        const hasTicket = !!game?.getRunLog?.()?.ticket;
        if (!hasTicket) notify('Rewards need a referee flight ticket. No ticket was attached; GitHub fallback: ☥ profile → Flight Logs → Request mint on GitHub.');
        if (action) {
          action.hidden = !hasTicket; action.disabled = false; action.textContent = 'Sign & collect rewards';
          if (promptNote) promptNote.textContent = 'Verify this flight, then approve the Base transfer in your wallet.';
          action.onclick = async () => {
            action.disabled = true; action.textContent = 'Confirm in your wallet';
            try { await signFlight(); action.hidden = true; }
            catch (error) { notify(error.message); action.disabled = false; action.textContent = 'Sign & collect rewards'; }
            finally { refreshPrompt(); }
          };
        }
      }
    }
    refreshPrompt();
  });
  async function transfer(entry, onStatus = notify) {
    if (!pilot.isPilot || !pilot.address) throw new Error('Decent Pilot wallet required.');
    const address = pilot.address;
    const identity = `${address.toLowerCase()}:${entry.digest}`;
    if (transferring.has(identity)) throw new Error('This reward transfer is already in progress. Check your wallet.');
    transferring.add(identity);
    try {
      const ethers = window.ethers || await (await import('../../vendor/decent-head/2.0.0/js/wallet.js')).loadEthers();
      const remember = update => {
        rewardState().put({ id: `voucher:${entry.digest}`, kind: 'voucher', address, voucher: entry, ...update });
      };
      const previous = rewardState().read().find(item => item.id === `voucher:${entry.digest}` && item.address.toLowerCase() === address.toLowerCase());
      if (previous?.status === 'submitted') {
        const context = await rewardContract(entry, { ethers, address, fetchImpl, readOnly: true });
        try {
          if (await context.claimed()) { remember({ status: 'collected', txHash: previous.txHash }); onStatus('Base confirmed this reward was collected.'); return; }
          const receipt = await context.provider.getTransactionReceipt(previous.txHash);
          if (!receipt) throw new Error('Your transfer is still pending or its receipt is unavailable. Check the BaseScan link in Flight Logs; no duplicate transaction was sent.');
          if (Number(receipt.status) === 1) throw new Error('Transaction succeeded but reward collection is not confirmed. Inspect its BaseScan receipt before retrying.');
          remember({ status: 'verified', txHash: previous.txHash });
        } finally { context.provider.destroy?.(); }
      }
      await transferReward(entry, { wallet: getWallet(), address, ethers, fetchImpl, onStatus, onSubmitted: remember, onConfirmed: remember });
    } finally { transferring.delete(identity); }
  }
  async function retryAndCollect(onStatus = notify) {
    if (!pilot.isPilot || !pilot.address) throw new Error('Decent Pilot wallet required.');
    const address = pilot.address;
    await outbox.retry();
    if (pilot.address !== address) throw new Error('Wallet changed; reconnect and retry.');
    const pending = outbox.read().filter(entry => entry.address.toLowerCase() === address.toLowerCase());
    if (pending.length) throw new Error(`Verification is queued. ${pending[0].lastError || ''}`);
    const entries = rewardState().read().filter(entry => entry.kind === 'voucher' && entry.address.toLowerCase() === address.toLowerCase() && entry.status !== 'collected');
    for (const entry of entries) await transfer(entry.voucher, onStatus);
    if (!entries.length) onStatus('No uncollected verified rewards. Open Flight Logs to inspect past captures.');
  }
  async function signFlight({ runLog: savedRun, checkpoint = false, tokenId, onStatus = notify } = {}) {
    if (!pilot.isPilot || !pilot.address) throw new Error('Decent Pilot wallet required');
    const session = getWallet(), game = getGame();
    if (!session?.browserProvider || !game?.getRunLog) throw new Error('Wallet or flight log is unavailable');
    const runLog = savedRun || game.getRunLog();
    if (!runLog || typeof runLog !== 'object') throw new Error('Run log is unavailable');
    if (!runLog.ticket) throw new Error('Rewards need a referee flight ticket. GitHub fallback: ☥ profile → Flight Logs → Request mint on GitHub.');
    if (runLog.pilot?.address?.toLowerCase() !== pilot.address.toLowerCase()) throw new Error('This captured flight belongs to a different wallet.');
    const address = pilot.address;
    const ethers = window.ethers || await (await import('../../vendor/decent-head/2.0.0/js/wallet.js')).loadEthers();
    const runHash = logHash(runLog, ethers);
    const state = rewardState();
    const verified = () => state.read().find(entry => entry.id === `verification:${runHash}` && entry.address.toLowerCase() === address.toLowerCase());
    if (!verified()) {
      const queued = outbox.read().find(entry => entry.runHash === runHash && entry.address.toLowerCase() === address.toLowerCase());
      let signature = queued?.signature;
      if (!signature) {
        const signer = await session.browserProvider.getSigner();
        if ((await signer.getAddress()).toLowerCase() !== address.toLowerCase()) throw new Error('Wallet changed; reconnect and retry');
        onStatus('Sign the captured flight evidence in your wallet.');
        signature = await signer.signMessage(runHash);
      }
      if (pilot.address !== address) throw new Error('Wallet changed; reconnect and retry.');
      onStatus('Verifying the flight with the referee...');
      await outbox.enqueue({ address, run: runLog, runHash, signature, checkpoint });
    }
    refreshOutbox();
    const result = verified()?.result;
    if (!result) throw new Error(`Signed evidence saved; verification is queued. ${outbox.read().find(entry => entry.runHash === runHash)?.lastError || 'Retry from Flight Logs.'}`);
    if (pilot.address !== address) throw new Error('Wallet changed; reconnect and retry.');
    const entries = (result.vouchers || []).filter(entry => tokenId == null || (entry.kind === 'prize' && String(entry.tokenId ?? entry.voucher?.tokenId) === String(tokenId)));
    for (const entry of entries) await transfer(entry, onStatus);
    if (!entries.length) {
      if (result.queue?.some(entry => entry.status === 'already-claimed')) onStatus('Base reports these captured rewards were already collected.');
      else throw new Error('No transferable reward was returned. Your evidence is saved; inspect Flight Logs.');
    }
    return result;
  }
  return { signFlight, transfer, retryAndCollect, outbox, tickets, records: () => [...records], captures: () => [...captures] };
}
export const flightLog = typeof window !== 'undefined' && typeof document !== 'undefined' ? mountFlightLog() : null;
