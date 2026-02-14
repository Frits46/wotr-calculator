import { Army, BattleType, RoundResult } from './types';
import { getCombatDice, getHitThreshold, getLeadership, rollWithRerolls } from './dice';
import { allocateHits, cloneArmy } from './hitAllocation';

/**
 * Resolve a single round of combat.
 *
 * Both sides roll simultaneously, then hits are applied.
 * The attacker and defender armies are NOT mutated — new copies are returned.
 */
export function resolveCombatRound(
  attacker: Army,
  defender: Army,
  battleType: BattleType,
  roundNumber: number,
): RoundResult {
  // Calculate dice and leadership for each side
  const attackerDice = getCombatDice(attacker);
  const attackerThreshold = getHitThreshold(battleType, 'attacker');
  const attackerLeadership = getLeadership(attacker, defender);

  const defenderDice = getCombatDice(defender);
  const defenderThreshold = getHitThreshold(battleType, 'defender');
  const defenderLeadership = getLeadership(defender, attacker);

  // Roll dice simultaneously
  const attackerHits = rollWithRerolls(attackerDice, attackerThreshold, attackerLeadership);
  const defenderHits = rollWithRerolls(defenderDice, defenderThreshold, defenderLeadership);

  // Apply hits — attacker hits damage defender, defender hits damage attacker
  const newDefender = allocateHits(defender, attackerHits);
  const newAttacker = allocateHits(attacker, defenderHits);

  return {
    round: roundNumber,
    attackerHits,
    defenderHits,
    attackerArmy: newAttacker,
    defenderArmy: newDefender,
  };
}
