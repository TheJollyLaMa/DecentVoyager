'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { Wallet } = require('ethers');
const { createService } = require('../src/index');
const { runHash } = require('../src/run-verifier');

test('only signed, replay-verified level-20 Pilot/Ace flights enqueue a private notice', async t => {
  const player = Wallet.createRandom(), events = new Map();
  let result = { records: [], captures: [] };
  const service = createService({
    env: { TICKET_SECRET: 'test-secret-with-at-least-thirty-two-bytes!' },
    pilotRegistry: { async isPilot() { return true; } },
    queues: { async append(kind, item) {
      if (kind === 'wins') { if (events.has(item.id)) return { status: 'already-queued' }; events.set(item.id, item); }
      return { status: 'queued' };
    } },
    replay: async () => result,
    pinata: { async pinRecord() { return { status: 'skipped', metadataURI: 'ipfs://test' }; } },
    vouchers: { async stamp() { return { value: {}, signature: 'fixture', digest: 'fixture' }; } },
    rewardInventory: { close() {} }
  });

  t.after(() => service.server.emit('close'));
  async function submit(difficulty, level, valid = true, state = 'victory') {
    const ticket = service.ticketService.issue(player.address);
    const run = { runId: `fixture-${difficulty}-${level}`, ruleset: require('../../src/js/ruleset'), difficulty, startLevel: 1, players: 1,
      seed: ticket.ticket.seed, ticket, frames: [[{}]], pilot: { address: player.address, isPilot: true } };
    result = { state, records: level ? [{ id: 'fixture-record', level, difficulty }] : [], captures: [] };
    const signature = valid ? await player.signMessage(runHash(run)) : 'bad';
    const verifiedTicket = service.ticketService.verify({ address: player.address, run, usedTickets: service.usedTickets });
    return service.processRun({ run, address: player.address, signature, verifiedTicket });
  }
  await submit('pilot', 19);
  await submit('cadet', 20);
  await submit('ace', 0);
  await submit('ace', 20, true, 'playing');
  await assert.rejects(submit('pilot', 20, false), /signature/);
  assert.equal(events.size, 0);
  await submit('pilot', 20);
  assert.equal(events.size, 1);
  const event = [...events.values()][0];
  assert.deepEqual(Object.keys(event).sort(), ['difficulty', 'id', 'type', 'verifiedAt']);
  assert.match(event.id, /^[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(event).includes(player.address));
});

test('verified win persistence failure is retryable without duplicate events', async t => {
  const player = Wallet.createRandom(), events = new Map(); let fail = true;
  const service = createService({
    env: { TICKET_SECRET: 'test-secret-with-at-least-thirty-two-bytes!' },
    pilotRegistry: { async isPilot() { return true; } },
    queues: { async append(kind, item) {
      if (kind !== 'wins') return { status: 'queued' };
      if (fail) { fail = false; throw new Error('queue offline'); }
      if (events.has(item.id)) return { status: 'already-queued' };
      events.set(item.id, item); return { status: 'queued' };
    } },
    replay: async () => ({ state: 'victory', records: [{ id: 'win', level: 20, difficulty: 'pilot' }], captures: [] }),
    pinata: { async pinRecord() { return { status: 'skipped', metadataURI: '' }; } },
    vouchers: { async stamp() { return { value: {}, signature: 'fixture', digest: 'fixture' }; } },
    rewardInventory: { close() {} }
  });
  t.after(() => service.server.emit('close'));
  const ticket = service.ticketService.issue(player.address);
  const run = { runId: 'retry-fixture', ruleset: require('../../src/js/ruleset'), difficulty: 'pilot', startLevel: 1, players: 1,
    seed: ticket.ticket.seed, ticket, frames: [[{}]], pilot: { address: player.address, isPilot: true } };
  const signature = await player.signMessage(runHash(run));
  const submit = () => service.processRun({ run, address: player.address, signature,
    verifiedTicket: service.ticketService.verify({ address: player.address, run, usedTickets: service.usedTickets }) });
  await assert.rejects(submit(), /queue offline/);
  await submit();
  await submit();
  assert.equal(events.size, 1);
});
