import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '../../BigNuten_Vanilla/node_modules/playwright');
const origin = 'https://thejollylama.github.io/DecentVoyager/';
const root = new URL('../src/', import.meta.url);
const mime = { js: 'text/javascript', mjs: 'text/javascript', css: 'text/css', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', html: 'text/html' };
const address = '0x0000000000000000000000000000000000000001';
const browser = await chromium.launch();
try {
  for (const width of [1415, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
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
      if (url.endsWith('/tickets')) return route.fulfill({ json: { ticket: { id: 'fixture', address, seed: 44, expiresAt: new Date(Date.now() + 3600000).toISOString() }, mac: 'fixture' } });
      return route.fulfill({ json: { contributors: [], vouchers: [], invites: [] } });
    });
    await page.goto(origin);
    await page.evaluate(() => import('./js/shell/main.mjs'));
    await page.waitForTimeout(1500);
    const profile = page.locator('decent-header ankh-menu[side="right"]');
    await profile.locator('summary').click();
    assert.deepEqual(await profile.locator('[data-voyager-entry]').allTextContents(), ['✦ Flight Logs', '✦ Captured rewards']);
    await profile.locator('[data-voyager-entry="vault"]').click();
    const logs = page.locator('#asteroid-victory-vault');
    await logs.waitFor({ state: 'visible' });
    assert.ok(await logs.getByText('Total flight stats', { exact: true }).count() === 0);
    await logs.getByRole('heading', { name: 'Survival', exact: true }).waitFor();
    await logs.locator('.panel-close').click();

    await page.evaluate(() => {
      const game = window.asteroidGame;
      game.startCampaign(1, 'pilot', 44);
      game.asteroids = []; game.pickups = [];
      for (let i = 0; i < 180; i++) game.step([{ fire: true }]);
      game.completeLevel();
      Object.assign(game.save.lifetime, { campaignsStarted: 3, levelsFailed: 2, shotsFired: 40, hits: 10, bossesDestroyed: 2 });
      window.dispatchEvent(new CustomEvent('voyager:open-vault'));
    });
    await logs.locator('canvas.battle-preview').waitFor();
    assert.equal(await logs.locator('[aria-label="Total flight stats"]').getByText('25.0%', { exact: true }).count(), 1);
    assert.equal(await logs.locator('[aria-label="Total flight stats"]').getByText('Levels failed', { exact: true }).count(), 1);
    const preview = await logs.locator('canvas').elementHandle();
    if (process.env.SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/flight-logs-${width}.png` });
    const box = await logs.boundingBox();
    await page.mouse.click(box.x + 3, box.y + 3);
    assert.equal(await logs.isVisible(), true, 'inside dialog padding must not dismiss');
    await page.mouse.click(2, 2);
    assert.equal(await logs.isVisible(), false);
    await page.waitForFunction(() => document.querySelector('#asteroid-victory-vault canvas').width === 0);
    assert.equal(await preview.evaluate(canvas => canvas.width), 0);

    await page.evaluate(() => document.querySelector('decent-header').shadowRoot.querySelector('about-modal').open());
    const about = page.locator('decent-header about-modal dialog');
    await about.waitFor({ state: 'visible' });
    await about.locator('.close').click();
    await page.evaluate(() => document.querySelector('decent-header').shadowRoot.querySelector('about-modal').open());
    await page.mouse.click(2, 2);
    assert.equal(await about.isVisible(), false);
    const ipfs = page.locator('decent-header ipfs-controls');
    await ipfs.locator('#open').click();
    await ipfs.locator('dialog').waitFor({ state: 'visible' });
    await ipfs.locator('.modal-close').click();
    await ipfs.locator('#open').click();
    await page.mouse.click(2, 2);
    assert.equal(await ipfs.locator('dialog').isVisible(), false);

    await page.evaluate(() => window.DECENT_CONFIG.ipfsAdapter.capabilities.backup.open());
    const progress = page.locator('.progress-dialog');
    await progress.waitFor({ state: 'visible' });
    await progress.locator('[data-close]').click();
    await page.evaluate(() => window.DECENT_CONFIG.ipfsAdapter.capabilities.backup.open());
    await page.mouse.click(2, 2);
    assert.equal(await progress.isVisible(), false);

    for (const id of ['flight-diagnostics', 'asteroid-admin']) {
      await page.evaluate(id => document.getElementById(id).showModal(), id);
      const dialog = page.locator(`#${id}`);
      assert.equal(await dialog.getByRole('button', { name: 'Close', exact: true }).count(), 0);
      await dialog.locator('.panel-close').click();
      await page.evaluate(id => document.getElementById(id).showModal(), id);
      await page.mouse.click(2, 2);
      assert.equal(await dialog.isVisible(), false);
    }
    await page.evaluate(() => {
      window.testLaunches = 0;
      window.asteroidGame.goToTitle();
      window.dispatchEvent(new CustomEvent('voyager:launch-request', { detail: { launch: () => window.testLaunches++ } }));
    });
    const launch = page.locator('#wallet-launch');
    await launch.locator('[data-wallet-launch-cancel]').click();
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('voyager:launch-request', { detail: { launch: () => window.testLaunches++ } })));
    await page.mouse.click(2, 2);
    assert.equal(await launch.isVisible(), false);
    assert.equal(await page.evaluate(() => window.testLaunches), 0);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('asteroid:event', { detail: { type: 'levelStart' } })));
    await page.locator('[data-launch-multi]').click();
    await page.locator('#arena-lobby').waitFor({ state: 'visible' });
    await page.mouse.click(2, 250);
    assert.equal(await page.locator('#arena-lobby').isVisible(), false);

    await page.evaluate(() => {
      const game = window.asteroidGame;
      game.startCampaign(1, 'pilot', 44);
      game.drainEvents();
      document.getElementById('gameCanvas').focus();
    });
    await page.keyboard.down('Space');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('asteroid:event', { detail: { type: 'supporterCaptured', tier: 1, prize: { tokenId: 70 } } }));
    });
    const briefing = page.locator('#supporter-briefing');
    await briefing.waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => window.asteroidGame.state), 'paused');
    assert.equal(await briefing.locator('[data-capture-resume]').isVisible(), false);
    assert.equal(await page.locator('#capture-title').evaluate(title => title === document.activeElement), true);
    await page.keyboard.down('Space');
    await page.keyboard.up('Space');
    await briefing.locator('[data-capture-dismiss]').focus();
    await page.keyboard.press('Space');
    assert.equal(await briefing.isVisible(), true, 'fire must not activate the focused X');
    await briefing.locator('[data-capture-collect]').focus();
    await page.keyboard.press('Space');
    assert.equal(await briefing.locator('[data-capture-transfer-status]').textContent(), '', 'fire must not start wallet collection');
    for (const key of ['p', 'q', 'v', 'ArrowLeft']) await page.keyboard.press(key);
    await page.mouse.click(2, 2);
    assert.equal(await briefing.isVisible(), true, 'outside tap must not dismiss the capture');
    assert.equal(await page.evaluate(() => window.asteroidGame.state), 'paused');
    await briefing.locator('[data-capture-dismiss]').click();
    assert.equal(await briefing.isVisible(), false);
    assert.equal(await page.evaluate(() => window.asteroidGame.state), 'playing');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('asteroid:event', { detail: { type: 'supporterCaptured', tier: 1, prize: { tokenId: 79 } } }));
    });
    await briefing.waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    assert.equal(await briefing.isVisible(), false);
    assert.equal(await page.evaluate(() => window.asteroidGame.state), 'playing');

    await page.evaluate(address => {
      const game = window.asteroidGame;
      window.dispatchEvent(new CustomEvent('voyager:pilot', { detail: { address, isPilot: true } }));
      game.startCampaign(1, 'pilot', 45);
      game.runTicket = { ticket: { id: 'sign-fixture' }, mac: 'fixture' };
      window.dispatchEvent(new CustomEvent('asteroid:event', { detail: { type: 'levelStart' } }));
      window.dispatchEvent(new CustomEvent('asteroid:event', { detail: { type: 'supporterCaptured', tier: 1, prize: { tokenId: 71 } } }));
      document.querySelector('[data-capture-dismiss]').click();
      game.state = 'gameOver';
      window.dispatchEvent(new CustomEvent('asteroid:event', { detail: { type: 'gameOver' } }));
      window.asteroidDraw();
    }, address);
    const sign = page.locator('#flight-sign');
    await sign.waitFor({ state: 'visible' });
    await page.waitForTimeout(150);
    await page.evaluate(() => window.asteroidDraw());
    const signBox = await sign.boundingBox(), canvasBox = await page.locator('#gameCanvas').boundingBox();
    assert.ok(Math.abs(signBox.x + signBox.width / 2 - (canvasBox.x + canvasBox.width / 2)) < 2);
    assert.ok(signBox.y < canvasBox.y + canvasBox.height * 0.8);
    assert.equal(await sign.evaluate(button => document.elementFromPoint(button.getBoundingClientRect().x + 10, button.getBoundingClientRect().y + 10) === button), true);
    if (process.env.SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/sign-game-over-${width}.png` });
    await sign.click();
    await page.getByText('Wallet or flight log is unavailable', { exact: true }).first().waitFor();
    assert.equal(await sign.isEnabled(), true);
    await page.evaluate(() => {
      const game = window.asteroidGame;
      game.startCampaign(20, 'pilot', 46);
      game.completeLevel();
      window.dispatchEvent(new CustomEvent('asteroid:event', { detail: { type: 'levelStart' } }));
      game.runTicket = { ticket: { id: 'victory-fixture' }, mac: 'fixture' };
      window.dispatchEvent(new CustomEvent('asteroid:event', { detail: { type: 'levelRecord', record: game.lastRecord } }));
      window.dispatchEvent(new CustomEvent('asteroid:event', { detail: { type: 'victory' } }));
      window.asteroidDraw();
    });
    await sign.waitFor({ state: 'visible' });
    await page.waitForTimeout(150);
    await page.evaluate(() => window.asteroidDraw());
    assert.equal(await page.locator('#flight-sign-prompt').getAttribute('data-victory'), '');
    if (process.env.SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/sign-victory-${width}.png` });

    for (const level of [10, 20]) for (const view of ['overview', 'pov']) {
      const result = await page.evaluate(({ level, view }) => {
        const game = window.asteroidGame;
        game.startCampaign(level, 'pilot', 44);
        game.scrollY = game.level.length - 601;
        game.ship.shield = 1000;
        game.view = view;
        for (let i = 0; i < 590; i++) game.step([{ fire: true }]);
        window.asteroidDraw();
        const boss = game.asteroids.find(rock => rock.boss);
        return { state: game.state, hp: boss.hp, active: boss.laserActive, lanes: boss.laserLanes.length };
      }, { level, view });
      await page.waitForTimeout(300);
      assert.equal(await page.locator('#flight-sign-prompt').isVisible(), false);
      assert.equal(result.state, 'playing');
      assert.equal(result.active, true);
      assert.equal(result.lanes, level === 20 ? 2 : 1);
      assert.ok(result.hp > 0);
      if (process.env.SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/boss-${level}-${view}-${width}.png` });
    }
    const stress = await page.evaluate(async () => {
      const game = window.asteroidGame;
      game.startCampaign(20, 'ace', 44);
      game.setPlayers(5);
      game.scrollY = game.level.length - 601;
      for (const ship of game.ships) ship.shield = 1000;
      const times = [];
      let peakBullets = 0, peakParticles = 0;
      for (let i = 0; i < 7200; i++) {
        const start = performance.now();
        game.step(Array.from({ length: 5 }, () => ({ fire: true })));
        peakBullets = Math.max(peakBullets, game.enemyBullets.length);
        peakParticles = Math.max(peakParticles, game.particles.length);
        if (i % 15 === 0) {
          const stepMs = performance.now() - start;
          await new Promise(resolve => requestAnimationFrame(resolve));
          game.view = i % 30 === 0 ? 'overview' : 'pov';
          const drawStart = performance.now();
          window.asteroidDraw();
          times.push(stepMs + performance.now() - drawStart);
        }
        game.drainEvents();
      }
      times.sort((a, b) => a - b);
      return { peakBullets, peakParticles, p95StepDrawMs: times[Math.floor(times.length * 0.95)], resources: window.voyagerDiagnostics.report().current };
    });
    assert.ok(stress.peakBullets <= 127);
    assert.ok(stress.peakParticles <= 256);
    assert.ok(stress.resources.glowSprites <= 64);
    assert.equal(stress.resources.contextLost, false);
    console.log(JSON.stringify({ width, stress }));
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ width, result: 'Flight Logs, modal x/backdrops, capture resume, centered explicit signing and both boss views passed.' }));
    await page.close();
  }
} finally { await browser.close(); }
