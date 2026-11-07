'use strict';

const Game = require('../../src/js/game');
const RULESET = require('../../src/js/ruleset');
const LegacyGame = require('../legacy/voyager-1.3-mini-emblem/game');
const LEGACY_RULESET = require('../legacy/voyager-1.3-mini-emblem/ruleset');
const OpenSectorGame = require('../legacy/voyager-1.4-open-sector/game');
const OPEN_SECTOR_RULESET = require('../legacy/voyager-1.4-open-sector/ruleset');
const BossGame = require('../legacy/voyager-1.5-mandelblum-boss/game');
const BOSS_RULESET = require('../legacy/voyager-1.5-mandelblum-boss/ruleset');

const games = new Map([[RULESET, Game], [LEGACY_RULESET, LegacyGame], [OPEN_SECTOR_RULESET, OpenSectorGame], [BOSS_RULESET, BossGame]]);

function gameForRuleset(ruleset) {
  const implementation = games.get(ruleset);
  if (!implementation) throw new Error('Flight uses an unsupported older game ruleset. Reload Voyager and start a new flight; existing claim vouchers remain valid.');
  return implementation;
}

module.exports = { gameForRuleset };
