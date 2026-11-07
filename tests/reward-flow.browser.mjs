import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '../../BigNuten_Vanilla/node_modules/playwright');
const origin = 'https://thejollylama.github.io/DecentVoyager/';
const root = new URL('../src/', import.meta.url);
const mime = { js: 'text/javascript', mjs: 'text/javascript', css: 'text/css', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', html: 'text/html' };
const address = '0x0000000000000000000000000000000000000001';
const other = '0x0000000000000000000000000000000000000002';
const voucher = { kind: 'prize', protocol: 'reward-bundle/1', digest: 'fixture-digest', tokenId: '70', signature: 'fixture-signature',
  voucher: { player: address, nftContract: other, tokenId: '70', deadline: Math.floor(Date.now() / 1000) + 3600 } };
const browser = await chromium.launch();
try {
  for (const width of [1415, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    let verified = false, rejectReferee = false, posts = 0;
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = callback => callback.name === 'frame' ? 0 : raf(callback);
    });
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.startsWith(origin)) {
        if (process.env.VOYAGER_LIVE) return route.continue();
        const path = new URL(url).pathname.replace('/DecentVoyager/', '') || 'index.html';
        return route.fulfill({ body: await readFile(new URL(path, root)), contentType: mime[path.split('.').pop()] || 'application/octet-stream' });
      }
      if (/\/(captures|runs)$/.test(url)) {
        posts++;
        if (rejectReferee) return route.fulfill({ status: 503, json: { error: 'Fixture referee offline' } });
        verified = true;
        const body = route.request().postDataJSON();
        return route.fulfill({ json: { runId: body.run.runId, runHash: body.runHash, vouchers: [voucher], queue: [] } });
      }
      if (url.includes('/vouchers/')) return route.fulfill({ json: { vouchers: verified ? [voucher] : [] } });
      if (url.endsWith('/tickets')) return route.fulfill({ json: { ticket: { id: 'fixture', address, seed: 44, expiresAt: new Date(Date.now() + 3600000).toISOString() }, mac: 'fixture' } });
      return route.fulfill({ json: { contributors: [], invites: [] } });
    });
    async function setup() {
      await page.evaluate(async ({ address }) => {
        const actual = await (await import('./vendor/decent-head/2.0.0/js/wallet.js')).loadEthers();
        window.fixture = { signatures: 0, sends: 0, reject: true, claimed: false, pending: false };
        const wallet = window.DecentHead.getWallet();
        const signer = { getAddress: async () => address, signMessage: async () => { window.fixture.signatures++; return 'fixture-signature'; } };
        wallet.state = { ...wallet.state, connected: true, address };
        wallet.browserProvider = { getSigner: async () => signer };
        wallet.ensureChain = async () => wallet.browserProvider;
        window.ethers = { ...actual, Contract: class {
          constructor() {
            this.claimedToken = async () => window.fixture.claimed;
            this.claim = async () => {
              window.fixture.sends++;
              if (window.fixture.reject) throw new Error('Fixture wallet rejected transfer');
              return { hash: `0x${'a'.repeat(64)}`, wait: async () => {
                if (window.fixture.pending) await new Promise(resolve => { window.fixture.release = resolve; });
                window.fixture.claimed = true;
                return { status: 1, hash: `0x${'a'.repeat(64)}` };
              } };
            };
            this.claim.estimateGas = async () => 100n;
          }
        }, JsonRpcProvider: class {
          destroy() {}
          async getTransactionReceipt() { return window.fixture.claimed ? { status: 1 } : null; }
        } };
        window.dispatchEvent(new CustomEvent('voyager:pilot', { detail: { address, isPilot: true } }));
        window.asteroidGame.setPilot({ address, isPilot: true });
      }, { address });
    }
    await page.goto(origin);
    await page.evaluate(() => import('./js/shell/main.mjs'));
    await page.waitForTimeout(1500);
    await setup();
    await page.evaluate(() => {
      const game = window.asteroidGame;
      game.startCampaign(1, 'pilot', 44);
      game.runTicket = { ticket: { id: 'fixture' }, mac: 'fixture' };
      game.step([{ fire: true }]);
      window.dispatchEvent(new CustomEvent('asteroid:event', { detail: { type: 'levelStart' } }));
      window.dispatchEvent(new CustomEvent('asteroid:event', { detail: { type: 'supporterCaptured', tier: 1, prize: { tokenId: 70 } } }));
    });
    const briefing = page.locator('#supporter-briefing');
    await briefing.getByRole('button', { name: 'Collect to wallet', exact: true }).click();
    await briefing.getByText('Fixture wallet rejected transfer', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.fixture.signatures), 1);
    assert.equal(await page.evaluate(() => window.fixture.claimed), false);
    assert.equal(posts, 1);
    await briefing.locator('[data-capture-dismiss]').click();
    assert.equal(await page.evaluate(() => window.asteroidGame.state), 'playing');

    await page.reload();
    await page.evaluate(() => import('./js/shell/main.mjs'));
    await page.waitForTimeout(1500);
    await setup();
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('voyager:open-vault')));
    const logs = page.locator('#asteroid-victory-vault'), gallery = logs.locator('[aria-label="Captured NFTs"]');
    const row = gallery.locator('.reward-card').first();
    await row.getByRole('button', { name: 'Collect to wallet', exact: true }).waitFor();
    await page.waitForFunction(() => !document.querySelector('.reward-card button').disabled);
    assert.equal(await row.getByRole('link', { name: 'Explore project' }).getAttribute('target'), '_blank');
    assert.equal(await row.getByRole('link', { name: 'DecentCanopy' }).count(), 1);
    assert.equal(await row.getByRole('link', { name: 'Support project · 10 USDC listing', exact: true }).getAttribute('target'), '_blank');
    assert.equal(await row.locator('img').count(), 1);
    await page.evaluate(() => { window.fixture.reject = false; window.fixture.pending = true; });
    await row.getByRole('button', { name: 'Collect to wallet', exact: true }).click();
    await logs.getByText('Transfer submitted. Waiting for Base confirmation...', { exact: true }).first().waitFor();
    assert.equal(await page.evaluate(() => window.fixture.signatures), 0, 'retry a verified voucher without another flight signature');
    assert.equal(await page.evaluate(() => window.fixture.sends), 1);
    await logs.locator('.panel-close').click();
    await page.reload();
    await page.evaluate(() => import('./js/shell/main.mjs'));
    await page.waitForTimeout(1500);
    await setup();
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('voyager:open-vault')));
    await gallery.getByRole('button', { name: 'Check transfer', exact: true }).click();
    await logs.getByText(/Your transfer is still pending/).first().waitFor();
    assert.equal(await page.evaluate(() => window.fixture.sends), 0, 'reload must not duplicate a pending transfer');
    await page.evaluate(() => { window.fixture.claimed = true; });
    await logs.getByRole('button', { name: 'Refresh captured NFTs' }).click();
    await gallery.getByRole('button', { name: 'Collected', exact: true }).waitFor();
    assert.equal(await gallery.getByRole('button', { name: 'Collected', exact: true }).isDisabled(), true);
    if (process.env.SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/collected-nft-${width}.png` });

    await page.evaluate(other => window.dispatchEvent(new CustomEvent('voyager:pilot', { detail: { address: other, isPilot: true } })), other);
    await logs.getByRole('button', { name: 'Refresh captured NFTs' }).click();
    await logs.getByText(/No captured NFTs saved for this wallet/).waitFor();
    assert.equal(await gallery.locator('.reward-card').count(), 0);
    await logs.locator('.panel-close').click();
    verified = false; rejectReferee = true;
    await setup();
    await page.evaluate(() => {
      window.fixture.claimed = false;
      const game = window.asteroidGame;
      game.startCampaign(1, 'pilot', 45);
      game.runTicket = { ticket: { id: 'fixture-2' }, mac: 'fixture' };
      game.step([{}]);
      window.dispatchEvent(new CustomEvent('asteroid:event', { detail: { type: 'levelStart' } }));
      window.dispatchEvent(new CustomEvent('asteroid:event', { detail: { type: 'supporterCaptured', tier: 1, prize: { tokenId: 71 } } }));
    });
    await briefing.getByRole('button', { name: 'Collect to wallet', exact: true }).click();
    await briefing.getByText(/Fixture referee offline/).waitFor();
    assert.equal(await page.evaluate(() => window.fixture.sends), 0);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('decent-voyager-run-outbox/1')).length), 1);
    await briefing.locator('[data-capture-dismiss]').click();
    const rotation = await page.evaluate(() => {
      const game = window.asteroidGame;
      game.setPlayers(5);
      game.setNextRunSeed(1, { ticket: { rewardPlan: { version: 2, difficulty: 'pilot', tokens: [79, 80], levels: [9, 17] } }, mac: 'rotation-fixture' });
      game.startCampaign(9, 'pilot');
      const guards = game.vault.guards.length;
      for (let frame = 0; frame < 4000 && !game.runCaptures.length && game.state !== 'gameOver'; frame++) {
        game.step(game.ships.map((ship, index) => {
          const alive = game.vault.guards.filter(guard => guard.hp > 0);
          const target = alive[index % Math.max(1, alive.length)] || game.vault;
          return { fire: true, left: target.x - ship.x < -3, right: target.x - ship.x > 3,
            special: frame % 480 === 0, weaponNext: frame === 0 || frame === 2 };
        }));
      }
      const captured = game.runCaptures.length;
      const replayed = game.constructor.replay({ ...game.getRunLog(), rewardPlan: game.runTicket.ticket.rewardPlan }).captures.length;
      for (const event of game.drainEvents()) if (['vaultSpawned', 'levelStart', 'supporterCaptured'].includes(event.type)) {
        window.dispatchEvent(new CustomEvent('asteroid:event', { detail: event }));
      }
      return { guards, captured, replayed, level: game.level.number };
    });
    assert.deepEqual(rotation, { guards: 4, captured: 1, replayed: 1, level: 9 });
    await briefing.getByRole('heading', { name: 'DecentCanopy v0.1.0 Supporter DNFT' }).waitFor();
    assert.match(await briefing.locator('[data-capture-link="support"]').getAttribute('href'), /listingId=17&priceUSDC=10000000/);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('decent-voyager-recent-offers/1'))['0x0000000000000000000000000000000000000001'].at(-1)), 79);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ width, result: 'Capture collection, wallet rejection, NFT inspection, wallet scoping and reload-safe pending transfer passed (mocked wallet/Base).' }));
    await page.close();
  }
} finally { await browser.close(); }
