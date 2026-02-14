import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Faction } from '../engine/types';
import { useBattleStore } from '../store/battleStore';
import { CharacterPicker } from './CharacterPicker';
import { UnitStepper } from './UnitStepper';

const MAX_COMBAT_UNITS = 10;
const MAX_SIEGE_DEFENDER_UNITS = 5;

interface ArmyEditorProps {
  side: 'attacker' | 'defender';
  label: string;
  faction: Faction;
}

export function ArmyEditor({ side, label, faction }: ArmyEditorProps) {
  const army = useBattleStore((s) => s[side]);
  const battleType = useBattleStore((s) => s.battleType);
  const incrementUnit = useBattleStore((s) => s.incrementUnit);
  const decrementUnit = useBattleStore((s) => s.decrementUnit);

  const isSiegeDefender = battleType === 'siege' && side === 'defender';
  const unitCap = isSiegeDefender ? MAX_SIEGE_DEFENDER_UNITS : MAX_COMBAT_UNITS;

  return (
    <View style={styles.card}>
      <Text style={styles.header}>{label}</Text>
      <UnitStepper
        label="Regulars"
        value={army.regulars}
        onIncrement={() => incrementUnit(side, 'regulars')}
        onDecrement={() => decrementUnit(side, 'regulars')}
        maxValue={unitCap - army.elites}
      />
      <UnitStepper
        label="Elites"
        value={army.elites}
        onIncrement={() => incrementUnit(side, 'elites')}
        onDecrement={() => decrementUnit(side, 'elites')}
        maxValue={unitCap - army.regulars}
      />
      <UnitStepper
        label="Leaders"
        value={army.leaders}
        onIncrement={() => incrementUnit(side, 'leaders')}
        onDecrement={() => decrementUnit(side, 'leaders')}
      />
      <CharacterPicker side={side} faction={faction} />
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
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#3d2e1f',
  },
});
