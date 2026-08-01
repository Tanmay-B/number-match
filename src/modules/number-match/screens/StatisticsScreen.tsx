import { ScrollView, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { PrimaryButton } from '@modules/number-match/components/PrimaryButton'
import { StatPill } from '@modules/number-match/components/ScreenHeader'
import { useAppTheme } from '@global/hooks/useAppTheme'
import { useStatsStore } from '@store/stats.store'
import { AppRoutes, AppStackParams } from '@router/routes'

type Props = NativeStackScreenProps<AppStackParams, AppRoutes.STATISTICS>

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

export function StatisticsScreen({ navigation }: Props) {
  const { theme } = useAppTheme()
  const stats = useStatsStore()

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Statistics</Text>

        <StatPill label="Games Played" theme={theme} value={stats.gamesPlayed} />
        <StatPill label="Games Won" theme={theme} value={stats.gamesWon} />
        <StatPill label="Best Score" theme={theme} value={stats.bestScore} />
        <StatPill
          label="Longest Session"
          theme={theme}
          value={formatDuration(stats.longestSessionMs)}
        />
        <StatPill label="Moves Made" theme={theme} value={stats.movesMade} />
        <StatPill label="Hints Used" theme={theme} value={stats.hintsUsed} />
        <StatPill label="Ads Watched" theme={theme} value={stats.adsWatched} />
        <StatPill label="Current Streak" theme={theme} value={stats.currentStreak} />

        <PrimaryButton
          label="Back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          theme={theme}
          variant="secondary"
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },
  backButton: {
    marginTop: 8,
  },
})
