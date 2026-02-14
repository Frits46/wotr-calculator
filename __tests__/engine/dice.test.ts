import {
  getHitThreshold,
  getCombatDice,
  getLeadership,
  rollD6,
  rollDice,
  countHits,
  rollWithRerolls,
  hitProbability,
  expectedHits,
} from '../../src/engine/dice';
import { Army } from '../../src/engine/types';
import { CHARACTERS } from '../../src/engine/constants';

// ── Helper: make a simple army ──

function makeArmy(overrides: Partial<Army> = {}): Army {
  return {
    regulars: 0,
    elites: 0,
    leaders: 0,
    characters: [],
    ...overrides,
  };
}

// ── getHitThreshold ──

describe('getHitThreshold', () => {
  it('returns 5 for field battle attacker', () => {
    expect(getHitThreshold('field', 'attacker')).toBe(5);
  });

  it('returns 5 for field battle defender', () => {
    expect(getHitThreshold('field', 'defender')).toBe(5);
  });

  it('returns 6 for siege attacker', () => {
    expect(getHitThreshold('siege', 'attacker')).toBe(6);
  });

  it('returns 5 for siege defender', () => {
    expect(getHitThreshold('siege', 'defender')).toBe(5);
  });
});

// ── getCombatDice ──

describe('getCombatDice', () => {
  it('returns unit count for small armies', () => {
    expect(getCombatDice(makeArmy({ regulars: 3 }))).toBe(3);
  });

  it('counts regulars and elites', () => {
    expect(getCombatDice(makeArmy({ regulars: 1, elites: 1 }))).toBe(2);
  });

  it('caps at 5 dice', () => {
    expect(getCombatDice(makeArmy({ regulars: 10 }))).toBe(5);
  });

  it('adds +1 for Captain of the West', () => {
    const aragorn = CHARACTERS.find((c) => c.name === 'Aragorn')!;
    expect(getCombatDice(makeArmy({ regulars: 3, characters: [aragorn] }))).toBe(4);
  });

  it('Captain of the West still capped at 5', () => {
    const aragorn = CHARACTERS.find((c) => c.name === 'Aragorn')!;
    expect(getCombatDice(makeArmy({ regulars: 5, characters: [aragorn] }))).toBe(5);
  });

  it('returns 0 for empty army', () => {
    expect(getCombatDice(makeArmy())).toBe(0);
  });
});

// ── getLeadership ──

describe('getLeadership', () => {
  it('returns leader count without character', () => {
    expect(getLeadership(makeArmy({ leaders: 2 }))).toBe(2);
  });

  it('adds character leadership', () => {
    const aragorn = CHARACTERS.find((c) => c.name === 'Aragorn')!;
    expect(getLeadership(makeArmy({ leaders: 1, characters: [aragorn] }))).toBe(4);
  });

  it('caps at 5 re-rolls', () => {
    const aragorn = CHARACTERS.find((c) => c.name === 'Aragorn')!;
    expect(getLeadership(makeArmy({ leaders: 3, characters: [aragorn] }))).toBe(5);
  });

  it('negates Witch-king leadership when facing Gandalf the White', () => {
    const witchKing = CHARACTERS.find((c) => c.name === 'The Witch-king')!;
    const gandalf = CHARACTERS.find((c) => c.name === 'Gandalf the White')!;
    const shadowArmy = makeArmy({ leaders: 1, characters: [witchKing] });
    const freeArmy = makeArmy({ characters: [gandalf] });
    // Witch-king has leadership 3, but it should be negated
    expect(getLeadership(shadowArmy, freeArmy)).toBe(1); // only the generic leader
  });

  it('Witch-king leadership works without Gandalf opposing', () => {
    const witchKing = CHARACTERS.find((c) => c.name === 'The Witch-king')!;
    const shadowArmy = makeArmy({ leaders: 1, characters: [witchKing] });
    expect(getLeadership(shadowArmy)).toBe(4); // 1 leader + 3 from Witch-king
  });
});

// ── rollD6 ──

describe('rollD6', () => {
  it('produces values between 1 and 6', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollD6();
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    }
  });
});

// ── rollDice ──

describe('rollDice', () => {
  it('returns correct number of dice', () => {
    expect(rollDice(5).length).toBe(5);
    expect(rollDice(0).length).toBe(0);
    expect(rollDice(1).length).toBe(1);
  });

  it('all values between 1 and 6', () => {
    const results = rollDice(100);
    results.forEach((d) => {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    });
  });
});

// ── countHits ──

describe('countHits', () => {
  it('counts hits at threshold 5', () => {
    expect(countHits([1, 2, 3, 4, 5, 6], 5)).toBe(2);
  });

  it('counts hits at threshold 6', () => {
    expect(countHits([1, 2, 3, 4, 5, 6], 6)).toBe(1);
  });

  it('returns 0 for no dice', () => {
    expect(countHits([], 5)).toBe(0);
  });

  it('counts all hits when all succeed', () => {
    expect(countHits([5, 5, 6, 6], 5)).toBe(4);
  });
});

// ── Statistical tests ──

describe('rollWithRerolls (statistical)', () => {
  const NUM_TRIALS = 10000;
  const TOLERANCE = 0.05; // 5% tolerance

  it('produces correct hit rate for field battle (threshold 5, no rerolls)', () => {
    let totalHits = 0;
    for (let i = 0; i < NUM_TRIALS; i++) {
      totalHits += rollWithRerolls(5, 5, 0);
    }
    const avgHits = totalHits / NUM_TRIALS;
    const expected = 5 * (2 / 6); // ~1.667
    expect(avgHits).toBeCloseTo(expected, 0);
    expect(Math.abs(avgHits - expected)).toBeLessThan(expected * TOLERANCE + 0.1);
  });

  it('produces correct hit rate for siege attacker (threshold 6, no rerolls)', () => {
    let totalHits = 0;
    for (let i = 0; i < NUM_TRIALS; i++) {
      totalHits += rollWithRerolls(5, 6, 0);
    }
    const avgHits = totalHits / NUM_TRIALS;
    const expected = 5 * (1 / 6); // ~0.833
    expect(avgHits).toBeCloseTo(expected, 0);
    expect(Math.abs(avgHits - expected)).toBeLessThan(expected * TOLERANCE + 0.1);
  });

  it('rerolls improve hit rate', () => {
    let hitsNoReroll = 0;
    let hitsWithReroll = 0;
    for (let i = 0; i < NUM_TRIALS; i++) {
      hitsNoReroll += rollWithRerolls(5, 5, 0);
      hitsWithReroll += rollWithRerolls(5, 5, 5);
    }
    expect(hitsWithReroll / NUM_TRIALS).toBeGreaterThan(hitsNoReroll / NUM_TRIALS);
  });
});

// ── hitProbability ──

describe('hitProbability', () => {
  it('returns 2/6 for threshold 5', () => {
    expect(hitProbability(5)).toBeCloseTo(2 / 6);
  });

  it('returns 1/6 for threshold 6', () => {
    expect(hitProbability(6)).toBeCloseTo(1 / 6);
  });
});

// ── expectedHits ──

describe('expectedHits', () => {
  it('calculates expected hits for field battle without leadership', () => {
    const army = makeArmy({ regulars: 5 });
    const expected = 5 * (2 / 6); // ~1.667
    expect(expectedHits(army, 'field', 'attacker')).toBeCloseTo(expected, 2);
  });

  it('calculates expected hits for siege attacker', () => {
    const army = makeArmy({ regulars: 5 });
    const expected = 5 * (1 / 6); // ~0.833
    expect(expectedHits(army, 'siege', 'attacker')).toBeCloseTo(expected, 2);
  });

  it('leadership increases expected hits', () => {
    const armyNoLeader = makeArmy({ regulars: 5 });
    const armyWithLeader = makeArmy({ regulars: 5, leaders: 2 });
    expect(expectedHits(armyWithLeader, 'field', 'attacker')).toBeGreaterThan(
      expectedHits(armyNoLeader, 'field', 'attacker'),
    );
  });
});
