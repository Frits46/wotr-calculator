import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { STRONGHOLD_PRESETS } from '../../src/engine/constants';
import { Army, StrongholdPreset } from '../../src/engine/types';
import { useBattleStore } from '../../src/store/battleStore';

function armySummary(army: Army): string {
  const parts: string[] = [];
  if (army.regulars > 0) parts.push(`${army.regulars}R`);
  if (army.elites > 0) parts.push(`${army.elites}E`);
  if (army.leaders > 0) parts.push(`${army.leaders}L`);
  return parts.join(' ') || 'Empty';
}

const freePresets = STRONGHOLD_PRESETS.filter((p) => p.faction === 'free_peoples');
const shadowPresets = STRONGHOLD_PRESETS.filter((p) => p.faction === 'shadow');

const sections = [
  { title: 'Free Peoples Strongholds', data: freePresets },
  { title: 'Shadow Strongholds', data: shadowPresets },
];

export default function PresetsScreen() {
  const router = useRouter();
  const setArmy = useBattleStore((s) => s.setArmy);
  const setBattleType = useBattleStore((s) => s.setBattleType);

  const handlePress = (preset: StrongholdPreset) => {
    setArmy('defender', preset.defaultDefender);
    setBattleType(preset.battleType);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/');
  };

  return (
    <SectionList
      style={styles.list}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={(item) => item.name}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Stronghold Presets</Text>
          <Text style={styles.subtitle}>Tap to load as defender</Text>
        </View>
      }
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handlePress(item)} activeOpacity={0.6}>
          <Text style={styles.presetName}>{item.name}</Text>
          <Text style={styles.presetSummary}>{armySummary(item.defaultDefender)}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#1a1410',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c9a84c',
  },
  subtitle: {
    fontSize: 16,
    color: '#8a7e6b',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#c9a84c',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#252015',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c9a84c',
  },
  presetSummary: {
    fontSize: 13,
    color: '#8a7e6b',
    fontFamily: 'monospace',
  },
});
