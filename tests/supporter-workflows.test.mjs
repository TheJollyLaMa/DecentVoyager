import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('Supporter callers use one immutable kit revision and Voyager static site', () => {
  const release = readFileSync(new URL('../.github/workflows/supporter-release.yml', import.meta.url), 'utf8');
  const announce = readFileSync(new URL('../.github/workflows/supporter-announce.yml', import.meta.url), 'utf8');
  const sha = '8523309e99126f5df84400317e6401c583525124';
  for (const [source, workflow] of [[release, 'prepare'], [announce, 'announce']]) {
    assert.ok(source.includes(`product-supporter-${workflow}.yml@${sha}`));
    assert.ok(source.includes(`head_ref: ${sha}`));
  }
  assert.match(release, /site_root: src/);
  assert.ok(existsSync(new URL('../src/index.html', import.meta.url)));
  assert.match(release, /secrets\.PINATA_JWT/);
  assert.match(announce, /vars\.SUPPORTER_DISCORD_ENABLED == 'true'/);
  assert.match(announce, /secrets\.DISCORD_SUPPORTER_WEBHOOK/);
});
