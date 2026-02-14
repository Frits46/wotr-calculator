import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BattleType, SiegeContinuation } from '../engine/types';
import { useBattleStore } from '../store/battleStore';
import { UnitStepper } from './UnitStepper';

export function BattleTypeToggle() {
  const battleType = useBattleStore((s) => s.battleType);
  const setBattleType = useBattleStore((s) => s.setBattleType);
  const maxSiegeRounds = useBattleStore((s) => s.maxSiegeRounds);
  const setMaxSiegeRounds = useBattleStore((s) => s.setMaxSiegeRounds);
  const siegeContinuation = useBattleStore((s) => s.siegeContinuation);
  const setSiegeContinuation = useBattleStore((s) => s.setSiegeContinuation);

  const battleOptions: { type: BattleType; label: string }[] = [
    { type: 'field', label: 'Field' },
    { type: 'siege', label: 'Siege' },
  ];

  const continuationOptions: { type: SiegeContinuation; label: string; hint: string }[] = [
    { type: 'extend', label: 'Extend', hint: 'Downgrade 1 elite/round' },
    { type: 'new_battle', label: 'New Battle', hint: 'No unit cost' },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.header}>Battle Type</Text>
      <View style={styles.toggle}>
        {battleOptions.map(({ type, label }) => {
          const isActive = battleType === type;
          return (
            <TouchableOpacity
              key={type}
              style={[styles.option, isActive && styles.optionActive]}
              onPress={() => setBattleType(type)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {battleType === 'siege' && (
        <View style={styles.siegeRounds}>
          <UnitStepper
            label="Max Siege Rounds"
            value={maxSiegeRounds}
            onIncrement={() => setMaxSiegeRounds(maxSiegeRounds + 1)}
            onDecrement={() => setMaxSiegeRounds(maxSiegeRounds - 1)}
            minValue={1}
          />
          <Text style={styles.continuationLabel}>Siege Mode</Text>
          <View style={styles.toggle}>
            {continuationOptions.map(({ type, label }) => {
              const isActive = siegeContinuation === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.option, isActive && styles.optionActive]}
                  onPress={() => setSiegeContinuation(type)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.continuationHint}>
            {siegeContinuation === 'extend'
              ? 'Each extra round costs 1 elite (downgraded to regular)'
              : 'Each round is a new battle (costs an action die, no unit cost)'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#252015',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    fontSize: 13,
    fontWeight: '700',
    color: '#c9a84c',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingBottom: 10,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3d2e1f',
  },
  toggle: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3d2e1f',
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: '#c9a84c',
    borderColor: '#c9a84c',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8a7e6b',
  },
  optionTextActive: {
    color: '#252015',
  },
  siegeRounds: {
    marginTop: 8,
  },
  continuationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8a7e6b',
    marginTop: 12,
    marginBottom: 6,
  },
  continuationHint: {
    fontSize: 11,
    color: '#6b5f4e',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
