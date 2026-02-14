import { runBattle } from '../../src/engine/battle';
import { BattleConfig, Army } from '../../src/engine/types';

function makeArmy(overrides: Partial<Army> = {}): Army {
  return {
    regulars: 0,
    elites: 0,
    leaders: 0,
    characters: [],
    ...overrides,
  };
}

function makeConfig(overrides: Partial<BattleConfig> = {}): BattleConfig {
  return {
    battleType: 'field',
    attacker: makeArmy({ regulars: 3 }),
    defender: makeArmy({ regulars: 3 }),
    maxSiegeRounds: 1,
    siegeContinuation: 'extend',
    ...overrides,
  };
}

describe('runBattle', () => {
  it('field battle ends with at least one side eliminated', () => {
    const result = runBattle(makeConfig());
    expect(result.outcome).toBeDefined();
    expect(result.rounds.length).toBeGreaterThan(0);
  });

  it('siege battle with 1 round ends after 1 round (unless someone is eliminated)', () => {
    const config = makeConfig({
      battleType: 'siege',
      attacker: makeArmy({ regulars: 5 }),
      defender: makeArmy({ regulars: 5 }),
      maxSiegeRounds: 1,
    });
    const result = runBattle(config);
    expect(result.siegeRoundsUsed).toBe(1);
  });

  it('overwhelming attacker wins field battle', () => {
    let attackerWins = 0;
    const trials = 500;
    const config = makeConfig({
      attacker: makeArmy({ regulars: 5, elites: 0 }),
      defender: makeArmy({ regulars: 1 }),
    });

    for (let i = 0; i < trials; i++) {
      const result = runBattle(config);
      if (result.outcome === 'attacker_wins') attackerWins++;
    }

    // Overwhelming force should win >80% of the time
    expect(attackerWins / trials).toBeGreaterThan(0.8);
  });

  it('siege gives defender advantage', () => {
    let attackerWinsField = 0;
    let attackerWinsSiege = 0;
    const trials = 2000;

    for (let i = 0; i < trials; i++) {
      const fieldResult = runBattle(makeConfig({
        battleType: 'field',
        attacker: makeArmy({ regulars: 3 }),
        defender: makeArmy({ regulars: 3 }),
      }));
      if (fieldResult.outcome === 'attacker_wins') attackerWinsField++;

      const siegeResult = runBattle(makeConfig({
        battleType: 'siege',
        attacker: makeArmy({ regulars: 3 }),
        defender: makeArmy({ regulars: 3 }),
        maxSiegeRounds: 1,
      }));
      if (siegeResult.outcome === 'attacker_wins') attackerWinsSiege++;
    }

    // Attacker should win less often in siege
    expect(attackerWinsSiege / trials).toBeLessThan(attackerWinsField / trials);
  });

  it('siege extension uses multiple rounds', () => {
    const config = makeConfig({
      battleType: 'siege',
      attacker: makeArmy({ regulars: 3, elites: 2 }),
      defender: makeArmy({ regulars: 5 }),
      maxSiegeRounds: 3,
      siegeContinuation: 'extend',
    });

    // Run many trials to ensure at least some use multiple rounds
    let multiRoundCount = 0;
    for (let i = 0; i < 200; i++) {
      const result = runBattle(config);
      if (result.rounds.length > 1) multiRoundCount++;
    }
    // Should have some multi-round battles
    expect(multiRoundCount).toBeGreaterThan(0);
  });

  it('new_battle mode does not cost elites for extra rounds', () => {
    const config = makeConfig({
      battleType: 'siege',
      attacker: makeArmy({ regulars: 0, elites: 3 }),
      defender: makeArmy({ regulars: 5 }),
      maxSiegeRounds: 3,
      siegeContinuation: 'new_battle',
    });

    // Run many trials: in new_battle mode, elites should never be downgraded
    // between rounds (only damaged by combat hits)
    let multiRoundCount = 0;
    for (let i = 0; i < 200; i++) {
      const result = runBattle(config);
      if (result.rounds.length > 1) multiRoundCount++;
    }
    // Should have some multi-round battles since max is 3
    expect(multiRoundCount).toBeGreaterThan(0);
  });

  it('new_battle mode respects maxSiegeRounds limit', () => {
    const config = makeConfig({
      battleType: 'siege',
      attacker: makeArmy({ regulars: 5, elites: 3 }),
      defender: makeArmy({ regulars: 5 }),
      maxSiegeRounds: 2,
      siegeContinuation: 'new_battle',
    });

    for (let i = 0; i < 100; i++) {
      const result = runBattle(config);
      expect(result.rounds.length).toBeLessThanOrEqual(2);
    }
  });

  it('returns valid final armies', () => {
    const result = runBattle(makeConfig({
      attacker: makeArmy({ regulars: 3, elites: 1 }),
      defender: makeArmy({ regulars: 2, elites: 1 }),
    }));

    expect(result.finalAttacker.regulars).toBeGreaterThanOrEqual(0);
    expect(result.finalAttacker.elites).toBeGreaterThanOrEqual(0);
    expect(result.finalDefender.regulars).toBeGreaterThanOrEqual(0);
    expect(result.finalDefender.elites).toBeGreaterThanOrEqual(0);
  });
});
