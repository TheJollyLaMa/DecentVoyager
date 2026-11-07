export function flightStatGroups(totals = {}) {
  const number = key => Number(totals[key]) || 0;
  const count = key => number(key).toLocaleString();
  const metrics = fields => fields.map(([label, key]) => [label, count(key)]);
  return [
    ['Voyages', [
      ...metrics([['Flights launched', 'campaignsStarted'], ['Campaign victories', 'victories'], ['Levels attempted', 'levelsPlayed'], ['Levels cleared', 'levelsCleared'], ['Levels failed', 'levelsFailed'], ['Levels abandoned', 'levelsAbandoned']]),
      ['Flight time', `${Math.floor(number('playTimeSec') / 3600)}h ${Math.floor(number('playTimeSec') % 3600 / 60)}m`]
    ]],
    ['Firepower', [
      ...metrics([['Bullets fired', 'shotsFired'], ['Trigger pulls', 'volleys'], ['Bullets on target', 'hits']]),
      ['Accuracy', `${(number('shotsFired') ? Math.min(1, number('hits') / number('shotsFired')) * 100 : 0).toFixed(1)}%`],
      ...metrics([['Mandelblums encountered', 'asteroidsSpawned'], ['Mandelblums destroyed', 'asteroidsDestroyed'], ['Mandelblums missed', 'asteroidsMissed'], ['Shooters destroyed', 'shootersDestroyed'], ['Fragments destroyed', 'fragmentsDestroyed'], ['Bosses defeated', 'bossesDestroyed'], ['Best combo', 'maxCombo']])
    ]],
    ['Survival', [
      ...metrics([['Lives lost', 'livesLost'], ['Hits taken', 'hitsTaken'], ['Collisions', 'collisions'], ['Damage taken', 'damageTaken'], ['Shield blocks', 'shieldBlocks'], ['Enemy shots fired', 'enemyShotsFired'], ['Shots dodged', 'enemyShotsDodged'], ['Pickups missed', 'pickupsMissed'], ['Mini hits absorbed', 'miniHitsAbsorbed']]),
      ['Closest dodge', totals.closestCall == null || totals.closestCall < 0 ? 'Not recorded' : `${number('closestCall').toFixed(1)} px`],
      ['POV time', `${Math.round(number('timeInPov'))} sec`], ['Overview time', `${Math.round(number('timeInOverview'))} sec`]
    ]],
    ['Weapons used', Object.entries(totals.shotsByWeapon || {}).map(([name, value]) => [name, Number(value).toLocaleString()])],
    ['Cargo collected', Object.entries(totals.pickupsCollected || {}).map(([name, value]) => [name, Number(value).toLocaleString()])]
  ];
}
