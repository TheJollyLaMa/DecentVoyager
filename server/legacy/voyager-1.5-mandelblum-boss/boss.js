const Asteroid = require('./asteroid');

class Boss extends Asteroid {
    constructor(level, players = 1) {
        const final = level.number === 20;
        super({ id: -level.number, x: 400, y: 0, size: final ? 120 : 100, hp: (final ? 3000 : 2400) * players });
        this.boss = true;
        this.name = final ? 'Mandelblum Sovereign' : 'Mandelblum Core';
        this.active = true;
        this.shooter = true;
        this.clock = 0;
        this.fireCooldown = 3;
        this.damageRate = (final ? 25 : 20) * players;
        this.damageBudget = this.damageRate;
        this.laserLanes = [];
        this.laserActive = false;
        this.laserWidth = final ? 34 : 26;
        this.final = final;
        this.spin = 0.12;
    }

    update(dt) {
        this.clock += dt;
        this.rotation += this.spin * dt;
        this.flash = Math.max(0, this.flash - dt);
        this.x = 400 + Math.sin(this.clock * 0.4) * (this.final ? 170 : 135);
        this.damageBudget = Math.min(this.damageRate, this.damageBudget + this.damageRate * dt);
        const phase = this.clock % 12;
        if (phase < 8 || phase >= 11) this.laserLanes = [];
        this.laserActive = phase >= 9.5 && phase < 11;
    }

    takeHit(damage) {
        const applied = Math.min(Math.max(0, damage), this.damageBudget, this.hp);
        this.damageBudget -= applied;
        this.hp -= applied;
        this.flash = applied > 0 ? 0.06 : 0;
        return this.hp <= 0;
    }

    breakApart() { return []; }
}

module.exports = Boss;
