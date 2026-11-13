import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '../../BigNuten_Vanilla/node_modules/playwright');
const origin = process.env.VOYAGER_GATEWAY || 'https://voyager.decentagency.eth.limo/';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const results = await page.evaluate(async () => {
    const fetchStatus = async (url, options) => {
      try { const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20000) }); return { status: response.status, text: (await response.text()).slice(0, 400) }; }
      catch (error) { return { error: error.message }; }
    };
    const rpc = await fetchStatus('https://mainnet.base.org', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }) });
    const referee = await fetchStatus('https://decent-voyager-referee.onrender.com/health');
    const form = new FormData();
    form.append('file', new Blob(['public connectivity probe'], { type: 'text/plain' }), 'probe.txt');
    const pinning = await fetchStatus('https://api.pinata.cloud/pinning/pinFileToIPFS', { method: 'POST', body: form });
    return { rpc, referee, pinning };
  });
  console.log(JSON.stringify({ origin, results }));
  assert.equal(results.rpc.status, 200);
  assert.equal(JSON.parse(results.rpc.text).result, '0x2105');
  assert.equal(results.referee.status, 200);
  assert.equal(JSON.parse(results.referee.text).status, 'ok');
  assert.ok([401, 403].includes(results.pinning.status), 'unauthenticated pinning must fail explicitly');
} finally {
  await browser.close();
}
