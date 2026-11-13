'use strict';

const fs = require('node:fs');
const { githubRequest, repositoryCoordinates } = require('./githubApi');

async function notifyWins(doc, { request, slug }) {
  if (doc?.schema !== 'voyager-verified-wins/1' || !Array.isArray(doc.pending)) throw new Error('Invalid verified win ledger');
  const issues = [];
  for (let page = 1; ; page++) {
    const batch = await request(`/repos/${slug}/issues?state=all&per_page=100&page=${page}`);
    issues.push(...batch.filter(item => !item.pull_request));
    if (batch.length < 100) break;
  }
  const seen = new Set(issues.flatMap(issue => [...String(issue.body || '').matchAll(/<!-- voyager-verified-win:([a-f0-9]{64}) -->/g)].map(match => match[1])));
  for (const event of doc.pending) {
    if (!/^[a-f0-9]{64}$/.test(event.id || '') || event.type !== 'verified-level-20' ||
        !['pilot', 'ace'].includes(event.difficulty) || !Number.isFinite(Date.parse(event.verifiedAt))) throw new Error('Invalid verified win event');
    if (seen.has(event.id)) continue;
    const body = [
      `<!-- voyager-verified-win:${event.id} -->`,
      'The referee replay verified a level-20 completion.',
      `Difficulty: **${event.difficulty}**. Verified at: ${new Date(event.verifiedAt).toISOString()}.`,
      '',
      'Reward and stamp processing may still be in progress or unavailable. This notice does not confirm a voucher, queue entry, mint, or on-chain transfer.',
      'Inspect the authorized Voyager admin queue and the [reward documentation](https://github.com/TheJollyLaMa/DecentVoyager/blob/main/docs/VICTORY-STAMPS.md) for available status. This notice intentionally omits player, signature, run log and wallet linkage.'
    ].join('\n');
    await request(`/repos/${slug}/issues`, { method: 'POST', body: JSON.stringify({ title: 'Inspect a verified Voyager level-20 victory', body }) });
    seen.add(event.id);
  }
}

if (require.main === module) {
  const doc = JSON.parse(fs.readFileSync('verified-wins.json', 'utf8'));
  notifyWins(doc, { request: githubRequest, slug: repositoryCoordinates().slug })
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { notifyWins };
