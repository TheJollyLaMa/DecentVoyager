import test from 'node:test';
import assert from 'node:assert/strict';
import { flightStatGroups } from '../src/js/dnft/flight-stats.mjs';
import { readFileSync } from 'node:fs';

test('Flight Logs formats saved failed flights, combat and cargo into labeled groups', () => {
  const groups = flightStatGroups({ campaignsStarted: 3, levelsFailed: 2, playTimeSec: 3665, shotsFired: 40, hits: 10, bossesDestroyed: 2, shotsByWeapon: { plasma: 20 }, pickupsCollected: { life: 4 } });
  const metrics = Object.fromEntries(groups.flatMap(([, values]) => values));
  assert.equal(metrics['Flights launched'], '3');
  assert.equal(metrics['Levels failed'], '2');
  assert.equal(metrics['Flight time'], '1h 1m');
  assert.equal(metrics.Accuracy, '25.0%');
  assert.equal(metrics['Bosses defeated'], '2');
  assert.equal(metrics.life, '4');
  assert.equal(Object.fromEntries(flightStatGroups().flatMap(([, values]) => values)).Accuracy, '0.0%');
});

test('profile has only Flight Logs and captured rewards; shared dialogs use x and genuine backdrop dismissal', () => {
  const profile = readFileSync(new URL('../src/js/shell/profile-menu.mjs', import.meta.url), 'utf8');
  assert.match(profile, /Flight Logs/);
  assert.doesNotMatch(profile, /id: '(manual|reports)'|Victory Vault/);
  const ui = readFileSync(new URL('../src/js/dnft/ui.mjs', import.meta.url), 'utf8');
  assert.match(ui, /button\('×'/);
  assert.doesNotMatch(ui, /button\('Close'/);
  assert.match(ui, /outside && isOutside\(event\)/);
  const claims = readFileSync(new URL('../src/js/dnft/claims.mjs', import.meta.url), 'utf8');
  assert.match(claims, /getLifetimeStats/);
  assert.match(claims, /index < 3/);
  assert.match(claims, /width: 480, height: 480/);
  assert.match(claims, /canvas\.width = 0; canvas\.height = 0/);
});
