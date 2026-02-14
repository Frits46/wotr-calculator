import { resolveCombatRound } from '../../src/engine/combat';
import { Army } from '../../src/engine/types';

function makeArmy(overrides: Partial<Army> = {}): Army {
  return {
    regulars: 0,
    elites: 0,
    leaders: 0,
    characters: [],
    ...overrides,
  };
}

describe('resolveCombatRound', () => {
  it('returns correct round number', () => {
    const attacker = makeArmy({ regulars: 3 });
    const defender = makeArmy({ regulars: 3 });
    const result = resolveCombatRound(attacker, defender, 'field', 1);
    expect(result.round).toBe(1);
  });

  it('does not mutate input armies', () => {
    const attacker = makeArmy({ regulars: 3 });
    const defender = makeArmy({ regulars: 3 });
    resolveCombatRound(attacker, defender, 'field', 1);
    expect(attacker.regulars).toBe(3);
    expect(defender.regulars).toBe(3);
  });

  it('hits are non-negative', () => {
    const attacker = makeArmy({ regulars: 5 });
    const defender = makeArmy({ regulars: 5 });
    const result = resolveCombatRound(attacker, defender, 'field', 1);
    expect(result.attackerHits).toBeGreaterThanOrEqual(0);
    expect(result.defenderHits).toBeGreaterThanOrEqual(0);
  });

  it('attacker hits do not exceed 5 dice', () => {
    const attacker = makeArmy({ regulars: 5 });
    const defender = makeArmy({ regulars: 5 });
    for (let i = 0; i < 100; i++) {
      const result = resolveCombatRound(attacker, defender, 'field', 1);
      expect(result.attackerHits).toBeLessThanOrEqual(5);
      expect(result.defenderHits).toBeLessThanOrEqual(5);
    }
  });

  it('empty army scores 0 hits', () => {
    const attacker = makeArmy();
    const defender = makeArmy({ regulars: 3 });
    const result = resolveCombatRound(attacker, defender, 'field', 1);
    expect(result.attackerHits).toBe(0);
  });

  it('siege attacker has harder time hitting (statistical)', () => {
    const attacker = makeArmy({ regulars: 5 });
    const defender = makeArmy({ regulars: 5 });
    let fieldHits = 0;
    let siegeHits = 0;
    const trials = 5000;

    for (let i = 0; i < trials; i++) {
      fieldHits += resolveCombatRound(attacker, defender, 'field', 1).attackerHits;
      siegeHits += resolveCombatRound(attacker, defender, 'siege', 1).attackerHits;
    }

    // Siege attacker hits on 6 vs field attacker hits on 5+
    expect(siegeHits / trials).toBeLessThan(fieldHits / trials);
  });

  it('resulting armies have fewer or equal units', () => {
    const attacker = makeArmy({ regulars: 3, elites: 2 });
    const defender = makeArmy({ regulars: 3, elites: 2 });
    for (let i = 0; i < 50; i++) {
      const result = resolveCombatRound(attacker, defender, 'field', 1);
      const attackerUnits = result.attackerArmy.regulars + result.attackerArmy.elites;
      const defenderUnits = result.defenderArmy.regulars + result.defenderArmy.elites;
      expect(attackerUnits).toBeLessThanOrEqual(5);
      expect(defenderUnits).toBeLessThanOrEqual(5);
    }
  });
});
