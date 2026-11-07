'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { Wallet } = require('ethers');
const { createService } = require('../src/index');
const { createQueueWriter } = require('../src/queue-writer');
const { makeVoucherService } = require('../src/vouchers');
const { runHash } = require('../src/run-verifier');
const { stableJson } = require('../src/run-verifier');
const { createHmac } = require('node:crypto');
const Game = require('../../src/js/game');
const inputLog = require('../../src/js/inputlog');
const { PRIZES } = require('../../src/js/prizes');

test('capture checkpoints redeem mid-level and extend to second capture and final run without duplicate reservations', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'voyager-checkpoints-'));
  const player = Wallet.createRandom();
  const queues = createQueueWriter({ repoRoot: root });
  let result = { state: 'playing', records: [], captures: [{ tier: 1, level: 9, prize: PRIZES[1][0] }] };
  const service = createService({
    env: { TICKET_SECRET: 'test-secret-with-at-least-thirty-two-bytes!' }, queues,
    pilotRegistry: { isPilot: async () => true },
    rewardInventory: { read: async () => ({ stock: 100, claimed: false }) },
    vouchers: makeVoucherService({ privateKey: Wallet.createRandom().privateKey, chainId: 8453,
      rewardsAddress: '0x0000000000000000000000000000000000000003' }),
    replay: async () => result
  });
  await new Promise(resolve => service.server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await new Promise(resolve => service.server.close(resolve)); await rm(root, { recursive: true }); });
  const ticket = service.ticketService.issue(player.address);
  const run = { runId: 'campaign-checkpoints', ruleset: ticket.ticket.ruleset, seed: ticket.ticket.seed, ticket,
    difficulty: 'pilot', players: 1, startLevel: 1, pilot: { address: player.address, isPilot: true }, frames: inputLog.encode([[{ fire: true }]]) };
  const post = async (endpoint, value) => {
    const response = await fetch(`http://127.0.0.1:${service.server.address().port}/${endpoint}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ address: player.address, run: value, signature: await player.signMessage(runHash(value)) })
    });
    return { status: response.status, body: await response.json() };
  };
  const first = await post('captures', run);
  assert.equal(first.status, 201, JSON.stringify(first.body));
  assert.equal(first.body.vouchers.length, 1);
  assert.equal((await queues.read('prizes')).pending.length, 1);
  assert.equal((await post('captures', run)).status, 200);
  const later = { ...run, frames: inputLog.encode([[{ fire: true }], [{ fire: true }], [{}]]) };
  result = { ...result, captures: [...result.captures, { tier: 2, level: 19, prize: PRIZES[2][0] }] };
  const second = await post('captures', later);
  assert.equal(second.status, 201, JSON.stringify(second.body));
  assert.equal(second.body.vouchers[0].digest, first.body.vouchers[0].digest);
  assert.equal((await queues.read('prizes')).pending.length, 2);
  const fork = { ...later, frames: inputLog.encode([[{}], [{ fire: true }], [{}], [{}]]) };
  const rejected = await post('runs', fork);
  assert.equal(rejected.status, 422);
  assert.match(rejected.body.error, /input history/);
  const rawFork = await post('captures', { ...later, frames: [[{}], [{ fire: true }], [{}], [{}]] });
  assert.equal(rawFork.status, 422, 'raw input arrays must enforce the same prefix as RLE');
  const final = { ...later, frames: inputLog.encode([[{ fire: true }], [{ fire: true }], [{}], [{}]]) };
  result = { ...result, state: 'gameOver', records: [{ id: 'level9', level: 9 }, { id: 'level19', level: 19 }] };
  const completed = await post('runs', final);
  assert.equal(completed.status, 201, JSON.stringify(completed.body));
  assert.equal(completed.body.vouchers[0].digest, first.body.vouchers[0].digest);
  assert.equal((await queues.read('prizes')).pending.length, 2);
  assert.equal((await post('runs', final)).status, 200);
  assert.equal((await post('runs', { ...final, frames: inputLog.encode([[{ fire: true }], [{ fire: true }], [{}], [{}], [{}]]) })).status, 409);
  assert.equal((await post('captures', { ...run, runId: 'another-flight' })).status, 422);
});

test('real replay rejects a checkpoint without a capture, regardless of a claimed summary', async t => {
  const service = createService({ env: { TICKET_SECRET: 'test-secret-with-at-least-thirty-two-bytes!' }, pilotRegistry: { isPilot: async () => true } });
  await new Promise(resolve => service.server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => service.server.close(resolve)));
  const player = Wallet.createRandom(), ticket = service.ticketService.issue(player.address);
  const run = { runId: 'no-capture', ruleset: ticket.ticket.ruleset, seed: ticket.ticket.seed, ticket,
    difficulty: 'pilot', players: 1, startLevel: 1, frames: inputLog.encode([[{}]]) };
  for (const submitted of [run, { ...run, result: { captures: [{ tier: 1, prize: PRIZES[1][0] }] } }]) {
    const response = await fetch(`http://127.0.0.1:${service.server.address().port}/captures`, { method: 'POST',
      headers: { 'content-type': 'application/json' }, body: JSON.stringify({ address: player.address, run: submitted, signature: await player.signMessage(runHash(submitted)) }) });
    assert.ok([400, 422].includes(response.status));
    assert.match((await response.json()).error, /No guarded Supporter capture|Replay result/);
  }
  assert.equal(service.usedTickets.size, 0);
});

test('a real five-ship guarded pickup earns a mid-level voucher from replay without a cleared-level receipt', async t => {
  const secret = 'test-secret-with-at-least-thirty-two-bytes!';
  const player = Wallet.createRandom(), queued = [];
  const service = createService({
    env: { TICKET_SECRET: secret }, pilotRegistry: { isPilot: async () => true },
    rewardInventory: { read: async () => ({ stock: 10, claimed: false }) },
    queues: { append: async (kind, item) => { queued.push(item); return { status: 'queued' }; }, read: async () => ({ pending: [] }) },
    vouchers: makeVoucherService({ privateKey: Wallet.createRandom().privateKey, chainId: 8453,
      rewardsAddress: '0x0000000000000000000000000000000000000003' })
  });
  await new Promise(resolve => service.server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => service.server.close(resolve)));
  const ticket = service.ticketService.issue(player.address);
  ticket.ticket.seed = 1;
  ticket.mac = `0x${createHmac('sha256', secret).update(stableJson(ticket.ticket)).digest('hex')}`;
  const game = new Game({ seed: 1 });
  game.setPilot({ address: player.address, isPilot: true });
  game.setPlayers(5);
  game.startCampaign(9, 'pilot', 1);
  game.runTicket = ticket;
  assert.ok(game.vault);
  for (let frame = 0; frame < 4000 && game.state !== 'gameOver' && !game.runCaptures.length; frame++) {
    game.step(game.ships.map((ship, index) => {
      const guards = game.vault.guards.filter(guard => guard.hp > 0);
      const target = guards[index % Math.max(1, guards.length)] || game.vault;
      return { fire: true, left: target.x - ship.x < -3, right: target.x - ship.x > 3,
        special: frame % 480 === 0, weaponNext: frame === 0 || frame === 2 };
    }));
  }
  assert.equal(game.runCaptures.length, 1);
  assert.equal(game.runRecords.length, 0);
  assert.equal(game.state, 'playing');
  const run = game.getRunLog();
  const response = await fetch(`http://127.0.0.1:${service.server.address().port}/captures`, { method: 'POST',
    headers: { 'content-type': 'application/json' }, body: JSON.stringify({ address: player.address, run, signature: await player.signMessage(runHash(run)) }) });
  const body = await response.json();
  assert.equal(response.status, 201, JSON.stringify(body));
  assert.equal(body.vouchers.length, 1);
  assert.equal(body.vouchers[0].tokenId, String(game.runCaptures[0].prize.tokenId));
  assert.match(queued[0].receiptRecordId, /^capture:/);
});
