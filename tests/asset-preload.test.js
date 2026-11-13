const test = require('node:test');
const assert = require('node:assert/strict');

test('asset preloading is bounded, deduplicated and tolerates failed images', async () => {
  const modulePath = require.resolve('../src/js/render/assets');
  delete require.cache[modulePath];
  const previous = global.Image;
  let active = 0, peak = 0, started = 0;
  global.Image = class {
    set src(value) {
      active++; started++; peak = Math.max(peak, active);
      setImmediate(() => { active--; value.endsWith('/rock-1.png') ? this.onerror() : this.onload(); });
    }
  };
  try {
    const { loadAssets, MANIFEST } = require(modulePath);
    const pending = loadAssets();
    assert.strictEqual(loadAssets(), pending);
    const result = await pending;
    assert.equal(result.total, Object.keys(MANIFEST).length);
    assert.equal(result.loaded, result.total - 1);
    assert.equal(started, result.total);
    assert.equal(peak, 3);
  } finally {
    if (previous === undefined) delete global.Image; else global.Image = previous;
    delete require.cache[modulePath];
  }
});
