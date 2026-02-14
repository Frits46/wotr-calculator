import {
  allocateHits,
  getTotalUnits,
  isEliminated,
  cloneArmy,
} from '../../src/engine/hitAllocation';
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

// ── getTotalUnits ──

describe('getTotalUnits', () => {
  it('counts regulars and elites', () => {
    expect(getTotalUnits(makeArmy({ regulars: 2, elites: 1 }))).toBe(3);
  });

  it('returns 0 for empty army', () => {
    expect(getTotalUnits(makeArmy())).toBe(0);
  });
});

// ── isEliminated ──

describe('isEliminated', () => {
  it('returns true for empty army', () => {
    expect(isEliminated(makeArmy())).toBe(true);
  });

  it('returns false if regulars remain', () => {
    expect(isEliminated(makeArmy({ regulars: 1 }))).toBe(false);
  });

  it('returns false if elites remain', () => {
    expect(isEliminated(makeArmy({ elites: 1 }))).toBe(false);
  });

  it('leaders alone counts as eliminated', () => {
    expect(isEliminated(makeArmy({ leaders: 3 }))).toBe(true);
  });
});

// ── cloneArmy ──

describe('cloneArmy', () => {
  it('creates independent copy', () => {
    const original = makeArmy({ regulars: 3, elites: 2 });
    const copy = cloneArmy(original);
    copy.regulars = 0;
    expect(original.regulars).toBe(3);
  });
});

// ── allocateHits ──

describe('allocateHits', () => {
  it('kills regulars first', () => {
    const army = makeArmy({ regulars: 3, elites: 1 });
    const result = allocateHits(army, 2);
    expect(result.regulars).toBe(1);
    expect(result.elites).toBe(1);
  });

  it('does not mutate original army', () => {
    const army = makeArmy({ regulars: 3 });
    allocateHits(army, 2);
    expect(army.regulars).toBe(3);
  });

  it('downgrades elites to regulars after regulars are gone', () => {
    const army = makeArmy({ regulars: 0, elites: 2 });
    const result = allocateHits(army, 1);
    expect(result.elites).toBe(1);
    expect(result.regulars).toBe(1); // one elite downgraded to regular
  });

  it('kills newly created regulars with excess hits', () => {
    const army = makeArmy({ elites: 1 }); // 1 fresh elite
    const result = allocateHits(army, 2);  // 2 hits: downgrade then kill
    expect(result.elites).toBe(0);
    expect(result.regulars).toBe(0);
  });

  it('handles 0 hits', () => {
    const army = makeArmy({ regulars: 3, elites: 2 });
    const result = allocateHits(army, 0);
    expect(result.regulars).toBe(3);
    expect(result.elites).toBe(2);
  });

  it('handles overkill (more hits than units)', () => {
    const army = makeArmy({ regulars: 1 });
    const result = allocateHits(army, 10);
    expect(result.regulars).toBe(0);
    expect(isEliminated(result)).toBe(true);
  });

  it('complex scenario: mixed army takes multiple hits', () => {
    // 2 regulars, 2 elites = 4 combat units
    const army = makeArmy({ regulars: 2, elites: 2 });
    const result = allocateHits(army, 4);
    // 2 hits kill 2 regulars, 2 hits downgrade 2 elites to 2 regulars
    expect(result.regulars).toBe(2); // the two downgraded elites
    expect(result.elites).toBe(0);
  });

  it('elite takes 2 hits to fully eliminate', () => {
    const army = makeArmy({ regulars: 0, elites: 1 });
    const result = allocateHits(army, 2);
    expect(result.elites).toBe(0);
    expect(result.regulars).toBe(0);
    expect(isEliminated(result)).toBe(true);
  });

  it('3 hits on 2 elites: downgrade both, kill one regular', () => {
    const army = makeArmy({ elites: 2 });
    const result = allocateHits(army, 3);
    // 2 hits downgrade 2 elites to 2 regulars, 1 hit kills 1 regular
    expect(result.elites).toBe(0);
    expect(result.regulars).toBe(1);
  });

  it('leaders survive combat', () => {
    const army = makeArmy({ regulars: 1, leaders: 2 });
    const result = allocateHits(army, 5);
    expect(result.leaders).toBe(2); // leaders always survive
    expect(result.regulars).toBe(0);
  });
});
