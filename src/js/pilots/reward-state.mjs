export const REWARD_KEY = 'decent-voyager-rewards/1';

export function createRewardState({ storage = globalThis.localStorage, onChange = () => {} } = {}) {
  const read = () => {
    const value = JSON.parse(storage.getItem(REWARD_KEY) || '[]');
    if (!Array.isArray(value)) throw new Error('Saved reward history is invalid.');
    return value;
  };
  const put = entry => {
    const entries = read();
    const index = entries.findIndex(item => item.id === entry.id && item.address.toLowerCase() === entry.address.toLowerCase());
    if (index < 0) entries.push(entry);
    else entries[index] = { ...entries[index], ...entry };
    storage.setItem(REWARD_KEY, JSON.stringify(entries));
    onChange();
    return entry;
  };
  const accept = (item, result) => {
    put({ id: `verification:${item.runHash}`, kind: 'verification', address: item.address, runId: item.run.runId, runHash: item.runHash, status: 'verified', result });
    for (const voucher of result.vouchers || []) {
      const previous = read().find(entry => entry.id === `voucher:${voucher.digest}` && entry.address.toLowerCase() === item.address.toLowerCase());
      put({
        id: `voucher:${voucher.digest}`, address: item.address, kind: 'voucher', voucher,
        runId: previous?.runId || item.run.runId, status: previous?.status || 'verified'
      });
    }
    const capture = read().filter(entry => entry.kind === 'capture' && entry.run?.runId === item.run.runId &&
      entry.address.toLowerCase() === item.address.toLowerCase());
    for (const entry of capture) {
      const voucher = (result.vouchers || []).find(value => value.kind === 'prize' &&
        String(value.tokenId ?? value.voucher?.tokenId) === String(entry.capture.prize?.tokenId ?? entry.capture.tokenId));
      if (voucher) put({ ...entry, voucher, status: entry.status === 'collected' ? 'collected' : 'verified' });
      else if (result.queue?.some(value => value.status === 'already-claimed' &&
        String(value.tokenId) === String(entry.capture.prize?.tokenId ?? entry.capture.tokenId))) put({ ...entry, status: 'collected' });
    }
  };
  return { read, put, accept };
}

let state;
export function rewardState() {
  if (!state) state = createRewardState({ onChange: () => window.dispatchEvent(new CustomEvent('voyager:reward-history-changed')) });
  return state;
}
