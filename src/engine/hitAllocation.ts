import { Army } from './types';

/**
 * Get the total number of combat units in an army.
 */
export function getTotalUnits(army: Army): number {
  return army.regulars + army.elites;
}

/**
 * Create a deep copy of an army.
 */
export function cloneArmy(army: Army): Army {
  return { ...army, characters: army.characters.map((c) => ({ ...c })) };
}

/**
 * Allocate hits to an army using the "protect elites" strategy.
 * This models optimal play: absorb hits on regulars first,
 * then downgrade fresh elites to regulars, then kill the new regulars.
 *
 * In War of the Ring, when an elite takes a hit it is replaced by a
 * regular (not removed). It effectively costs 2 hits to fully eliminate
 * an elite unit.
 *
 * Hit priority:
 * 1. Kill regulars (1 hit each)
 * 2. Downgrade fresh elites to regulars (1 hit each)
 * 3. Kill newly created regulars if hits remain
 *
 * Leaders are never killed by normal combat hits (they retreat or are
 * removed by other game mechanics).
 */
export function allocateHits(army: Army, hits: number): Army {
  const result = cloneArmy(army);
  let remaining = hits;

  // 1. Kill regulars first
  const regularsKilled = Math.min(result.regulars, remaining);
  result.regulars -= regularsKilled;
  remaining -= regularsKilled;

  if (remaining <= 0) return result;

  // 2. Downgrade fresh elites to regulars (first hit)
  const elitesDowngraded = Math.min(result.elites, remaining);
  result.elites -= elitesDowngraded;
  result.regulars += elitesDowngraded;
  remaining -= elitesDowngraded;

  if (remaining <= 0) return result;

  // 3. Kill the newly created regulars with remaining hits
  const newRegularsKilled = Math.min(result.regulars, remaining);
  result.regulars -= newRegularsKilled;
  remaining -= newRegularsKilled;

  return result;
}

/**
 * Check if an army has been eliminated (no combat units left).
 */
export function isEliminated(army: Army): boolean {
  return getTotalUnits(army) === 0;
}
