import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Army, BattleType, OptimizerCandidate, OptimizerConstraints } from '../../src/engine/types';
import { runOptimizerDual, DualOptimizerResult, OptimizerProgress } from '../../src/engine/optimizer';
import { useBattleStore } from '../../src/store/battleStore';
import { UnitStepper } from '../../src/components/UnitStepper';

function armySummary(army: Army): string {
  const parts: string[] = [];
  if (army.regulars > 0) parts.push(`${army.regulars}R`);
  if (army.elites > 0) parts.push(`${army.elites}E`);
  if (army.leaders > 0) parts.push(`${army.leaders}L`);
  return parts.join(' ') || 'Empty';
}

function BattleTypeSelector({
  value,
  onChange,
}: {
  value: BattleType;
  onChange: (t: BattleType) => void;
}) {
  const options: { type: BattleType; label: string }[] = [
    { type: 'field', label: 'Field' },
    { type: 'siege', label: 'Siege' },
  ];

  return (
    <View style={styles.toggle}>
      {options.map(({ type, label }) => {
        const isActive = value === type;
        return (
          <TouchableOpacity
            key={type}
            style={[styles.toggleOption, isActive && styles.toggleOptionActive]}
            onPress={() => onChange(type)}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, isActive && styles.toggleTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ResultList({
  title,
  subtitle,
  candidates,
  minWinPct,
  onPress,
}: {
  title: string;
  subtitle: string;
  candidates: OptimizerCandidate[];
  minWinPct: number;
  onPress: (c: OptimizerCandidate) => void;
}) {
  if (candidates.length === 0) {
    return (
      <View style={styles.resultSection}>
        <Text style={styles.resultSectionTitle}>{title}</Text>
        <Text style={styles.resultSectionSubtitle}>{subtitle}</Text>
        <Text style={styles.noResultsText}>
          No army achieves {'\u2265'}{minWinPct}% win rate
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.resultSection}>
      <Text style={styles.resultSectionTitle}>{title}</Text>
      <Text style={styles.resultSectionSubtitle}>{subtitle}</Text>
      {candidates.slice(0, 3).map((candidate, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.resultCard}
          onPress={() => onPress(candidate)}
          activeOpacity={0.6}
        >
          <View style={styles.resultHeader}>
            <Text style={styles.resultRank}>#{idx + 1}</Text>
            <Text style={styles.resultArmy}>{armySummary(candidate.army)}</Text>
            <Text style={styles.resultWinRate}>{(candidate.winRate * 100).toFixed(1)}%</Text>
          </View>
          <View style={styles.resultDetails}>
            <Text style={styles.resultDetail}>
              Avg Survivors: {candidate.avgSurvivors.toFixed(1)}
            </Text>
            <Text style={styles.resultDetail}>
              Efficiency: {(candidate.efficiency * 100).toFixed(1)}%/unit
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function OptimizerScreen() {
  const router = useRouter();
  const setArmy = useBattleStore((s) => s.setArmy);
  const storeBattleType = useBattleStore((s) => s.setBattleType);
  const storeSiegeContinuation = useBattleStore((s) => s.setSiegeContinuation);
  const storeDefender = useBattleStore((s) => s.defender);

  // Constraints
  const [maxRegulars, setMaxRegulars] = useState(5);
  const [maxElites, setMaxElites] = useState(3);
  const [maxLeaders, setMaxLeaders] = useState(2);
  const [maxTotalUnits, setMaxTotalUnits] = useState(8);

  // Battle setup
  const [battleType, setBattleType] = useState<BattleType>('field');
  const [maxSiegeRounds, setMaxSiegeRounds] = useState(1);

  // Defender
  const [defRegulars, setDefRegulars] = useState(2);
  const [defElites, setDefElites] = useState(0);
  const [defLeaders, setDefLeaders] = useState(0);

  // Threshold
  const [minWinPct, setMinWinPct] = useState(60);

  // Optimizer state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState<OptimizerProgress | null>(null);
  const [dualResults, setDualResults] = useState<DualOptimizerResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const defenderUnitCap = battleType === 'siege' ? 5 : 10;
  const hasDefender = defRegulars + defElites > 0;
  const isSiege = battleType === 'siege';

  const handleUseCurrentDefender = () => {
    setDefRegulars(storeDefender.regulars);
    setDefElites(storeDefender.elites);
    setDefLeaders(storeDefender.leaders);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setProgress(null);
    setDualResults(null);
    setHasSearched(false);

    const defender: Army = {
      regulars: defRegulars,
      elites: defElites,
      leaders: defLeaders,
      characters: [],
    };

    const constraints: OptimizerConstraints = {
      maxRegulars,
      maxElites,
      maxLeaders,
      maxTotalUnits,
      battleType,
      defender,
      maxSiegeRounds,
    };

    try {
      const results = await runOptimizerDual(constraints, minWinPct / 100, 1000, (p) => {
        setProgress(p);
      });
      setDualResults(results);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsOptimizing(false);
      setProgress(null);
      setHasSearched(true);
    }
  };

  const handleResultPress = (candidate: OptimizerCandidate, continuation: 'extend' | 'new_battle') => {
    setArmy('attacker', candidate.army);
    const defender: Army = {
      regulars: defRegulars,
      elites: defElites,
      leaders: defLeaders,
      characters: [],
    };
    setArmy('defender', defender);
    storeBattleType(battleType);
    if (isSiege) {
      storeSiegeContinuation(continuation);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/');
  };

  const hasResults = dualResults && (dualResults.extend.length > 0 || dualResults.newBattle.length > 0);
  const noResults = hasSearched && !hasResults;

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Force Optimizer</Text>
        <Text style={styles.subtitle}>Find the smallest army that wins</Text>
      </View>

      {/* Constraints */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Constraints</Text>
        <UnitStepper
          label="Max Regulars"
          value={maxRegulars}
          onIncrement={() => setMaxRegulars((v) => v + 1)}
          onDecrement={() => setMaxRegulars((v) => v - 1)}
          maxValue={10}
        />
        <UnitStepper
          label="Max Elites"
          value={maxElites}
          onIncrement={() => setMaxElites((v) => v + 1)}
          onDecrement={() => setMaxElites((v) => v - 1)}
          maxValue={10}
        />
        <UnitStepper
          label="Max Leaders"
          value={maxLeaders}
          onIncrement={() => setMaxLeaders((v) => v + 1)}
          onDecrement={() => setMaxLeaders((v) => v - 1)}
          maxValue={5}
        />
        <UnitStepper
          label="Max Total Units"
          value={maxTotalUnits}
          onIncrement={() => setMaxTotalUnits((v) => v + 1)}
          onDecrement={() => setMaxTotalUnits((v) => v - 1)}
          minValue={1}
          maxValue={15}
        />
      </View>

      {/* Battle Setup */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Battle Setup</Text>
        <BattleTypeSelector value={battleType} onChange={setBattleType} />
        {isSiege && (
          <UnitStepper
            label="Max Siege Rounds"
            value={maxSiegeRounds}
            onIncrement={() => setMaxSiegeRounds((v) => v + 1)}
            onDecrement={() => setMaxSiegeRounds((v) => v - 1)}
            minValue={1}
            maxValue={5}
          />
        )}
        <UnitStepper
          label={`Min Win Rate: ${minWinPct}%`}
          value={minWinPct}
          onIncrement={() => setMinWinPct((v) => v + 10)}
          onDecrement={() => setMinWinPct((v) => v - 10)}
          minValue={10}
          maxValue={90}
        />
      </View>

      {/* Defender */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Defender</Text>
        <UnitStepper
          label="Regulars"
          value={defRegulars}
          onIncrement={() => setDefRegulars((v) => v + 1)}
          onDecrement={() => setDefRegulars((v) => v - 1)}
          maxValue={defenderUnitCap - defElites}
        />
        <UnitStepper
          label="Elites"
          value={defElites}
          onIncrement={() => setDefElites((v) => v + 1)}
          onDecrement={() => setDefElites((v) => v - 1)}
          maxValue={defenderUnitCap - defRegulars}
        />
        <UnitStepper
          label="Leaders"
          value={defLeaders}
          onIncrement={() => setDefLeaders((v) => v + 1)}
          onDecrement={() => setDefLeaders((v) => v - 1)}
          maxValue={5}
        />
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleUseCurrentDefender}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Use Current Defender</Text>
        </TouchableOpacity>
      </View>

      {/* Optimize Button */}
      <TouchableOpacity
        style={[styles.optimizeButton, (!hasDefender || isOptimizing) && styles.buttonDisabled]}
        onPress={handleOptimize}
        activeOpacity={0.7}
        disabled={!hasDefender || isOptimizing}
      >
        <Text style={styles.optimizeButtonText}>
          {isOptimizing && progress
            ? `Optimizing... ${progress.completedCandidates}/${progress.totalCandidates}`
            : isOptimizing
              ? 'Optimizing...'
              : 'Optimize'}
        </Text>
      </TouchableOpacity>

      {/* Results */}
      {!isOptimizing && dualResults && hasResults && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Smallest Armies ({'\u2265'}{minWinPct}% Win Rate)</Text>

          {isSiege ? (
            <>
              <ResultList
                title="Extend"
                subtitle="Downgrade 1 elite per extra round"
                candidates={dualResults.extend}
                minWinPct={minWinPct}
                onPress={(c) => handleResultPress(c, 'extend')}
              />
              <View style={styles.modeDivider} />
              <ResultList
                title="New Battle"
                subtitle="No unit cost per round"
                candidates={dualResults.newBattle}
                minWinPct={minWinPct}
                onPress={(c) => handleResultPress(c, 'new_battle')}
              />
            </>
          ) : (
            <>
              {dualResults.extend.slice(0, 5).map((candidate, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.resultCard}
                  onPress={() => handleResultPress(candidate, 'extend')}
                  activeOpacity={0.6}
                >
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultRank}>#{idx + 1}</Text>
                    <Text style={styles.resultArmy}>{armySummary(candidate.army)}</Text>
                    <Text style={styles.resultWinRate}>{(candidate.winRate * 100).toFixed(1)}%</Text>
                  </View>
                  <View style={styles.resultDetails}>
                    <Text style={styles.resultDetail}>
                      Avg Survivors: {candidate.avgSurvivors.toFixed(1)}
                    </Text>
                    <Text style={styles.resultDetail}>
                      Efficiency: {(candidate.efficiency * 100).toFixed(1)}%/unit
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
          <Text style={styles.resultHint}>Tap a result to load as attacker</Text>
        </View>
      )}
      {!isOptimizing && noResults && (
        <View style={styles.card}>
          <Text style={styles.noResultsText}>
            No army composition achieves {'\u2265'}{minWinPct}% win rate within the given constraints.
            Try lowering the threshold or increasing available units.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
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
  card: {
    backgroundColor: '#252015',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
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
  toggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3d2e1f',
    alignItems: 'center',
  },
  toggleOptionActive: {
    backgroundColor: '#c9a84c',
    borderColor: '#c9a84c',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8a7e6b',
  },
  toggleTextActive: {
    color: '#252015',
  },
  secondaryButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#c9a84c',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#c9a84c',
    fontSize: 14,
    fontWeight: '600',
  },
  optimizeButton: {
    backgroundColor: '#c9a84c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  optimizeButtonText: {
    color: '#252015',
    fontSize: 17,
    fontWeight: 'bold',
  },
  resultSection: {
    marginTop: 8,
  },
  resultSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#c9a84c',
    marginBottom: 2,
  },
  resultSectionSubtitle: {
    fontSize: 11,
    color: '#6b5f4e',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  modeDivider: {
    height: 1,
    backgroundColor: '#3d2e1f',
    marginVertical: 12,
  },
  resultCard: {
    backgroundColor: '#1a1410',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8a7e6b',
    width: 24,
  },
  resultArmy: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c9a84c',
    flex: 1,
    fontFamily: 'monospace',
  },
  resultWinRate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingLeft: 32,
  },
  resultDetail: {
    fontSize: 12,
    color: '#8a7e6b',
  },
  resultHint: {
    fontSize: 12,
    color: '#5a4f3e',
    textAlign: 'center',
    marginTop: 12,
  },
  noResultsText: {
    fontSize: 14,
    color: '#8a7e6b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
