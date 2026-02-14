import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { runSimulation } from '../engine/simulation';
import { useBattleStore } from '../store/battleStore';

export function useSimulation() {
  const router = useRouter();
  const getBattleConfig = useBattleStore((s) => s.getBattleConfig);
  const setIsSimulating = useBattleStore((s) => s.setIsSimulating);
  const setSimulationProgress = useBattleStore((s) => s.setSimulationProgress);
  const setSimulationResult = useBattleStore((s) => s.setSimulationResult);

  const runSim = useCallback(async () => {
    const config = getBattleConfig();
    setIsSimulating(true);
    setSimulationProgress(null);
    setSimulationResult(null);

    try {
      const result = await runSimulation(config, 10000, (progress) => {
        setSimulationProgress(progress);
      });
      setSimulationResult(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/(tabs)/results');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSimulating(false);
      setSimulationProgress(null);
    }
  }, [getBattleConfig, setIsSimulating, setSimulationProgress, setSimulationResult, router]);

  return { runSim };
}
