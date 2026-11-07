'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { Wallet } = require('ethers');
const Game = require('../../src/js/game');
const { replayRun } = require('../src/game-adapter');
const { createService } = require('../src/index');
const { makeVoucherService } = require('../src/vouchers');
const { validateRunShape, runHash, stableJson } = require('../src/run-verifier');
const { createHmac } = require('node:crypto');
const { createTicketService } = require('../src/tickets');

function flyToCapture(address, { skip = true } = {}) {
  const game = new Game({ seed: 1, now: () => 1_800_000_000_000 });
  game.setPilot({ address, isPilot: true });
  game.setPlayers(5);
  game.startCampaign(1, 'pilot', 1);
  let transition = 0;
  for (let frame = 0; frame < 30000 && !game.runCaptures.length && game.state !== 'gameOver'; frame++) {
    if (skip && game.state === 'levelComplete') {
      if (++transition === 7) { game.handleAction('confirm'); transition = 0; }
    } else transition = 0;
    game.step(game.ships.map((ship, index) => {
      const guards = game.vault?.guards.filter(guard => guard.hp > 0) || [];
      const ahead = game.asteroids.filter(rock => rock.hp > 0 && rock.y > ship.y).sort((a, b) => a.y - b.y);
      const target = game.vault ? guards[index % Math.max(1, guards.length)] || game.vault
        : ahead[index % Math.max(1, game.asteroids.length)] || { x: 400 };
      return { fire: true, left: target.x - ship.x < -3, right: target.x - ship.x > 3,
        special: frame % 480 === 0, weaponNext: frame === 0 || frame === 2 };
    }));
  }
  return game;
}

test('real full campaign with eight Continue skips reaches a capture and replays exactly; omitted skips reproduce the failure', () => {
  const game = flyToCapture(Wallet.createRandom().address);
  assert.equal(game.runCaptures.length, 1);
  assert.equal(game.level.number, 9);
  const log = game.getRunLog();
  assert.equal(log.actions.length, 8);
  validateRunShape(log);
  assert.deepEqual(replayRun(log), game.summary());
  assert.equal(replayRun({ ...log, actions: undefined }).captures.length, 0);
  const copied = game.getRunLog();
  copied.actions[0].frame++;
  assert.notEqual(copied.actions[0].frame, game.runActions[0].frame);
});

test('automatic transition flights keep the original action-free log and replay behavior', () => {
  const game = flyToCapture(Wallet.createRandom().address, { skip: false });
  assert.equal(game.runCaptures.length, 1);
  assert.equal('actions' in game.getRunLog(), false);
  assert.deepEqual(replayRun(game.getRunLog()), game.summary());
});

test('referee issues a real capture voucher after Continue skips and rejects forged or changed transition actions', async t => {
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
  const game = flyToCapture(player.address), ticket = service.ticketService.issue(player.address);
  ticket.ticket.seed = 1;
  ticket.mac = `0x${createHmac('sha256', secret).update(stableJson(ticket.ticket)).digest('hex')}`;
  game.runTicket = ticket;
  const log = game.getRunLog();
  const post = async run => {
    const response = await fetch(`http://127.0.0.1:${service.server.address().port}/captures`, { method: 'POST',
      headers: { 'content-type': 'application/json' }, body: JSON.stringify({ address: player.address, run, signature: await player.signMessage(runHash(run)) }) });
    return { status: response.status, body: await response.json() };
  };
  const response = await post(log);
  assert.equal(response.status, 201, JSON.stringify(response.body));
  assert.equal(response.body.vouchers[0].tokenId, String(game.runCaptures[0].prize.tokenId));
  assert.equal(queued.length, 1);
  const verifiedTicket = service.ticketService.verify({ address: player.address, run: log, usedTickets: service.usedTickets });
  const changed = { ...log, actions: log.actions.map((action, index) => ({ ...action, frame: action.frame + (index === 0 ? 1 : 0) })) };
  assert.throws(() => service.ticketService.consume(verifiedTicket, changed, runHash(changed), service.usedTickets, { checkpoint: true }), /input history/);
  assert.throws(() => service.ticketService.consume(verifiedTicket, { ...log, actions: [] }, 'removed', service.usedTickets, { checkpoint: true }), /input history/);
  const forged = await post({ ...log, actions: [{ type: 'continue', frame: 1 }] });
  assert.equal(forged.status, 400);
  assert.match(forged.body.error, /not at a cleared-level transition/);
});

test('transition schema rejects duplicates, unsorted/overflow actions and unsupported action types', () => {
  const game = flyToCapture(Wallet.createRandom().address), log = game.getRunLog();
  for (const actions of [
    [{ frame: 1, type: 'continue' }, { frame: 1, type: 'continue' }],
    [{ frame: log.frames.frames + 1, type: 'continue' }],
    [{ frame: 1, type: 'completeLevel' }],
    [{ frame: 1, type: 'continue', level: 9 }],
    Array.from({ length: 20 }, (_, frame) => ({ frame, type: 'continue' }))
  ]) assert.throws(() => validateRunShape({ ...log, actions }), /Flight action|Flight actions/);
});

test('checkpoint boundary permits a newly recorded Continue but cannot remove or change a locked action', () => {
  const address = Wallet.createRandom().address, used = new Map();
  const service = createTicketService({ secret: 'test-secret-with-at-least-thirty-two-bytes!' });
  const ticket = service.issue(address);
  const run = { runId: 'boundary', ruleset: ticket.ticket.ruleset, seed: ticket.ticket.seed, ticket, frames: [[{}]] };
  const verified = service.verify({ address, run, usedTickets: used });
  service.consume(verified, run, 'first', used, { checkpoint: true });
  const next = { ...run, frames: [[{}], [{}]], actions: [{ frame: 1, type: 'continue' }] };
  service.consume(verified, next, 'second', used, { checkpoint: true });
  assert.throws(() => service.consume(verified, { ...next, actions: [] }, 'removed', used, { checkpoint: true }), /input history/);
  service.consume(verified, run, 'old-prefix', used, { checkpoint: true });
  const atBoundary = { ...next, actions: [{ frame: 2, type: 'continue' }] };
  assert.throws(() => service.consume(verified, atBoundary, 'changed', used, { checkpoint: true }), /input history/);
  const boundaryService = createTicketService({ secret: 'test-secret-with-at-least-thirty-two-bytes!' });
  const boundaryUsed = new Map();
  boundaryService.consume(verified, atBoundary, 'boundary-action', boundaryUsed, { checkpoint: true });
  assert.throws(() => boundaryService.consume(verified, { ...atBoundary, actions: [] }, 'removed-boundary', boundaryUsed, { checkpoint: true }), /input history/);
});
