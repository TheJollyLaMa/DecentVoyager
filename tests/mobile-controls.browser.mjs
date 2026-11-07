// Optional browser smoke: uses existing Playwright, never rebuilds the checked-in bundle.
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
        if (target !== root && !target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
        const file = target === root ? path.join(root, 'index.html') : target;
        const body = await readFile(file);
        res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }).end(body);
    } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = process.env.VOYAGER_LIVE ? 'https://thejollylama.github.io/DecentVoyager/' : `http://127.0.0.1:${server.address().port}`;
let browser;
try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
    await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    const page = await context.newPage();
    await page.addInitScript(() => {
        const raf = window.requestAnimationFrame.bind(window);
        window.requestAnimationFrame = callback => callback.name === 'frame' ? 0 : raf(callback);
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.voyager?.input);
    await page.evaluate(() => { window.mobileTestInput = window.voyager.input; });
    const panel = page.locator('#mobile-controls');
    await panel.waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'portrait must not overflow horizontally');
    for (const box of await panel.locator('button').evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().toJSON()))) {
        assert.ok(box.width >= 44 && box.height >= 44, 'touch targets must be at least 44px');
    }
    for (const difficulty of ['pilot', 'ace', 'cadet']) {
        await panel.locator(`[data-mobile-difficulty=${difficulty}]`).tap();
        assert.equal(await page.evaluate(() => voyager.game.selectedDifficulty), difficulty);
        assert.equal(await panel.locator(`[data-mobile-difficulty=${difficulty}]`).getAttribute('aria-pressed'), 'true');
    }
    for (const [arrow, selected] of [['down', 'pilot'], ['right', 'ace'], ['up', 'pilot'], ['left', 'cadet']]) {
        await panel.locator(`[data-mobile-held=${arrow}]`).tap();
        assert.equal(await page.evaluate(() => voyager.game.selectedDifficulty), selected);
        assert.equal(await page.evaluate(() => {
            const input = mobileTestInput.poll()[0];
            return ['up', 'down', 'left', 'right'].some(action => input[action]);
        }), false, 'title arrows must not latch steering');
    }
    await page.locator('#gameCanvas').focus();
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(() => voyager.game.selectedDifficulty), 'pilot');
    await page.keyboard.press('ArrowUp');
    assert.equal(await page.evaluate(() => voyager.game.selectedDifficulty), 'cadet');
    const cards = await page.evaluate(() => {
        const rect = document.querySelector('#gameCanvas').getBoundingClientRect();
        const width = Math.round(Math.max(800, Math.min(1600, 600 * rect.width / rect.height)));
        const scale = Math.min(rect.width / width, rect.height / 600);
        return ['cadet', 'pilot', 'ace'].map((id, index) => ({
            id,
            x: rect.left + (rect.width - width * scale) / 2 + (width / 2 - 269 + index * 184 + 85) * scale,
            y: rect.top + (rect.height - 600 * scale) / 2 + 198 * scale
        }));
    });
    for (const card of cards) {
        await page.touchscreen.tap(card.x, card.y);
        assert.equal(await page.evaluate(() => voyager.game.selectedDifficulty), card.id, 'rendered cards must accept direct touch');
    }
    await page.evaluate(() => { voyager.game.startCampaign(1, 'pilot', 44); window.asteroidDraw(); });
    await page.waitForFunction(() => document.querySelector('.mobile-difficulty').hidden);
    await panel.locator('[data-mobile-held=left]').scrollIntoViewIfNeeded();
    const left = await page.locator('[data-mobile-held=left]').boundingBox();
    const fire = await page.locator('[data-mobile-held=fire]').boundingBox();
    const point = (box, id) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2, id });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(left, 1), point(fire, 2)] });
    let controls = await page.evaluate(() => mobileTestInput.poll()[0]);
    assert.equal(controls.left, true);
    assert.equal(controls.fire, true);
    const movement = await page.evaluate(() => {
        const ship = voyager.game.ship, before = ship.x;
        for (let index = 0; index < 12; index++) voyager.game.step(mobileTestInput.poll());
        return { before, after: ship.x, shots: voyager.game.playerBullets.length };
    });
    assert.ok(movement.after < movement.before, 'touch arrows must move the actual ship');
    assert.ok(movement.shots > 0, 'multi-touch fire must reach the actual simulation');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [point(fire, 2)] });
    controls = await page.evaluate(() => mobileTestInput.poll()[0]);
    assert.equal(controls.left, true);
    assert.equal(controls.fire, false);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.equal(await page.evaluate(() => mobileTestInput.poll()[0].left), false);
    await page.evaluate(() => {
        const button = document.querySelector('[data-mobile-held=fire]');
        button.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 7, button: 0, bubbles: true }));
        window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7 }));
    });
    assert.equal(await page.evaluate(() => mobileTestInput.poll()[0].fire), true, 'sub-frame tap must reach simulation');
    assert.equal(await page.evaluate(() => mobileTestInput.poll()[0].fire), false);
    await page.evaluate(() => {
        window.DeviceOrientationEvent = class extends Event {
            static requestPermission() { return Promise.resolve('granted'); }
        };
    });
    await page.locator('[data-mobile-tilt]').click();
    await page.evaluate(() => {
        const sample = gamma => {
            const event = new Event('deviceorientation');
            Object.assign(event, { beta: 30, gamma });
            window.dispatchEvent(event);
        };
        sample(0); sample(25);
    });
    assert.equal(await page.evaluate(() => mobileTestInput.poll()[0].ax), 1);
    await page.locator('[data-mobile-center]').click();
    assert.equal(await page.evaluate(() => mobileTestInput.poll()[0].ax), 0);
    await page.evaluate(() => {
        const walletButton = document.createElement('button');
        walletButton.textContent = 'Wallet outside game';
        document.body.append(walletButton);
        walletButton.focus();
        const event = new Event('deviceorientation');
        Object.assign(event, { beta: 30, gamma: 25 });
        window.dispatchEvent(event);
    });
    assert.equal(await page.evaluate(() => mobileTestInput.poll()[0].ax), 0, 'motion cannot resume behind wallet UI');
    assert.equal(await page.locator('[data-mobile-tilt]').getAttribute('aria-pressed'), 'false');
    await page.evaluate(() => document.body.lastElementChild.remove());
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    assert.equal(await page.locator('[data-mobile-tilt]').getAttribute('aria-pressed'), 'false');
    await page.evaluate(() => {
        document.querySelector('#flight-deck').requestFullscreen = undefined;
    });
    await page.locator('[data-mobile-screen]').click();
    assert.match(await page.locator('[data-mobile-status]').textContent(), /Fullscreen unavailable/);
    await page.evaluate(() => {
        window.mobileTestActions = [];
        window.mobileOriginalAction = window.voyager.game.handleAction;
        window.voyager.game.handleAction = action => window.mobileTestActions.push(action);
    });
    await page.locator('[data-mobile-command=pause]').focus();
    await page.keyboard.press('Enter');
    assert.deepEqual(await page.evaluate(() => window.mobileTestActions), ['pause'], 'keyboard activation must not also trigger global confirm');
    await page.locator('[data-mobile-held=weaponNext]').focus();
    await page.keyboard.press('Space');
    assert.equal(await page.evaluate(() => mobileTestInput.poll()[0].weaponNext), true);
    assert.equal(await page.evaluate(() => mobileTestInput.poll()[0].weaponNext), false);
    await page.setViewportSize({ width: 844, height: 390 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'landscape must not overflow horizontally');
    const layout = await page.evaluate(() => ({
        panel: document.querySelector('#mobile-controls').getBoundingClientRect().toJSON(),
        canvas: document.querySelector('#gameCanvas').getBoundingClientRect().toJSON()
    }));
    assert.ok(layout.panel.width >= 200 && layout.canvas.width > 250, 'landscape has a usable side panel and canvas');
    assert.ok(layout.panel.x >= layout.canvas.right - 1, 'landscape controls must not cover the canvas');
    await page.evaluate(() => {
        window.voyager.game.handleAction = window.mobileOriginalAction;
        window.voyager.game.goToTitle();
        window.asteroidDraw();
        window.dispatchEvent(new CustomEvent('asteroid:event', { detail: { type: 'levelStart' } }));
    });
    await panel.locator('[data-mobile-difficulty=ace]').tap();
    assert.equal(await page.evaluate(() => voyager.game.selectedDifficulty), 'ace', 'landscape selection must work');
    await panel.locator('[data-mobile-held=left]').tap();
    assert.equal(await page.evaluate(() => voyager.game.selectedDifficulty), 'pilot');
    const landscapeCard = await page.evaluate(() => {
        const rect = document.querySelector('#gameCanvas').getBoundingClientRect();
        const width = Math.round(Math.max(800, Math.min(1600, 600 * rect.width / rect.height)));
        const scale = Math.min(rect.width / width, rect.height / 600);
        return {
            x: rect.left + (rect.width - width * scale) / 2 + (width / 2 + 184) * scale,
            y: rect.top + (rect.height - 600 * scale) / 2 + 198 * scale
        };
    });
    await page.touchscreen.tap(landscapeCard.x, landscapeCard.y);
    assert.equal(await page.evaluate(() => voyager.game.selectedDifficulty), 'ace', 'landscape card touch must account for letterboxing');
    assert.deepEqual(errors, [], 'page must not raise uncaught errors');
    console.log('Mobile browser smoke passed: touch difficulty buttons/cards, title arrows/keyboard, actual ship movement/fire, portrait/landscape, 44px targets, multi-touch, calibrated tilt and cleanup.');
} finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
}
