import { Army, BattleConfig, OptimizerCandidate, OptimizerConstraints, SiegeContinuation } from './types';
import { runSimulationSync } from './simulation';

const MAX_COMBAT_UNITS_GAME = 10;
const CHUNK_SIZE = 5;

export interface OptimizerProgress {
  completedCandidates: number;
  totalCandidates: number;
}

export interface DualOptimizerResult {
  extend: OptimizerCandidate[];
  newBattle: OptimizerCandidate[];
}

/**
 * Generate all valid army compositions within the given constraints.
 */
export function generateCandidates(constraints: OptimizerConstraints): Army[] {
  const candidates: Army[] = [];

  for (let r = 0; r <= constraints.maxRegulars; r++) {
    for (let e = 0; e <= constraints.maxElites; e++) {
      if (r + e > MAX_COMBAT_UNITS_GAME) continue;
      if (r + e === 0) continue;

      for (let l = 0; l <= constraints.maxLeaders; l++) {
        if (r + e + l > constraints.maxTotalUnits) continue;

        candidates.push({
          regulars: r,
          elites: e,
          leaders: l,
          characters: [],
        });
      }
    }
  }

  return candidates;
}

/**
 * Compute the average number of survivors from a distribution array.
 */
function computeAvgSurvivors(dist: number[], total: number): number {
  if (total === 0) return 0;
  let sum = 0;
  for (let i = 0; i < dist.length; i++) {
    sum += i * dist[i];
  }
  return sum / total;
}

/**
 * Get the total number of combat units (regulars + elites) in an army.
 */
function combatUnits(army: Army): number {
  return army.regulars + army.elites;
}

/**
 * Evaluate a single candidate army against the defender.
 */
function evaluateCandidate(
  army: Army,
  constraints: OptimizerConstraints,
  siegeContinuation: SiegeContinuation,
  runsPerCandidate: number,
): OptimizerCandidate {
  const config: BattleConfig = {
    battleType: constraints.battleType,
    attacker: army,
    defender: constraints.defender,
    maxSiegeRounds: constraints.maxSiegeRounds,
    siegeContinuation,
  };

  const result = runSimulationSync(config, runsPerCandidate);
  const totalUnits = army.regulars + army.elites + army.leaders;

  return {
    army,
    winRate: result.attackerWinRate,
    avgSurvivors: computeAvgSurvivors(result.attackerSurvivorDist, result.totalRuns),
    efficiency: totalUnits > 0 ? result.attackerWinRate / totalUnits : 0,
  };
}

/**
 * Sort candidates: smallest army first (by combat units, then total units),
 * breaking ties by higher win rate.
 */
function sortBySmallest(results: OptimizerCandidate[]): void {
  results.sort((a, b) => {
    const aCombat = combatUnits(a.army);
    const bCombat = combatUnits(b.army);
    if (aCombat !== bCombat) return aCombat - bCombat;

    const aTotal = a.army.regulars + a.army.elites + a.army.leaders;
    const bTotal = b.army.regulars + b.army.elites + b.army.leaders;
    if (aTotal !== bTotal) return aTotal - bTotal;

    return b.winRate - a.winRate;
  });
}

function filterAndSort(
  results: OptimizerCandidate[],
  minWinRate: number,
  limit: number,
): OptimizerCandidate[] {
  const qualifying = results.filter((r) => r.winRate >= minWinRate);
  sortBySmallest(qualifying);
  return qualifying.slice(0, limit);
}

/**
 * Run the optimizer asynchronously. Finds the smallest armies that achieve
 * at least `minWinRate` win rate against the defender.
 */
export async function runOptimizer(
  constraints: OptimizerConstraints,
  siegeContinuation: SiegeContinuation,
  minWinRate: number = 0.6,
  runsPerCandidate: number = 1000,
  onProgress?: (progress: OptimizerProgress) => void,
): Promise<OptimizerCandidate[]> {
  const armies = generateCandidates(constraints);
  const results: OptimizerCandidate[] = [];

  for (let i = 0; i < armies.length; i++) {
    results.push(evaluateCandidate(armies[i], constraints, siegeContinuation, runsPerCandidate));

    onProgress?.({ completedCandidates: i + 1, totalCandidates: armies.length });

    if ((i + 1) % CHUNK_SIZE === 0 && i + 1 < armies.length) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return filterAndSort(results, minWinRate, 10);
}

/**
 * Run the optimizer for both siege modes (extend + new_battle) and return
 * results side by side. For field battles, only 'extend' results are populated.
 */
export async function runOptimizerDual(
  constraints: OptimizerConstraints,
  minWinRate: number = 0.6,
  runsPerCandidate: number = 1000,
  onProgress?: (progress: OptimizerProgress) => void,
): Promise<DualOptimizerResult> {
  const armies = generateCandidates(constraints);
  const totalSteps = constraints.battleType === 'siege' ? armies.length * 2 : armies.length;

  const extendResults: OptimizerCandidate[] = [];
  const newBattleResults: OptimizerCandidate[] = [];

  // Run extend mode
  for (let i = 0; i < armies.length; i++) {
    extendResults.push(evaluateCandidate(armies[i], constraints, 'extend', runsPerCandidate));
    onProgress?.({ completedCandidates: i + 1, totalCandidates: totalSteps });

    if ((i + 1) % CHUNK_SIZE === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  // Run new_battle mode (only for siege)
  if (constraints.battleType === 'siege') {
    for (let i = 0; i < armies.length; i++) {
      newBattleResults.push(evaluateCandidate(armies[i], constraints, 'new_battle', runsPerCandidate));
      onProgress?.({ completedCandidates: armies.length + i + 1, totalCandidates: totalSteps });

      if ((i + 1) % CHUNK_SIZE === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }

  return {
    extend: filterAndSort(extendResults, minWinRate, 10),
    newBattle: filterAndSort(newBattleResults, minWinRate, 10),
  };
}

/**
 * Synchronous version for testing.
 */
export function runOptimizerSync(
  constraints: OptimizerConstraints,
  siegeContinuation: SiegeContinuation = 'extend',
  minWinRate: number = 0.6,
  runsPerCandidate: number = 1000,
): OptimizerCandidate[] {
  const armies = generateCandidates(constraints);
  const results = armies.map((army) => evaluateCandidate(army, constraints, siegeContinuation, runsPerCandidate));

  return filterAndSort(results, minWinRate, 10);
}
