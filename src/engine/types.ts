// ── Battle Types ──

export type BattleType = 'field' | 'siege';

export type Side = 'attacker' | 'defender';

/** How siege rounds beyond the first are paid for */
export type SiegeContinuation = 'extend' | 'new_battle';

// ── Army Composition ──

export interface Army {
  regulars: number;
  elites: number;
  leaders: number;
  /** Named characters attached to the army */
  characters: Character[];
}

// ── Characters ──

export type Faction = 'free_peoples' | 'shadow';

export interface Character {
  name: string;
  faction: Faction;
  leadership: number;
  level: number;
  isCaptainOfTheWest: boolean;
  specialAbility?: string;
}

// ── Battle Configuration ──

export interface BattleConfig {
  battleType: BattleType;
  attacker: Army;
  defender: Army;
  /** Max siege rounds the attacker is willing to extend (default: 1) */
  maxSiegeRounds: number;
  /** How siege extensions are paid: 'extend' downgrades an elite, 'new_battle' is free */
  siegeContinuation: SiegeContinuation;
}

// ── Combat Round ──

export interface RoundResult {
  round: number;
  attackerHits: number;
  defenderHits: number;
  attackerArmy: Army;
  defenderArmy: Army;
}

// ── Battle Result ──

export type BattleOutcome = 'attacker_wins' | 'defender_wins' | 'draw';

export interface BattleResult {
  outcome: BattleOutcome;
  rounds: RoundResult[];
  finalAttacker: Army;
  finalDefender: Army;
  siegeRoundsUsed: number;
}

// ── Simulation ──

export interface SimulationResult {
  totalRuns: number;
  attackerWins: number;
  defenderWins: number;
  draws: number;
  attackerWinRate: number;
  defenderWinRate: number;
  averageRounds: number;
  /** Distribution of attacker survivors (index = count, value = frequency) */
  attackerSurvivorDist: number[];
  /** Distribution of defender survivors */
  defenderSurvivorDist: number[];
  results: BattleResult[];
}

// ── Simulation Progress ──

export interface SimulationProgress {
  completed: number;
  total: number;
}

// ── Optimizer ──

export interface OptimizerConstraints {
  maxRegulars: number;
  maxElites: number;
  maxLeaders: number;
  maxTotalUnits: number;
  battleType: BattleType;
  defender: Army;
  maxSiegeRounds: number;
}

export interface OptimizerCandidate {
  army: Army;
  winRate: number;
  avgSurvivors: number;
  efficiency: number; // winRate / totalUnits
}

// ── Stronghold Presets ──

export interface StrongholdPreset {
  name: string;
  faction: Faction;
  defaultDefender: Army;
  battleType: BattleType;
}
