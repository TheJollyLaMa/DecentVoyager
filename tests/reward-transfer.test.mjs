import test from 'node:test';
import assert from 'node:assert/strict';
import { transferReward } from '../src/js/pilots/reward-transfer.mjs';
import { createRewardState } from '../src/js/pilots/reward-state.mjs';
import { createRunOutbox } from '../src/js/pilots/run-outbox.mjs';

const address = '0x0000000000000000000000000000000000000001';
const nft = '0x0000000000000000000000000000000000000002';
const voucher = { kind: 'prize', protocol: 'reward-bundle/1', digest: 'reward-digest', signature: 'signed',
  voucher: { player: address, nftContract: nft, tokenId: '70', deadline: Math.floor(Date.now() / 1000) + 3600 } };
function fixture({ alreadyClaimed = false, reject = false, receiptStatus = 1, replacement = false } = {}) {
  let claimed = alreadyClaimed, sends = 0;
  const updates = [], messages = [];
  const claim = async (...parameters) => {
    sends++;
    assert.equal(parameters.length, 3);
    assert.equal(parameters[2].gasLimit, 120n);
    if (reject) throw new Error('User rejected transaction');
    return { hash: 'original', wait: async () => {
      claimed = receiptStatus === 1;
      const receipt = { hash: replacement ? 'replacement' : 'original', status: receiptStatus };
      if (replacement) throw Object.assign(new Error('Replaced'), { code: 'TRANSACTION_REPLACED', cancelled: false, receipt });
      return receipt;
    } };
  };
  claim.estimateGas = async () => 100n;
  const options = { address, wallet: { snapshot: () => ({ connected: true, address }), ensureChain: async chain => {
    assert.equal(chain.chainId, 8453);
    return { getSigner: async () => ({ getAddress: async () => address }) };
  } }, ethers: { Contract: class { constructor() { this.claim = claim; this.claimedToken = async () => claimed; } }, id: value => value },
  fetchImpl: async () => ({ ok: true, json: async () => ({ VoyagerRewards: nft }) }),
  onStatus: text => messages.push(text), onSubmitted: value => updates.push(value), onConfirmed: value => updates.push(value) };
  return { options, updates, messages, sends: () => sends };
}
test('one explicit collect action transfers the bundle with no native confirmation', async () => {
  const f = fixture();
  await transferReward(voucher, f.options);
  assert.equal(f.sends(), 1);
  assert.deepEqual(f.updates, [{ status: 'submitted', txHash: 'original' }, { status: 'collected', txHash: 'original' }]);
  assert.match(f.messages.at(-1), /Base confirmed/);
});
test('already collected rewards never submit another transaction, even when expired', async () => {
  const f = fixture({ alreadyClaimed: true });
  await transferReward({ ...voucher, voucher: { ...voucher.voucher, deadline: 1 } }, f.options);
  assert.equal(f.sends(), 0);
  assert.equal(f.updates[0].status, 'collected');
});
test('rejection and reverted receipt never report a successful transfer', async () => {
  for (const config of [{ reject: true }, { receiptStatus: 0 }]) {
    const f = fixture(config);
    await assert.rejects(transferReward(voucher, f.options), /rejected|not confirmed/);
    assert.equal(f.updates.some(update => update.status === 'collected'), false);
  }
});
test('successful replacement records the replacement receipt, not a second transfer', async () => {
  const f = fixture({ replacement: true });
  await transferReward(voucher, f.options);
  assert.equal(f.updates.at(-1).txHash, 'replacement');
  assert.equal(f.sends(), 1);
});
test('wallet mismatch, missing signature and expired vouchers fail before sending', async () => {
  for (const changed of [
    { ...voucher, voucher: { ...voucher.voucher, player: nft } },
    { ...voucher, signature: null },
    { ...voucher, voucher: { ...voucher.voucher, deadline: 1 } }
  ]) {
    const f = fixture();
    await assert.rejects(transferReward(changed, f.options), /different wallet|signature|expired/);
    assert.equal(f.sends(), 0);
  }
});
test('checkpoints survive reload, stay wallet-scoped, and accepted vouchers persist before outbox removal', async () => {
  const values = new Map(), storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const state = createRewardState({ storage });
  const run = { runId: 'flight' }, capture = { tier: 1, prize: { tokenId: '70' } };
  state.put({ id: 'capture:flight:70', kind: 'capture', address, run, capture, status: 'captured' });
  state.put({ id: 'capture:flight:70', kind: 'capture', address: nft, run, capture, status: 'captured' });
  const restored = createRewardState({ storage });
  assert.equal(restored.read().length, 2);
  const outbox = createRunOutbox({ storage, baseUrl: () => 'https://referee.example', onAccepted: state.accept,
    fetchImpl: async (url, init) => {
      assert.equal(url, 'https://referee.example/captures');
      assert.equal(JSON.parse(init.body).checkpoint, true);
      return { ok: true, json: async () => ({ vouchers: [voucher] }) };
    } });
  await outbox.enqueue({ run, address, runHash: 'hash', signature: 'flight-signature', checkpoint: true });
  assert.equal(outbox.read().length, 0);
  assert.equal(restored.read().find(entry => entry.address === address && entry.kind === 'capture').status, 'verified');
  assert.equal(restored.read().find(entry => entry.address === nft).status, 'captured');
  assert.equal(restored.read().find(entry => entry.kind === 'voucher').voucher.digest, voucher.digest);
  state.put({ id: `voucher:${voucher.digest}`, address, status: 'submitted', txHash: 'pending-hash' });
  state.accept({ run, address, runHash: 'later-hash' }, { vouchers: [voucher] });
  assert.equal(restored.read().find(entry => entry.kind === 'voucher').status, 'submitted', 'later checkpoint cannot unlock a pending transfer');
  assert.equal(restored.read().find(entry => entry.kind === 'voucher').txHash, 'pending-hash');
});
test('failure to persist verification retains original signed evidence for retry', async () => {
  const outbox = createRunOutbox({ storage: null, baseUrl: () => 'https://referee.example',
    fetchImpl: async () => ({ ok: true, json: async () => ({ vouchers: [voucher] }) }),
    onAccepted: () => { throw new Error('Storage full'); } });
  await outbox.enqueue({ run: { runId: 'flight' }, address, runHash: 'original-hash', signature: 'original-signature' });
  assert.equal(outbox.read()[0].signature, 'original-signature');
  assert.match(outbox.read()[0].lastError, /Storage full/);
});
test('outbox quota failure retains the new signature in memory and does not submit or report success', async () => {
  let calls = 0;
  const outbox = createRunOutbox({ storage: { getItem: () => '[]', setItem: () => { throw new Error('Quota exceeded'); } },
    fetchImpl: async () => { calls++; } });
  await assert.rejects(outbox.enqueue({ address, runHash: 'new', signature: 'new-signature' }), /Could not persist signed flight evidence/);
  assert.equal(outbox.read()[0].signature, 'new-signature');
  assert.equal(calls, 0);
});
