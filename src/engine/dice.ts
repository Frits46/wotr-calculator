import { Army, BattleType, Side } from './types';
import {
  MAX_COMBAT_DICE,
  MAX_REROLLS,
  FIELD_HIT_THRESHOLD,
  SIEGE_ATTACKER_HIT_THRESHOLD,
  DEFENDER_HIT_THRESHOLD,
} from './constants';

/**
 * Get the hit threshold for a given battle context.
 * Returns the minimum die value needed to score a hit.
 */
export function getHitThreshold(
  battleType: BattleType,
  side: Side,
): number {
  if (side === 'defender') return DEFENDER_HIT_THRESHOLD;
  if (battleType === 'siege') return SIEGE_ATTACKER_HIT_THRESHOLD;
  return FIELD_HIT_THRESHOLD;
}

/**
 * Count the number of combat dice for an army (capped at MAX_COMBAT_DICE).
 * Combat strength = regulars + elites.
 * Captain of the West adds +1 die.
 */
export function getCombatDice(army: Army): number {
  const units = army.regulars + army.elites;
  const captainBonus = army.characters.some((c) => c.isCaptainOfTheWest) ? 1 : 0;
  return Math.min(units + captainBonus, MAX_COMBAT_DICE);
}

/**
 * Count the number of re-rolls available from leadership (capped at MAX_REROLLS).
 * Leadership comes from leaders + character leadership.
 * Special case: Gandalf the White negates enemy Nazgûl leadership.
 */
export function getLeadership(army: Army, enemyArmy?: Army): number {
  let leadership = army.leaders;

  const enemyHasGandalf =
    enemyArmy?.characters.some((c) => c.name === 'Gandalf the White') ?? false;

  for (const char of army.characters) {
    const isNazgul = char.specialAbility?.includes('Nazgûl');
    if (isNazgul && enemyHasGandalf) continue;
    leadership += char.leadership;
  }

  return Math.min(leadership, MAX_REROLLS);
}

/**
 * Roll a single d6 (1-6).
 */
export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Roll n dice and return the array of results.
 */
export function rollDice(count: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(rollD6());
  }
  return results;
}

/**
 * Count hits from a set of dice results given a hit threshold.
 */
export function countHits(dice: number[], hitThreshold: number): number {
  return dice.filter((d) => d >= hitThreshold).length;
}

/**
 * Re-roll failed dice and return total hits.
 * First rolls all dice, counts hits, then re-rolls up to `rerolls` failed dice.
 */
export function rollWithRerolls(
  numDice: number,
  hitThreshold: number,
  rerolls: number,
): number {
  const dice = rollDice(numDice);
  let hits = countHits(dice, hitThreshold);
  const misses = numDice - hits;
  const rerollCount = Math.min(misses, rerolls);

  if (rerollCount > 0) {
    const rerollDice = rollDice(rerollCount);
    hits += countHits(rerollDice, hitThreshold);
  }

  return hits;
}

/**
 * Calculate the probability of a single die hitting (for display purposes).
 * P(hit) = (7 - threshold) / 6
 */
export function hitProbability(hitThreshold: number): number {
  return (7 - hitThreshold) / 6;
}

/**
 * Calculate expected hits for a given army in a battle context.
 * Accounts for dice count, hit threshold, and leadership re-rolls.
 */
export function expectedHits(
  army: Army,
  battleType: BattleType,
  side: Side,
  enemyArmy?: Army,
): number {
  const numDice = getCombatDice(army);
  const threshold = getHitThreshold(battleType, side);
  const leadership = getLeadership(army, enemyArmy);
  const pHit = hitProbability(threshold);
  const pMiss = 1 - pHit;

  // Expected hits from initial roll
  const initialHits = numDice * pHit;
  // Expected misses that get re-rolled
  const expectedMisses = numDice * pMiss;
  const expectedRerolls = Math.min(expectedMisses, leadership);
  // Expected hits from re-rolls
  const rerollHits = expectedRerolls * pHit;

  return initialHits + rerollHits;
}
