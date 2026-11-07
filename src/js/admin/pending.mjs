export function isLegacySupporterRelease(entry) {
  return (entry.kind === 'supporter-prize' || entry.kind === 'supporterPrize') && !entry.protocol && !entry.bonus;
}

export function pendingCounts({ stamps = null, payroll = null, arena = null } = {}) {
  const count = value => Array.isArray(value) ? value.length : 0;
  return {
    stamps: count(stamps?.pending),
    prizes: count(payroll?.pending?.filter?.(isLegacySupporterRelease)),
    payroll: count(payroll?.pending),
    arena: count(arena?.pending),
  };
}
export function waitingTotal(counts) { return counts.stamps + counts.prizes + counts.arena; }
