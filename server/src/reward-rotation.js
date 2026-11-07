'use strict';
const { randomInt } = require('node:crypto');
const { affordablePrizes } = require('../../src/js/prizes');

function createRewardRotation({ choose = randomInt, now = () => Date.now() } = {}) {
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
    const available = affordablePrizes(difficulty).map(prize => prize.tokenId);
    for (const [wallet, state] of wallets) if (now() - state.at > 24 * 60 * 60 * 1000) wallets.delete(wallet);
    if (!wallets.has(key) && wallets.size >= 10000) wallets.delete(wallets.keys().next().value);
    const state = wallets.get(key) || { bag: [], last: [] };
    state.bag = state.bag.filter(token => available.includes(token));
    const avoid = new Set([...state.last, ...recent.filter(token => available.includes(token))]);
    const tokens = [];
    for (let slot = 0; slot < 2; slot++) {
      let index = state.bag.findIndex(token => !avoid.has(token) && !tokens.includes(token));
      if (index < 0) {
        const missing = available.filter(token => !state.bag.includes(token));
        state.bag.push(...shuffled(missing));
        index = state.bag.findIndex(token => !avoid.has(token) && !tokens.includes(token));
      }
      if (index < 0) throw new Error('No affordable Supporter rotation candidate is available.');
      tokens.push(state.bag.splice(index, 1)[0]);
    }
    state.last = tokens;
    state.at = now();
    wallets.set(key, state);
    return { version: 2, difficulty, tokens, levels: [[9, 10][choose(2)], [17, 18, 19][choose(3)]] };
  }
  return { next };
}
module.exports = { createRewardRotation };
