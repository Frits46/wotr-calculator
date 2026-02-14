import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useBattleStore } from '../store/battleStore';
import { useSimulation } from '../hooks/useSimulation';

export function SimulateButton() {
  const attacker = useBattleStore((s) => s.attacker);
  const defender = useBattleStore((s) => s.defender);
  const isSimulating = useBattleStore((s) => s.isSimulating);
  const progress = useBattleStore((s) => s.simulationProgress);

  const { runSim } = useSimulation();

  const attackerUnits = attacker.regulars + attacker.elites;
  const defenderUnits = defender.regulars + defender.elites;
  const canSimulate = attackerUnits > 0 && defenderUnits > 0 && !isSimulating;

  const progressPct = progress
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <View style={styles.container}>
      {!canSimulate && !isSimulating && (
        <Text style={styles.hint}>Both armies need at least one combat unit</Text>
      )}
      <TouchableOpacity
        style={[styles.button, !canSimulate && styles.buttonDisabled]}
        onPress={canSimulate ? runSim : undefined}
        activeOpacity={canSimulate ? 0.7 : 1}
      >
        <Text style={styles.buttonText}>
          {isSimulating
            ? `Simulating... ${progressPct}%`
            : 'Run Simulation'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    marginBottom: 24,
  },
  hint: {
    fontSize: 13,
    color: '#8a7e6b',
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#c9a84c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#252015',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
