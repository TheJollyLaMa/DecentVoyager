const test = require('node:test');
const assert = require('node:assert/strict');
const Game = require('../src/js/game');
const Boss = require('../src/js/boss');
const Bullet = require('../src/js/bullet');
const { getLevel } = require('../src/js/levels');
const { createRng } = require('../src/js/rng');

function encounter(number = 10, players = 1) {
    const game = new Game({ seed: 44, now: () => 1800000000000 });
    game.startCampaign(number, number === 20 ? 'pilot' : 'cadet');
    if (players > 1) game.setPlayers(players);
    game.asteroids = []; game.pickups = [];
    game.scrollY = game.level.length - 601;
    game.step([{}]);
    return game;
}

test('only 10/20 lock the gate and spawn exactly one giant boss', () => {
    for (const number of [10, 20]) {
        const game = encounter(number);
        const boss = game.asteroids.find(rock => rock.boss);
        assert.ok(boss.size >= 100);
        const hold = game.level.length - 600;
        game.ship.shield = 1000;
        for (let i = 0; i < 600; i++) game.step([{}]);
        assert.equal(game.scrollY, hold);
        assert.equal(game.state, 'playing');
        assert.equal(game.asteroids.filter(rock => rock.boss).length, 1);
        game.destroyAsteroid(boss, true, true);
        assert.equal(game.levelStats.bossesDestroyed, 1);
        assert.deepEqual(boss.breakApart(createRng(44)), []);
        for (let i = 0; i < 600 && game.state === 'playing'; i++) game.step([{}]);
        assert.ok(['warping', 'victory'].includes(game.state));
        assert.equal(game.getWinRecords().at(-1).stats.bossesDestroyed, 1);
        const restored = new Game();
        restored.importSave(game.exportSave());
        assert.equal(restored.getLifetimeStats().bossesDestroyed, 1);
    }
    const ordinary = new Game();
    ordinary.startCampaign(9);
    ordinary.asteroids = [];
    ordinary.scrollY = ordinary.level.length;
    ordinary.step([{}]);
    assert.equal(ordinary.state, 'levelComplete');
});

test('both bosses have exactly 10% less HP and need approximately 108 seconds, solo or five ships', () => {
    for (const number of [10, 20]) for (const players of [1, 5]) {
        const boss = new Boss(getLevel(number, 'pilot'), players);
        assert.equal(boss.hp, (number === 20 ? 3000 : 2400) * 0.9 * players);
        let elapsed = 0;
        while (boss.hp > 0 && elapsed < 130) {
            boss.update(Game.FIXED_STEP);
            boss.takeHit(100000);
            elapsed += Game.FIXED_STEP;
        }
        assert.ok(elapsed >= 106 && elapsed <= 109, `${number}/${players}: ${elapsed}`);
        assert.equal(boss.hp, 0);
    }
});

test('real upgraded player projectiles defeat both bosses without bypassing the core budget', () => {
    for (const number of [10, 20]) {
        const game = encounter(number), boss = game.asteroids.find(rock => rock.boss);
        game.ship.shield = 1000;
        game.ship.weapon = { type: 'plasma', tier: 3 };
        let elapsed = 0;
        while (!game.bossDefeated && elapsed < 180) {
            game.step([{ fire: true, left: game.ship.x > boss.x + 4, right: game.ship.x < boss.x - 4 }]);
            elapsed += Game.FIXED_STEP;
            game.drainEvents();
        }
        assert.ok(game.bossDefeated, `level ${number} must be defeatable with normal fire inputs`);
        assert.ok(elapsed >= 106 && elapsed < 180, `level ${number}: ${elapsed}`);
        assert.ok(game.levelStats.shotsFired > 0);
        assert.ok(game.levelStats.hits > 0);
        assert.equal(game.levelStats.bossesDestroyed, 1);
    }
});

test('lasers lock lanes with 1.5-second warning, then damage only ships in the live lanes', () => {
    for (const number of [10, 20]) {
        const game = encounter(number), boss = game.asteroids.find(rock => rock.boss);
        game.enemyBullets = []; game.ship.invulnerable = 0;
        boss.clock = 8; boss.update(0); game.updateBossAttacks(boss, 0);
        assert.equal(boss.laserLanes.length, number === 20 ? 2 : 1);
        const locked = [...boss.laserLanes];
        game.ship.x = locked[0]; game.ship.y = game.scrollY + 90;
        game.resolveShipHits();
        assert.equal(game.ship.power, 100);
        boss.update(1.49);
        assert.equal(boss.laserActive, false);
        boss.update(0.02);
        assert.equal(boss.laserActive, true);
        assert.deepEqual(boss.laserLanes, locked);
        game.resolveShipHits();
        assert.ok(game.ship.power < 100);
        game.ship.power = 100; game.ship.invulnerable = 0;
        game.ship.x = 70;
        game.resolveShipHits();
        assert.equal(game.ship.power, 100);
        boss.update(1.5);
        assert.equal(boss.laserActive, false);
    }
});

test('boss survives ramming, singularity pull and respawn, with bounded aimed fan shots', () => {
    const game = encounter(20), boss = game.asteroids.find(rock => rock.boss);
    game.ship.x = boss.x; game.ship.y = boss.y; game.ship.invulnerable = 0;
    const hp = boss.hp;
    game.resolveShipHits();
    assert.equal(boss.hp, hp);
    assert.equal(game.bossDefeated, false);
    game.playerBullets = [new Bullet({ x: boss.x + 150, y: boss.y, vx: 0, vy: 0, damage: 5, life: 1, owner: 'player' })];
    game.playerBullets[0].ownerWeapon = 'singularity';
    game.resolvePlayerHits();
    assert.equal(boss.vx, 0);
    game.state = 'dying'; game.ship.lives = 2;
    game.respawnOrEnd();
    assert.equal(boss.hp, hp);
    game.enemyBullets = [];
    boss.fireCooldown = 0; game.updateBossAttacks(boss, 0);
    assert.equal(game.enemyBullets.length, 7);
    assert.ok(game.enemyBullets.some(bullet => bullet.vy < 0));
    const shots = game.enemyBullets[0];
    for (let i = 0; i < 100; i++) { boss.fireCooldown = 0; game.updateBossAttacks(boss, 0); }
    assert.ok(game.enemyBullets.length <= 127);
    assert.deepEqual(game.enemyBullets[0], shots);
});

test('boss simulation and snapshots remain deterministic across views', () => {
    const first = encounter(), second = encounter();
    first.ship.shield = second.ship.shield = 1000;
    for (let i = 0; i < 1800; i++) {
        const input = [{ fire: true, right: i % 300 < 150, left: i % 300 >= 150 }];
        first.step(input); second.step(input);
    }
    assert.deepEqual(first.serialize(), second.serialize());
    const snapshot = first.serialize();
    assert.equal(snapshot.bossSpawned, true);
    assert.deepEqual(Game.fromSnapshot(snapshot).serialize(), snapshot);
    second.view = 'pov';
    assert.deepEqual(first.summary(), second.summary());
});
