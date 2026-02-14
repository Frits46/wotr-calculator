import { attemptSiegeExtension, maxSiegeExtensions, shouldExtendSiege, shouldContinueNewBattle } from '../../src/engine/siege';
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

describe('attemptSiegeExtension', () => {
  it('downgrades an elite to a regular', () => {
    const army = makeArmy({ regulars: 2, elites: 1 });
    const result = attemptSiegeExtension(army);
    expect(result).not.toBeNull();
    expect(result!.elites).toBe(0);
    expect(result!.regulars).toBe(3); // 2 original + 1 downgraded
  });

  it('returns null when no elites to sacrifice', () => {
    const army = makeArmy({ regulars: 5 });
    expect(attemptSiegeExtension(army)).toBeNull();
  });

  it('does not mutate original army', () => {
    const army = makeArmy({ elites: 2 });
    attemptSiegeExtension(army);
    expect(army.elites).toBe(2);
  });
});

describe('maxSiegeExtensions', () => {
  it('each elite provides 1 extension', () => {
    expect(maxSiegeExtensions(makeArmy({ elites: 2 }))).toBe(2);
  });

  it('no elites = 0 extensions', () => {
    expect(maxSiegeExtensions(makeArmy({ regulars: 5 }))).toBe(0);
  });
});

describe('shouldExtendSiege', () => {
  it('returns true when round < max and has elites', () => {
    const army = makeArmy({ regulars: 3, elites: 1 });
    expect(shouldExtendSiege(army, 1, 3)).toBe(true);
  });

  it('returns false when at max rounds', () => {
    const army = makeArmy({ regulars: 3, elites: 1 });
    expect(shouldExtendSiege(army, 3, 3)).toBe(false);
  });

  it('returns false when no units left', () => {
    const army = makeArmy({ leaders: 1 }); // leaders don't count
    expect(shouldExtendSiege(army, 1, 3)).toBe(false);
  });

  it('returns false when no elites to sacrifice', () => {
    const army = makeArmy({ regulars: 3 }); // has units but no elites
    expect(shouldExtendSiege(army, 1, 3)).toBe(false);
  });
});

describe('shouldContinueNewBattle', () => {
  it('returns true when round < max and has combat units', () => {
    const army = makeArmy({ regulars: 3 });
    expect(shouldContinueNewBattle(army, 1, 3)).toBe(true);
  });

  it('returns true with only elites', () => {
    const army = makeArmy({ elites: 2 });
    expect(shouldContinueNewBattle(army, 1, 3)).toBe(true);
  });

  it('returns false when at max rounds', () => {
    const army = makeArmy({ regulars: 3 });
    expect(shouldContinueNewBattle(army, 3, 3)).toBe(false);
  });

  it('returns false when no combat units left', () => {
    const army = makeArmy({ leaders: 1 }); // leaders don't count
    expect(shouldContinueNewBattle(army, 1, 3)).toBe(false);
  });

  it('does not require elites (unlike extend mode)', () => {
    const army = makeArmy({ regulars: 3 }); // regulars only, no elites
    expect(shouldContinueNewBattle(army, 1, 3)).toBe(true);
  });
});
