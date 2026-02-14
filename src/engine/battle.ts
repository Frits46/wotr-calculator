import { Army, BattleConfig, BattleOutcome, BattleResult, RoundResult } from './types';
import { resolveCombatRound } from './combat';
import { cloneArmy, isEliminated } from './hitAllocation';
import { attemptSiegeExtension, shouldExtendSiege, shouldContinueNewBattle } from './siege';

/**
 * Determine the outcome of a battle given the final army states.
 */
function determineOutcome(attacker: Army, defender: Army): BattleOutcome {
  const attackerDead = isEliminated(attacker);
  const defenderDead = isEliminated(defender);

  if (attackerDead && defenderDead) return 'draw';
  if (defenderDead) return 'attacker_wins';
  if (attackerDead) return 'defender_wins';

  // Both sides still have units — defender wins (held the position)
  return 'defender_wins';
}

/**
 * Run a complete battle from start to finish.
 *
 * Field battles: fight rounds until one side is eliminated.
 * Siege battles: fight one round, then the attacker can extend by
 * sacrificing elites. If both sides survive and the attacker can't
 * or won't extend, the defender wins (held the stronghold).
 */
export function runBattle(config: BattleConfig): BattleResult {
  let attacker = cloneArmy(config.attacker);
  let defender = cloneArmy(config.defender);
  const rounds: RoundResult[] = [];
  let roundNumber = 0;
  let siegeRoundsUsed = 0;

  const maxRounds = config.battleType === 'field' ? 100 : config.maxSiegeRounds;

  while (roundNumber < maxRounds) {
    roundNumber++;

    const roundResult = resolveCombatRound(attacker, defender, config.battleType, roundNumber);
    attacker = roundResult.attackerArmy;
    defender = roundResult.defenderArmy;
    rounds.push(roundResult);
    siegeRoundsUsed = roundNumber;

    // Check if either side is eliminated
    if (isEliminated(attacker) || isEliminated(defender)) {
      break;
    }

    // For siege battles, check if attacker wants/can extend
    if (config.battleType === 'siege') {
      if (config.siegeContinuation === 'new_battle') {
        // New battle mode: no elite cost, just check rounds and units
        if (!shouldContinueNewBattle(attacker, roundNumber, config.maxSiegeRounds)) {
          break;
        }
      } else {
        // Extend mode: pay an elite to continue
        if (!shouldExtendSiege(attacker, roundNumber, config.maxSiegeRounds)) {
          break;
        }
        const extended = attemptSiegeExtension(attacker);
        if (!extended) break;
        attacker = extended;
      }
    }

    // For field battles, continue until one side is eliminated
    // (the loop continues)
  }

  return {
    outcome: determineOutcome(attacker, defender),
    rounds,
    finalAttacker: attacker,
    finalDefender: defender,
    siegeRoundsUsed,
  };
}
