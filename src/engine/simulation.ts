import { BattleConfig, BattleResult, SimulationProgress, SimulationResult } from './types';
import { runBattle } from './battle';
import { getTotalUnits } from './hitAllocation';

const DEFAULT_RUNS = 10000;
const CHUNK_SIZE = 1000;

/**
 * Run a Monte Carlo simulation of a battle configuration.
 * Processes in chunks of CHUNK_SIZE, yielding to the event loop between chunks.
 *
 * @param config - The battle configuration to simulate
 * @param runs - Number of simulation runs (default 10,000)
 * @param onProgress - Optional callback for progress updates
 * @returns Promise resolving to the aggregated simulation results
 */
export async function runSimulation(
  config: BattleConfig,
  runs: number = DEFAULT_RUNS,
  onProgress?: (progress: SimulationProgress) => void,
): Promise<SimulationResult> {
  const results: BattleResult[] = [];
  let completed = 0;

  while (completed < runs) {
    const chunkEnd = Math.min(completed + CHUNK_SIZE, runs);

    for (let i = completed; i < chunkEnd; i++) {
      results.push(runBattle(config));
    }

    completed = chunkEnd;
    onProgress?.({ completed, total: runs });

    // Yield to UI thread between chunks
    if (completed < runs) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return aggregateResults(results, runs);
}

/**
 * Synchronous version for testing (no chunking).
 */
export function runSimulationSync(
  config: BattleConfig,
  runs: number = DEFAULT_RUNS,
): SimulationResult {
  const results: BattleResult[] = [];

  for (let i = 0; i < runs; i++) {
    results.push(runBattle(config));
  }

  return aggregateResults(results, runs);
}

/**
 * Aggregate individual battle results into summary statistics.
 */
function aggregateResults(results: BattleResult[], totalRuns: number): SimulationResult {
  let attackerWins = 0;
  let defenderWins = 0;
  let draws = 0;
  let totalRounds = 0;

  // Track survivor distributions (index = number of survivors, value = count)
  const maxUnits = 20;
  const attackerSurvivorDist = new Array(maxUnits + 1).fill(0);
  const defenderSurvivorDist = new Array(maxUnits + 1).fill(0);

  for (const result of results) {
    switch (result.outcome) {
      case 'attacker_wins':
        attackerWins++;
        break;
      case 'defender_wins':
        defenderWins++;
        break;
      case 'draw':
        draws++;
        break;
    }

    totalRounds += result.rounds.length;

    const attackerSurvivors = getTotalUnits(result.finalAttacker);
    const defenderSurvivors = getTotalUnits(result.finalDefender);

    if (attackerSurvivors <= maxUnits) {
      attackerSurvivorDist[attackerSurvivors]++;
    }
    if (defenderSurvivors <= maxUnits) {
      defenderSurvivorDist[defenderSurvivors]++;
    }
  }

  return {
    totalRuns,
    attackerWins,
    defenderWins,
    draws,
    attackerWinRate: attackerWins / totalRuns,
    defenderWinRate: defenderWins / totalRuns,
    averageRounds: totalRounds / totalRuns,
    attackerSurvivorDist,
    defenderSurvivorDist,
    results,
  };
}
