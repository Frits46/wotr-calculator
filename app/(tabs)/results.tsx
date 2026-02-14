import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useBattleStore } from '../../src/store/battleStore';

const ATTACKER_COLOR = '#c0392b';
const DEFENDER_COLOR = '#2980b9';
const DRAW_COLOR = '#6b5f4e';

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function computeStats(dist: number[]) {
  const total = dist.reduce((sum, v) => sum + v, 0);
  if (total === 0) return { total: 0, mean: 0, median: 0 };

  let weightedSum = 0;
  for (let i = 0; i < dist.length; i++) {
    weightedSum += i * dist[i];
  }
  const mean = weightedSum / total;

  let cumulative = 0;
  let median = 0;
  for (let i = 0; i < dist.length; i++) {
    cumulative += dist[i];
    if (cumulative >= total / 2) {
      median = i;
      break;
    }
  }

  return { total, mean, median };
}

function SurvivorChart({ dist, color, label }: { dist: number[]; color: string; label: string }) {
  const { total, mean, median } = computeStats(dist);
  if (total === 0) return null;

  const meanRounded = Math.round(mean);
  const highlightColor = '#c9a84c';
  const medianColor = '#8e44ad';

  const barData = dist
    .map((freq, idx) => {
      const pctValue = (freq / total) * 100;
      const isMean = idx === meanRounded;
      const isMedian = idx === median;
      let barColor = color;
      if (isMean && isMedian) barColor = highlightColor;
      else if (isMean) barColor = highlightColor;
      else if (isMedian) barColor = medianColor;

      return {
        value: pctValue,
        label: String(idx),
        frontColor: barColor,
        topLabelComponent: () => (
          <Text style={{ color: '#9a8e7b', fontSize: 9, textAlign: 'center', marginBottom: 2 }}>
            {pctValue >= 1 ? `${pctValue.toFixed(0)}%` : pctValue > 0 ? '<1%' : ''}
          </Text>
        ),
      };
    })
    .filter((d) => d.value > 0);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{label} Survivors</Text>
      <View style={styles.statsRow}>
        <View style={styles.statsPill}>
          <View style={[styles.statsIndicator, { backgroundColor: highlightColor }]} />
          <Text style={styles.statsText}>Mean: {mean.toFixed(1)}</Text>
        </View>
        <View style={styles.statsPill}>
          <View style={[styles.statsIndicator, { backgroundColor: meanRounded === median ? highlightColor : medianColor }]} />
          <Text style={styles.statsText}>Median: {median}</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={barData}
          barWidth={28}
          spacing={12}
          height={160}
          noOfSections={4}
          yAxisThickness={1}
          xAxisThickness={1}
          yAxisColor="#3d2e1f"
          xAxisColor="#3d2e1f"
          yAxisTextStyle={{ color: '#8a7e6b', fontSize: 11 }}
          xAxisLabelTextStyle={{ color: '#8a7e6b', fontSize: 11 }}
          yAxisLabelSuffix="%"
          rulesColor="#2d2318"
          backgroundColor="transparent"
          isAnimated
          animationDuration={600}
        />
      </ScrollView>
    </View>
  );
}

export default function ResultsScreen() {
  const result = useBattleStore((s) => s.simulationResult);
  const router = useRouter();

  if (!result) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.title}>Simulation Results</Text>
        <Text style={styles.subtitle}>Run a battle to see results</Text>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => router.push('/(tabs)/')}
          activeOpacity={0.7}
        >
          <Text style={styles.goBackText}>Go to Battle</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { totalRuns, attackerWins, defenderWins, draws, attackerWinRate, defenderWinRate, averageRounds, attackerSurvivorDist, defenderSurvivorDist } = result;
  const drawRate = draws / totalRuns;

  const pieData = [
    { value: attackerWins, color: ATTACKER_COLOR },
    { value: defenderWins, color: DEFENDER_COLOR },
    ...(draws > 0 ? [{ value: draws, color: DRAW_COLOR }] : []),
  ];

  const legendItems = [
    { label: 'Attacker', color: ATTACKER_COLOR, value: pct(attackerWinRate) },
    { label: 'Defender', color: DEFENDER_COLOR, value: pct(defenderWinRate) },
    { label: 'Draws', color: DRAW_COLOR, value: pct(drawRate) },
  ];

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Simulation Results</Text>
        <Text style={styles.subtitle}>{totalRuns.toLocaleString()} battles simulated</Text>
      </View>

      {/* Win Rate Pie Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Win Rate</Text>
        <View style={styles.pieContainer}>
          <PieChart
            data={pieData}
            donut
            radius={80}
            innerRadius={50}
            innerCircleColor="#252015"
            isAnimated
            animationDuration={600}
            centerLabelComponent={() => (
              <View style={styles.pieCenter}>
                <Text style={styles.pieCenterValue}>{pct(attackerWinRate)}</Text>
                <Text style={styles.pieCenterLabel}>Attacker</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.legend}>
          {legendItems.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
              <Text style={styles.legendValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Key Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Key Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: ATTACKER_COLOR }]}>{pct(attackerWinRate)}</Text>
            <Text style={styles.statLabel}>Attacker Wins</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: DEFENDER_COLOR }]}>{pct(defenderWinRate)}</Text>
            <Text style={styles.statLabel}>Defender Wins</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{averageRounds.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Rounds</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{pct(drawRate)}</Text>
            <Text style={styles.statLabel}>Draws</Text>
          </View>
        </View>
      </View>

      {/* Survivor Distributions */}
      <SurvivorChart dist={attackerSurvivorDist} color={ATTACKER_COLOR} label="Attacker" />
      <SurvivorChart dist={defenderSurvivorDist} color={DEFENDER_COLOR} label="Defender" />
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
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#1a1410',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
  goBackButton: {
    marginTop: 20,
    backgroundColor: '#c9a84c',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  goBackText: {
    color: '#252015',
    fontSize: 15,
    fontWeight: 'bold',
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
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3d2e1f',
  },
  pieContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pieCenter: {
    alignItems: 'center',
  },
  pieCenterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c9a84c',
  },
  pieCenterLabel: {
    fontSize: 11,
    color: '#8a7e6b',
  },
  legend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 14,
    color: '#d4c5a9',
    flex: 1,
  },
  legendValue: {
    fontSize: 14,
    color: '#c9a84c',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a1410',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c9a84c',
  },
  statLabel: {
    fontSize: 12,
    color: '#8a7e6b',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1410',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  statsIndicator: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  statsText: {
    fontSize: 13,
    color: '#d4c5a9',
    fontWeight: '600',
  },
});
