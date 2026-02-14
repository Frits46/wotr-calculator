import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CHARACTERS } from '../engine/constants';
import { Character, Faction } from '../engine/types';
import { useBattleStore } from '../store/battleStore';

interface CharacterPickerProps {
  side: 'attacker' | 'defender';
  faction: Faction;
}

export function CharacterPicker({ side, faction }: CharacterPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const characters = useBattleStore((s) => s[side].characters);
  const addCharacter = useBattleStore((s) => s.addCharacter);
  const removeCharacter = useBattleStore((s) => s.removeCharacter);

  const availableCharacters = CHARACTERS.filter((c) => c.faction === faction);

  const isSelected = (name: string) => characters.some((c) => c.name === name);

  const handleToggle = (char: Character) => {
    if (isSelected(char.name)) {
      removeCharacter(side, char.name);
    } else {
      addCharacter(side, char);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.row} onPress={() => setModalVisible(true)} activeOpacity={0.6}>
        <Text style={styles.label}>Characters</Text>
        <View style={styles.selectedRow}>
          <Text style={styles.selectedText}>
            {characters.length === 0 ? 'None' : `${characters.length} selected`}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>

      {characters.length > 0 && (
        <View style={styles.chipContainer}>
          {characters.map((c) => (
            <TouchableOpacity
              key={c.name}
              style={styles.chip}
              onPress={() => removeCharacter(side, c.name)}
              activeOpacity={0.6}
            >
              <Text style={styles.chipText}>{c.name}</Text>
              <Text style={styles.chipRemove}>✕</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.card} onStartShouldSetResponder={() => true}>
            <Text style={styles.cardTitle}>Select Characters</Text>

            <FlatList
              data={availableCharacters}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => {
                const selected = isSelected(item.name);
                return (
                  <TouchableOpacity
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => handleToggle(item)}
                  >
                    <View style={styles.optionContent}>
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                        {item.name}
                      </Text>
                      <View style={styles.badges}>
                        <Text style={styles.badge}>L{item.leadership}</Text>
                        {item.isCaptainOfTheWest && (
                          <Text style={styles.badge}>CotW</Text>
                        )}
                        {selected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </View>
                    {item.specialAbility && (
                      <Text style={styles.abilityText}>{item.specialAbility}</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 15,
    color: '#c9a84c',
  },
  chevron: {
    fontSize: 20,
    color: '#8a7e6b',
    marginLeft: 6,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#352c1e',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    color: '#c9a84c',
  },
  chipRemove: {
    fontSize: 12,
    color: '#8a7e6b',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#252015',
    borderRadius: 12,
    padding: 16,
    maxHeight: '70%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c9a84c',
    marginBottom: 12,
    textAlign: 'center',
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3d2e1f',
  },
  optionSelected: {
    backgroundColor: '#352c1e',
    borderRadius: 8,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#d4c5a9',
  },
  optionTextSelected: {
    color: '#c9a84c',
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    fontSize: 12,
    color: '#8a7e6b',
    backgroundColor: '#1a1410',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  checkmark: {
    fontSize: 14,
    color: '#c9a84c',
    fontWeight: 'bold',
  },
  abilityText: {
    fontSize: 12,
    color: '#6b5f4e',
    marginTop: 4,
    fontStyle: 'italic',
  },
  doneButton: {
    marginTop: 12,
    backgroundColor: '#c9a84c',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  doneText: {
    color: '#252015',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
