const test = require('node:test');
const assert = require('node:assert/strict');
const { notifyWins } = require('../scripts/notifyVerifiedWins');

test('notices are private-data-minimized, retryable, and deduplicated across closed issues', async () => {
  const event = { id: 'a'.repeat(64), type: 'verified-level-20', difficulty: 'pilot', verifiedAt: '2026-11-12T00:00:00Z' };
  const issues = [], posted = [];
  const request = async (url, opts) => {
    if (!opts) return issues;
    const issue = JSON.parse(opts.body);
    posted.push(issue);
    issues.push({ ...issue, state: 'closed' });
  };
  const doc = { schema: 'voyager-verified-wins/1', pending: [event, event] };
  await notifyWins(doc, { request, slug: 'TheJollyLaMa/DecentVoyager' });
  await notifyWins(doc, { request, slug: 'TheJollyLaMa/DecentVoyager' });
  assert.equal(posted.length, 1);
  assert.match(posted[0].body, /does not confirm a voucher/);
  assert.doesNotMatch(posted[0].body, /0x[a-f0-9]{40}|signature:|runId/i);
  await assert.rejects(() => notifyWins({ ...doc, pending: [{ ...event, difficulty: 'cadet' }] }, { request, slug: 'x/y' }), /Invalid verified win/);
});

test('an uncertain posting failure is safe to retry after an issue was created', async () => {
  const event = { id: 'b'.repeat(64), type: 'verified-level-20', difficulty: 'ace', verifiedAt: '2026-11-12T00:00:00Z' };
  const issues = []; let posts = 0;
  const request = async (url, opts) => {
    if (!opts) return issues;
    posts++; issues.push(JSON.parse(opts.body)); throw new Error('network interrupted after creation');
  };
  const doc = { schema: 'voyager-verified-wins/1', pending: [event] };
  await assert.rejects(() => notifyWins(doc, { request, slug: 'x/y' }), /network interrupted/);
  await notifyWins(doc, { request, slug: 'x/y' });
  assert.equal(posts, 1);
});
