import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '../../BigNuten_Vanilla/node_modules/playwright');
const root = path.resolve(fileURLToPath(new URL('../src/', import.meta.url)));
const mime = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const target = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (target !== root && !target.startsWith(root + path.sep)) return res.writeHead(403).end();
    const file = target === root ? path.join(root, 'index.html') : target;
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }).end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}/`;
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const failedPath of ['', '/vendor/dbusk-radio/0.2.0/widget.js', '/js/shell/main.mjs', '/vendor/decent-head/2.0.0/js/components/Header.js', '/js/shell/startup.mjs']) {
    const context = await browser.newContext();
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (!route.request().url().startsWith(origin) || url.pathname === failedPath) return route.abort();
      return route.continue();
    });
    const page = await context.newPage();
    await page.goto(origin, { waitUntil: 'load' });
    if (failedPath.includes('main.mjs') || failedPath.includes('startup.mjs') || failedPath.includes('/Header.js')) {
      await page.locator('#shell-status').waitFor({ state: 'visible' });
      assert.match(await page.locator('#shell-status').innerText(), /loading or unavailable|could not start/);
      assert.equal(await page.locator('#shell-status a').count(), 2);
    } else {
      await page.locator('#shell-status').waitFor({ state: 'hidden' });
      assert.equal(await page.evaluate(() => !!document.querySelector('decent-header')?.shadowRoot?.querySelector('wallet-connect')?.shadowRoot), true);
      assert.equal(await page.getByRole('button', { name: 'Connect wallet' }).count(), 1);
      if (!failedPath) {
        await page.locator('decent-header app-title button').click();
        await page.locator('decent-header about-modal dialog[open]').waitFor();
        await page.keyboard.press('Escape');
        await page.getByRole('button', { name: 'Open IPFS controls' }).click();
        await page.locator('decent-header ipfs-controls dialog[open]').waitFor();
        await page.keyboard.press('Escape');
      }
      if (failedPath) {
        await page.getByText('Radio unavailable. Reload to retry.').waitFor();
      } else {
        await page.locator('#radio-status').waitFor({ state: 'hidden' });
        assert.equal(await page.evaluate(() => !!document.querySelector('#dbusk-radio')?.shadowRoot), true);
      }
    }
    await context.close();
  }
  console.log('Shell startup: normal, radio failure, core failure and loader failure passed.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
