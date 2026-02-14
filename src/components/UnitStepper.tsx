import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface UnitStepperProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  minValue?: number;
  maxValue?: number;
}

export function UnitStepper({
  label,
  value,
  onIncrement,
  onDecrement,
  minValue = 0,
  maxValue,
}: UnitStepperProps) {
  const isAtMin = value <= minValue;
  const isAtMax = maxValue !== undefined && value >= maxValue;

  const handleDecrement = () => {
    if (!isAtMin) {
      onDecrement();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleIncrement = () => {
    if (!isAtMax) {
      onIncrement();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isAtMin && styles.buttonDisabled]}
          onPress={handleDecrement}
          activeOpacity={isAtMin ? 1 : 0.6}
        >
          <Text style={[styles.buttonText, isAtMin && styles.buttonTextDisabled]}>
            −
          </Text>
        </TouchableOpacity>
        <Text style={styles.value}>{value}</Text>
        <TouchableOpacity
          style={[styles.button, isAtMax && styles.buttonDisabled]}
          onPress={handleIncrement}
          activeOpacity={isAtMax ? 1 : 0.6}
        >
          <Text style={[styles.buttonText, isAtMax && styles.buttonTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  label: {
    fontSize: 15,
    color: '#d4c5a9',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3d2e1f',
    backgroundColor: '#1a1410',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    borderColor: '#2d2318',
  },
  buttonText: {
    fontSize: 18,
    color: '#c9a84c',
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#5a4f3e',
  },
  value: {
    fontSize: 18,
    color: '#c9a84c',
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
  },
});
