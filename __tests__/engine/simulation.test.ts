import { runSimulationSync } from '../../src/engine/simulation';
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

describe('runSimulationSync', () => {
  it('runs correct number of simulations', () => {
    const result = runSimulationSync(makeConfig(), 100);
    expect(result.totalRuns).toBe(100);
    expect(result.results.length).toBe(100);
  });

  it('win counts add up to total runs', () => {
    const result = runSimulationSync(makeConfig(), 1000);
    expect(result.attackerWins + result.defenderWins + result.draws).toBe(1000);
  });

  it('win rates are between 0 and 1', () => {
    const result = runSimulationSync(makeConfig(), 1000);
    expect(result.attackerWinRate).toBeGreaterThanOrEqual(0);
    expect(result.attackerWinRate).toBeLessThanOrEqual(1);
    expect(result.defenderWinRate).toBeGreaterThanOrEqual(0);
    expect(result.defenderWinRate).toBeLessThanOrEqual(1);
  });

  it('average rounds is positive', () => {
    const result = runSimulationSync(makeConfig(), 500);
    expect(result.averageRounds).toBeGreaterThan(0);
  });

  it('overwhelming attacker has high win rate', () => {
    const result = runSimulationSync(
      makeConfig({
        attacker: makeArmy({ regulars: 5 }),
        defender: makeArmy({ regulars: 1 }),
      }),
      2000,
    );
    expect(result.attackerWinRate).toBeGreaterThan(0.85);
  });

  it('siege defender has advantage over equal attacker', () => {
    const siegeResult = runSimulationSync(
      makeConfig({
        battleType: 'siege',
        attacker: makeArmy({ regulars: 3 }),
        defender: makeArmy({ regulars: 3 }),
        maxSiegeRounds: 1,
      }),
      2000,
    );
    expect(siegeResult.defenderWinRate).toBeGreaterThan(siegeResult.attackerWinRate);
  });

  it('survivor distributions are populated', () => {
    const result = runSimulationSync(makeConfig(), 500);
    const totalAttackerSurvivors = result.attackerSurvivorDist.reduce((a, b) => a + b, 0);
    const totalDefenderSurvivors = result.defenderSurvivorDist.reduce((a, b) => a + b, 0);
    expect(totalAttackerSurvivors).toBe(500);
    expect(totalDefenderSurvivors).toBe(500);
  });
});
