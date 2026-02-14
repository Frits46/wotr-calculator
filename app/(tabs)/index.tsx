import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArmyEditor } from '../../src/components/ArmyEditor';
import { BattleTypeToggle } from '../../src/components/BattleTypeToggle';
import { SimulateButton } from '../../src/components/SimulateButton';

export default function BattleScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Battle Calculator</Text>
          <Text style={styles.subtitle}>Configure your armies</Text>
        </View>

        <BattleTypeToggle />
        <ArmyEditor side="attacker" label="Attacker" faction="shadow" />
        <ArmyEditor side="defender" label="Defender" faction="free_peoples" />
        <SimulateButton />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1410',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
});
