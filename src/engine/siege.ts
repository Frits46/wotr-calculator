import { Army } from './types';
import { cloneArmy } from './hitAllocation';

/**
 * Check if the attacker can extend the siege by one more round.
 * The attacker must downgrade one elite to a regular to extend.
 * Returns the modified attacker army if extension is possible, or null if not.
 */
export function attemptSiegeExtension(attacker: Army): Army | null {
  const result = cloneArmy(attacker);

  if (result.elites > 0) {
    result.elites -= 1;
    result.regulars += 1;
    return result;
  }

  // No elites to sacrifice — cannot extend
  return null;
}

/**
 * Count how many additional siege rounds the attacker could extend
 * (beyond the first free round), given their current elites.
 * Each elite provides 1 extension (downgraded to regular).
 */
export function maxSiegeExtensions(attacker: Army): number {
  return attacker.elites;
}

/**
 * Determine if the attacker should attempt to extend the siege.
 * Simple heuristic: extend if they have units remaining and haven't hit
 * their configured limit.
 */
export function shouldExtendSiege(
  attacker: Army,
  currentRound: number,
  maxSiegeRounds: number,
): boolean {
  if (currentRound >= maxSiegeRounds) return false;

  const totalUnits = attacker.regulars + attacker.elites;
  if (totalUnits === 0) return false;

  return attemptSiegeExtension(attacker) !== null;
}

/**
 * Determine if the attacker should continue with a new siege battle
 * (no elite cost). Simply checks rounds and whether units remain.
 */
export function shouldContinueNewBattle(
  attacker: Army,
  currentRound: number,
  maxSiegeRounds: number,
): boolean {
  if (currentRound >= maxSiegeRounds) return false;
  return attacker.regulars + attacker.elites > 0;
}
