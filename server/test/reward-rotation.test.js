'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { Wallet } = require('ethers');
const { createHmac } = require('node:crypto');
const { createRewardRotation } = require('../src/reward-rotation');
const { createService } = require('../src/index');
const { createTicketService } = require('../src/tickets');
const { makeVoucherService } = require('../src/vouchers');
const { runHash, stableJson } = require('../src/run-verifier');
const { replayRun } = require('../src/game-adapter');
const { affordablePrizes, validateRewardPlan, PERFECT_PRIZES } = require('../../src/js/prizes');
const { createRng } = require('../../src/js/rng');
const { createVault } = require('../../src/js/vault');
const Game = require('../../src/js/game');
const { supporterDetails } = require('../../src/js/supporter-catalog');

test('shuffle bags cover every affordable project and avoid adjacent-flight repeats across 1000 flights', () => {
  for (const difficulty of ['pilot', 'ace']) {
    const rng = createRng(44);
    const rotation = createRewardRotation({ choose: limit => Math.floor(rng() * limit) });
    const ids = affordablePrizes(difficulty).map(prize => prize.tokenId);
    const counts = new Map(ids.map(id => [id, 0]));
    let previous = [];
    const first = [];
    for (let index = 0; index < 1000; index++) {
      const plan = rotation.next('wallet', difficulty);
      validateRewardPlan(plan);
      assert.ok(plan.tokens.every(token => !previous.includes(token)));
      for (const token of plan.tokens) counts.set(token, counts.get(token) + 1);
      if (index < Math.ceil(ids.length / 2)) first.push(...plan.tokens);
      previous = plan.tokens;
    }
    assert.equal(new Set(first).size, ids.length);
    assert.ok([...counts.values()].every(count => count > 200), 'all affordable projects receive substantial exposure');
    assert.equal(counts.has(75), false);
    assert.equal(counts.has(76), false, 'Perfect Pilot NFT/bonus stays protected across difficulties');
  }
});

test('recent actual offers survive server restart, difficulty switches stay eligible and wallets are independent', () => {
  const rotation = createRewardRotation({ choose: () => 0 });
  const first = rotation.next('one', 'ace');
  const restarted = createRewardRotation({ choose: () => 0 });
  const next = restarted.next('one', 'pilot', first.tokens);
  assert.ok(next.tokens.every(token => !first.tokens.includes(token) && token !== 76));
  assert.deepEqual(restarted.next('two', 'ace').tokens, first.tokens);
});

test('affordable early guards are measurably easier; legacy guards and premium awards remain unchanged', () => {
  const plan = { version: 1, difficulty: 'pilot', tokens: [70, 80], levels: [4, 17] };
  const early = createVault(1, 4, createRng(1), plan), late = createVault(2, 17, createRng(1), plan);
  assert.equal(early.guards.length, 4);
  assert.equal(early.guards.reduce((sum, guard) => sum + guard.hp, 0), 9);
  assert.ok(early.guards.every(guard => guard.fireCooldown >= 1.5));
  assert.equal(late.guards.length, 8);
  assert.equal(late.guards.reduce((sum, guard) => sum + guard.hp, 0), 43);
  const legacy = createVault(1, 9, createRng(1));
  assert.equal(legacy.guards.length, 8);
  assert.equal(PERFECT_PRIZES.ace.tokenId, 75);
  for (const prize of affordablePrizes('ace')) {
    const details = supporterDetails(prize.tokenId);
    assert.equal(details.supportPriceUSDC, 10);
    assert.match(details.supportUrl, /listingId=\d+&priceUSDC=10000000/);
  }
  assert.equal(supporterDetails(75).supportPriceUSDC, 100);
});

test('rotation ticket MAC binds token choices, levels and difficulty', () => {
  const service = createTicketService({ secret: 'test-secret-with-at-least-thirty-two-bytes!' });
  const address = Wallet.createRandom().address;
  const plan = { version: 1, difficulty: 'ace', tokens: [77, 79], levels: [5, 19] };
  const ticket = service.issue(address, plan);
  const run = { runId: 'rotation', seed: ticket.ticket.seed, ruleset: ticket.ticket.ruleset, difficulty: 'ace', ticket };
  service.verify({ address, run });
  const changed = JSON.parse(JSON.stringify(run));
  changed.ticket.ticket.rewardPlan.tokens[0] = 70;
  assert.throws(() => service.verify({ address, run: changed }), /MAC/);
  assert.throws(() => service.verify({ address, run: { ...run, difficulty: 'pilot' } }), /difficulty/);
  assert.throws(() => validateRewardPlan({ ...plan, tokens: [75, 79] }), /invalid/);
  assert.throws(() => validateRewardPlan({ ...plan, tokens: [76, 79] }), /invalid/);
  assert.throws(() => validateRewardPlan({ ...plan, levels: [3, 20] }), /invalid/);
});

test('a new affordable project captures early and replays to a funded voucher; premium ordinary pickups fail', async t => {
  const secret = 'test-secret-with-at-least-thirty-two-bytes!';
  const player = Wallet.createRandom(), queued = [];
  let fake = null;
  const service = createService({
    env: { TICKET_SECRET: secret }, pilotRegistry: { isPilot: async () => true },
    rewardInventory: { read: async () => ({ stock: 100, claimed: false }) },
    queues: { append: async (kind, item) => { queued.push(item); return { status: 'queued' }; }, read: async () => ({ pending: [] }) },
    vouchers: makeVoucherService({ privateKey: Wallet.createRandom().privateKey, chainId: 8453,
      rewardsAddress: '0x0000000000000000000000000000000000000003' }),
    replay: async run => fake || replayRun(run)
  });
  await new Promise(resolve => service.server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => service.server.close(resolve)));
  const url = `http://127.0.0.1:${service.server.address().port}`;
  const response = await fetch(`${url}/tickets`, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ address: player.address, difficulty: 'pilot', recentOffers: [70, 71] }) });
  const issued = await response.json();
  assert.equal(response.status, 201);
  assert.ok(issued.ticket.rewardPlan.tokens.every(token => ![70, 71, 75, 76].includes(token)));
  const plan = { version: 1, difficulty: 'pilot', tokens: [79, 80], levels: [4, 17] };
  const ticket = service.ticketService.issue(player.address, plan);
  ticket.ticket.seed = 1;
  ticket.mac = `0x${createHmac('sha256', secret).update(stableJson(ticket.ticket)).digest('hex')}`;
  const game = new Game({ seed: 1, now: () => 1_800_000_000_000 });
  game.setPilot({ address: player.address, isPilot: true });
  game.setPlayers(5);
  game.setNextRunSeed(1, ticket);
  game.startCampaign(4, 'pilot');
  assert.equal(game.vault.prize.tokenId, 79);
  for (let frame = 0; frame < 4000 && !game.runCaptures.length && game.state !== 'gameOver'; frame++) {
    game.step(game.ships.map((ship, index) => {
      const guards = game.vault.guards.filter(guard => guard.hp > 0);
      const target = guards[index % Math.max(1, guards.length)] || game.vault;
      return { fire: true, left: target.x - ship.x < -3, right: target.x - ship.x > 3,
        special: frame % 480 === 0, weaponNext: frame === 0 || frame === 2 };
    }));
  }
  assert.equal(game.runCaptures.length, 1);
  const run = game.getRunLog();
  assert.deepEqual(replayRun(run), game.summary());
  async function post(value) {
    const response = await fetch(`${url}/captures`, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ address: player.address, run: value, signature: await player.signMessage(runHash(value)) }) });
    return { status: response.status, body: await response.json() };
  }
  const captured = await post(run);
  assert.equal(captured.status, 201, JSON.stringify(captured.body));
  assert.equal(captured.body.vouchers[0].tokenId, '79');
  fake = { ...game.summary(), captures: [{ tier: 1, level: 4, prize: PERFECT_PRIZES.ace }] };
  const denied = await post({ ...run, battleCards: {} });
  assert.equal(denied.status, 400);
  assert.match(denied.body.error, /unsupported Supporter/);
  assert.equal(queued.length, 1);
});
