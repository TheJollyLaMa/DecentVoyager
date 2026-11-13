import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '../../BigNuten_Vanilla/node_modules/playwright');
const origin = process.env.VOYAGER_GATEWAY;
if (!origin?.startsWith('https://')) throw new Error('VOYAGER_GATEWAY must be an HTTPS application URL');
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const failures = [], errors = [], scripts = new Set();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) failures.push({ url: response.url(), status: response.status() }); });
  page.on('requestfailed', request => failures.push({ url: request.url(), error: request.failure()?.errorText }));
  page.on('request', request => { if (/\.(js|mjs)(?:\?|$)/.test(request.url())) scripts.add(request.url()); });
  await page.addInitScript(() => {
    window.walletRequests = [];
    window.ethereum = { isMetaMask: true, request: async ({ method }) => {
      window.walletRequests.push(method);
      if (method === 'eth_accounts') return [];
      if (method === 'eth_chainId') return '0x2105';
      throw new Error('Mock wallet request rejected');
    }, on() {}, removeListener() {} };
  });
  await page.goto(origin, { waitUntil: 'load', timeout: 90000 });
  try { await page.locator('#shell-status').waitFor({ state: 'hidden', timeout: 30000 }); }
  catch (error) {
    console.log(JSON.stringify({ origin, scriptRequests: scripts.size, shellStatus: await page.locator('#shell-status').innerText(), failures, errors }));
    throw error;
  }
  assert.equal(await page.getByRole('button', { name: 'Connect wallet' }).count(), 1);
  assert.equal(await page.evaluate(() => window.walletRequests.includes('eth_requestAccounts')), false);
  await page.locator('decent-header app-title button').click();
  await page.locator('decent-header about-modal dialog[open]').waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open IPFS controls' }).click();
  await page.locator('decent-header ipfs-controls dialog[open]').waitFor();
  await page.keyboard.press('Escape');
  for (const side of ['left', 'right']) {
    const menu = page.locator(`decent-header ankh-menu[side="${side}"]`);
    await menu.locator('summary').click();
    assert.equal(await menu.locator('details').evaluate(element => element.open), true);
    await menu.locator('summary').click();
  }
  assert.equal(await page.evaluate(() => !!window.asteroidGame && !!document.querySelector('#gameCanvas')), true);
  console.log(JSON.stringify({ origin, scriptRequests: scripts.size, radioUnavailable: await page.locator('#radio-status').isVisible(), failures }));
} finally {
  await browser.close();
}
