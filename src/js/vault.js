const { pick, range } = require('./rng');
const { PRIZES, affordablePrizes, validateRewardPlan } = require('./prizes');
const Asteroid = require('./asteroid');

function chooseVaultLevel(tier, rng) { return tier === 1 ? pick(rng, [9, 10]) : pick(rng, [19, 20]); }
function createVault(tier, level, rng, rewardPlan = null) {
    const x = range(rng, 300, 500);
    const y = range(rng, 1700, 2400);
    if (rewardPlan) validateRewardPlan(rewardPlan);
    const prize = rewardPlan ? affordablePrizes(rewardPlan.difficulty).find(entry => entry.tokenId === rewardPlan.tokens[tier - 1]) : pick(rng, PRIZES[tier]);
    const easy = rewardPlan && tier === 1;
    const count = easy ? 4 : 8;
    const guards = Array.from({ length: count }, (_, index) => {
        const angle = index * Math.PI * 2 / count;
        const guard = new Asteroid({
            id: `vault-${tier}-${level}-${index}`, x: x + Math.cos(angle) * 80, y: y + Math.sin(angle) * 80,
            size: index === 0 ? 26 : 20, hp: easy ? (index === 0 ? 3 : 2) : (index === 0 ? 8 : 5), shooter: true,
            fireCooldown: range(rng, easy ? 1.5 : 0.25, easy ? 2.5 : 0.8), rng
        });
        guard.kind = index === 0 ? 'generator' : 'guard';
        guard.vaultGuard = true;
        guard.vaultTier = tier;
        return guard;
    });
    return { tier, level, x, y, size: 36, prize, guards, captured: false, spawned: false, shielded: true };
}
function markGuardDestroyed(vault, guard) {
    if (!vault || !guard.vaultGuard || guard.destroyNotified) return false;
    guard.destroyNotified = true;
    if (vault.guards.every((entry) => entry.hp <= 0)) vault.shielded = false;
    return true;
}
module.exports = { chooseVaultLevel, createVault, markGuardDestroyed };
