'use strict';
const { randomInt } = require('node:crypto');
const { affordablePrizesForSlot } = require('../../src/js/prizes');

function createRewardRotation({ choose = randomInt, now = () => Date.now(), rewardPools = {} } = {}) {
  const wallets = new Map();
  function shuffled(tokens) {
    const result = [...tokens];
    for (let index = result.length - 1; index > 0; index--) {
      const other = choose(index + 1);
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }
  function next(address, difficulty, recent = []) {
    if (!['pilot', 'ace'].includes(difficulty)) throw new Error('Reward rotation requires Pilot or Ace difficulty.');
    const key = address.toLowerCase();
    const available = [0, 1].map(slot => affordablePrizesForSlot(difficulty, slot, rewardPools)
      .map(prize => prize.tokenId));
    const sharedCandidates = available[0].length === available[1].length &&
      available[0].every(token => available[1].includes(token));
    for (const [wallet, state] of wallets) if (now() - state.at > 24 * 60 * 60 * 1000) wallets.delete(wallet);
    if (!wallets.has(key) && wallets.size >= 10000) wallets.delete(wallets.keys().next().value);
    const state = wallets.get(key) || { bags: [[], []], last: [] };
    const tokens = [];
    for (let slot = 0; slot < available.length; slot++) {
      const pool = available[slot];
      const bagSlot = sharedCandidates ? 0 : slot;
      const poolIds = new Set(pool);
      const bag = state.bags[bagSlot].filter(token => poolIds.has(token));
      const avoid = new Set([
        ...state.last.filter(token => poolIds.has(token)),
        ...recent.filter(token => poolIds.has(token)),
        ...tokens,
      ]);
      let index = bag.findIndex(token => !avoid.has(token));
      if (index < 0) {
        const missing = pool.filter(token => !bag.includes(token));
        bag.push(...shuffled(missing));
        index = bag.findIndex(token => !avoid.has(token));
      }
      if (index < 0) {
        state.bags[bagSlot] = shuffled(pool.filter(token => !tokens.includes(token)));
        index = 0;
      } else state.bags[bagSlot] = bag;
      if (index < 0 || state.bags[bagSlot].length === 0) throw new Error('No affordable Supporter rotation candidate is available.');
      tokens.push(state.bags[bagSlot].splice(index, 1)[0]);
    }
    state.last = tokens;
    state.at = now();
    wallets.set(key, state);
    return { version: 2, difficulty, tokens, levels: [[9, 10][choose(2)], [17, 18, 19][choose(3)]] };
  }
  return { next };
}
module.exports = { createRewardRotation };
