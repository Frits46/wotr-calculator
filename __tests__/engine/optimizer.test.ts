import { generateCandidates, runOptimizerSync } from '../../src/engine/optimizer';
import { Army, OptimizerConstraints } from '../../src/engine/types';

function makeDefender(overrides: Partial<Army> = {}): Army {
  return {
    regulars: 0,
    elites: 0,
    leaders: 0,
    characters: [],
    ...overrides,
  };
}

function makeConstraints(overrides: Partial<OptimizerConstraints> = {}): OptimizerConstraints {
  return {
    maxRegulars: 3,
    maxElites: 2,
    maxLeaders: 1,
    maxTotalUnits: 5,
    battleType: 'field',
    defender: makeDefender({ regulars: 2 }),
    maxSiegeRounds: 1,
    ...overrides,
  };
}

// ── generateCandidates ──

describe('generateCandidates', () => {
  it('generates candidates within constraints', () => {
    const constraints = makeConstraints({ maxRegulars: 2, maxElites: 1, maxLeaders: 1, maxTotalUnits: 3 });
    const candidates = generateCandidates(constraints);

    for (const c of candidates) {
      expect(c.regulars).toBeLessThanOrEqual(2);
      expect(c.elites).toBeLessThanOrEqual(1);
      expect(c.leaders).toBeLessThanOrEqual(1);
      expect(c.regulars + c.elites + c.leaders).toBeLessThanOrEqual(3);
      expect(c.regulars + c.elites).toBeGreaterThan(0);
      expect(c.regulars + c.elites).toBeLessThanOrEqual(10);
    }
  });

  it('produces correct count for small constraints', () => {
    // maxRegulars=2, maxElites=1, maxLeaders=0, maxTotalUnits=3
    // Valid: (0,1,0), (1,0,0), (1,1,0), (2,0,0), (2,1,0) = 5
    const constraints = makeConstraints({
      maxRegulars: 2,
      maxElites: 1,
      maxLeaders: 0,
      maxTotalUnits: 3,
    });
    const candidates = generateCandidates(constraints);
    expect(candidates.length).toBe(5);
  });

  it('returns empty when maxTotalUnits is 0', () => {
    const constraints = makeConstraints({ maxTotalUnits: 0 });
    expect(generateCandidates(constraints).length).toBe(0);
  });

  it('returns empty when both maxRegulars and maxElites are 0', () => {
    const constraints = makeConstraints({ maxRegulars: 0, maxElites: 0, maxLeaders: 3 });
    expect(generateCandidates(constraints).length).toBe(0);
  });

  it('respects 10 combat unit game rule', () => {
    const constraints = makeConstraints({
      maxRegulars: 10,
      maxElites: 10,
      maxLeaders: 0,
      maxTotalUnits: 20,
    });
    const candidates = generateCandidates(constraints);

    for (const c of candidates) {
      expect(c.regulars + c.elites).toBeLessThanOrEqual(10);
    }
  });
});

// ── runOptimizerSync ──

describe('runOptimizerSync', () => {
  it('all results meet the minimum win rate threshold', () => {
    const minWinRate = 0.3;
    const results = runOptimizerSync(makeConstraints(), 'extend', minWinRate, 500);

    for (const r of results) {
      expect(r.winRate).toBeGreaterThanOrEqual(minWinRate);
    }
  });

  it('results are sorted by smallest army first', () => {
    const results = runOptimizerSync(makeConstraints(), 'extend', 0.1, 500);

    for (let i = 1; i < results.length; i++) {
      const prevCombat = results[i - 1].army.regulars + results[i - 1].army.elites;
      const currCombat = results[i].army.regulars + results[i].army.elites;
      expect(prevCombat).toBeLessThanOrEqual(currCombat);
    }
  });

  it('all win rates are between 0 and 1', () => {
    const results = runOptimizerSync(makeConstraints(), 'extend', 0.1, 200);

    for (const r of results) {
      expect(r.winRate).toBeGreaterThanOrEqual(0);
      expect(r.winRate).toBeLessThanOrEqual(1);
    }
  });

  it('returns at most 10 results', () => {
    const results = runOptimizerSync(makeConstraints(), 'extend', 0.1, 200);
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it('finds armies against weak defender', () => {
    const constraints = makeConstraints({
      maxRegulars: 5,
      maxElites: 3,
      maxLeaders: 2,
      maxTotalUnits: 10,
      defender: makeDefender({ regulars: 1 }),
    });
    const results = runOptimizerSync(constraints, 'extend', 0.6, 500);

    expect(results.length).toBeGreaterThan(0);
    // First result should be the smallest qualifying army
    expect(results[0].winRate).toBeGreaterThanOrEqual(0.6);
  });

  it('high threshold returns fewer or no results', () => {
    const constraints = makeConstraints({
      maxRegulars: 2,
      maxElites: 0,
      maxLeaders: 0,
      maxTotalUnits: 2,
      defender: makeDefender({ regulars: 5 }),
    });
    // With only 1-2 regulars vs 5 regulars, unlikely to hit 90%
    const results = runOptimizerSync(constraints, 'extend', 0.9, 500);
    expect(results.length).toBe(0);
  });

  it('efficiency is winRate / totalUnits', () => {
    const results = runOptimizerSync(makeConstraints(), 'extend', 0.1, 200);

    for (const r of results) {
      const totalUnits = r.army.regulars + r.army.elites + r.army.leaders;
      if (totalUnits > 0) {
        expect(r.efficiency).toBeCloseTo(r.winRate / totalUnits, 5);
      }
    }
  });

  it('returns empty for zero total units', () => {
    const constraints = makeConstraints({ maxTotalUnits: 0 });
    const results = runOptimizerSync(constraints, 'extend', 0.6, 200);
    expect(results.length).toBe(0);
  });
});
