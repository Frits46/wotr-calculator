import { create } from 'zustand';
import {
  Army,
  BattleConfig,
  BattleType,
  Character,
  SiegeContinuation,
  SimulationProgress,
  SimulationResult,
} from '../engine/types';

type ArmyUnitField = 'regulars' | 'elites' | 'leaders';
type Side = 'attacker' | 'defender';

const defaultArmy = (): Army => ({
  regulars: 0,
  elites: 0,
  leaders: 0,
  characters: [],
});

interface BattleStore {
  // State
  battleType: BattleType;
  maxSiegeRounds: number;
  siegeContinuation: SiegeContinuation;
  attacker: Army;
  defender: Army;
  simulationResult: SimulationResult | null;
  simulationProgress: SimulationProgress | null;
  isSimulating: boolean;

  // Actions
  setBattleType: (type: BattleType) => void;
  setMaxSiegeRounds: (rounds: number) => void;
  setSiegeContinuation: (mode: SiegeContinuation) => void;
  incrementUnit: (side: Side, field: ArmyUnitField) => void;
  decrementUnit: (side: Side, field: ArmyUnitField) => void;
  addCharacter: (side: Side, character: Character) => void;
  removeCharacter: (side: Side, characterName: string) => void;
  setArmy: (side: Side, army: Army) => void;
  setSimulationResult: (result: SimulationResult | null) => void;
  setSimulationProgress: (progress: SimulationProgress | null) => void;
  setIsSimulating: (val: boolean) => void;
  getBattleConfig: () => BattleConfig;
  resetAll: () => void;
}

export const useBattleStore = create<BattleStore>()((set, get) => ({
  battleType: 'field',
  maxSiegeRounds: 1,
  siegeContinuation: 'extend',
  attacker: defaultArmy(),
  defender: defaultArmy(),
  simulationResult: null,
  simulationProgress: null,
  isSimulating: false,

  setBattleType: (type) => set({ battleType: type }),
  setMaxSiegeRounds: (rounds) => set({ maxSiegeRounds: Math.max(1, rounds) }),
  setSiegeContinuation: (mode) => set({ siegeContinuation: mode }),

  incrementUnit: (side, field) =>
    set((state) => ({
      [side]: { ...state[side], [field]: state[side][field] + 1 },
    })),

  decrementUnit: (side, field) =>
    set((state) => ({
      [side]: { ...state[side], [field]: Math.max(0, state[side][field] - 1) },
    })),

  addCharacter: (side, character) =>
    set((state) => {
      const army = state[side];
      if (army.characters.some((c) => c.name === character.name)) return {};
      return { [side]: { ...army, characters: [...army.characters, character] } };
    }),

  removeCharacter: (side, characterName) =>
    set((state) => {
      const army = state[side];
      return {
        [side]: { ...army, characters: army.characters.filter((c) => c.name !== characterName) },
      };
    }),

  setArmy: (side, army) => set({ [side]: army }),

  setSimulationResult: (result) => set({ simulationResult: result }),
  setSimulationProgress: (progress) => set({ simulationProgress: progress }),
  setIsSimulating: (val) => set({ isSimulating: val }),

  getBattleConfig: () => {
    const { battleType, attacker, defender, maxSiegeRounds, siegeContinuation } = get();
    return { battleType, attacker, defender, maxSiegeRounds, siegeContinuation };
  },

  resetAll: () =>
    set({
      battleType: 'field',
      maxSiegeRounds: 1,
      siegeContinuation: 'extend',
      attacker: defaultArmy(),
      defender: defaultArmy(),
      simulationResult: null,
      simulationProgress: null,
      isSimulating: false,
    }),
}));
