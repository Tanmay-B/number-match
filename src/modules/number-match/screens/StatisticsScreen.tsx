import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { BackHeader } from '@modules/number-match/components/BackHeader'
import { BottomNav } from '@modules/number-match/components/BottomNav'
import { ConfettiDots } from '@modules/number-match/components/ConfettiDots'
import { Icon } from '@modules/number-match/components/Icon'
import { ProgressRing } from '@modules/number-match/components/ProgressRing'
import { Sparkline } from '@modules/number-match/components/Sparkline'
import type { AppTheme } from '@modules/number-match/constants/palette'
import {
  RADIUS,
  SPACING,
  TYPE,
  elevation,
} from '@modules/number-match/constants/tokens'
import { useAppTheme } from '@global/hooks/useAppTheme'
import { useStatsStore } from '@store/stats.store'
import { AppRoutes, AppStackParams } from '@router/routes'

type Props = NativeStackScreenProps<AppStackParams, AppRoutes.STATISTICS>

const SCREEN_PADDING = SPACING.xl

function formatDuration(ms: number): string {
  if (ms <= 0) {
    return '—'
  }

  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
}

function DetailRow({
  label,
  value,
  theme,
  last = false,
}: {
  label: string
  value: string | number
  theme: AppTheme
  last?: boolean
}) {
  return (
    <View
      style={[
        styles.detailRow,
        { borderColor: theme.border },
        last && styles.detailRowLast,
      ]}>
      <Text style={[styles.detailLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.text }]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
    </View>
  )
}

export function StatisticsScreen({ navigation }: Props) {
  const { theme } = useAppTheme()
  const stats = useStatsStore()

  const winRate =
    stats.gamesPlayed > 0 ? stats.gamesWon / stats.gamesPlayed : 0
  const sparklineWidth =
    Dimensions.get('window').width - SCREEN_PADDING * 2 - SPACING.lg * 2

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ConfettiDots opacity={0.6} theme={theme} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <BackHeader
          onBack={() => navigation.goBack()}
          theme={theme}
          title="Statistics"
        />

        <View
          style={[
            styles.hero,
            elevation(1),
            { backgroundColor: theme.statBg, borderColor: theme.border },
          ]}>
          <Text style={[styles.heroLabel, { color: theme.muted }]}>
            BEST SCORE
          </Text>
          <Text style={[styles.heroValue, { color: theme.text }]}>
            {stats.bestScore.toLocaleString()}
          </Text>
          <Sparkline
            color={theme.primary.bg}
            height={52}
            values={stats.recentScores}
            width={Math.max(80, sparklineWidth)}
          />
          <Text style={[styles.heroCaption, { color: theme.muted }]}>
            {stats.recentScores.length >= 2
              ? `Last ${stats.recentScores.length} wins`
              : 'Win a few boards to see your trend'}
          </Text>
        </View>

        <View style={styles.pairRow}>
          <View
            style={[
              styles.pairCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            <ProgressRing
              color={theme.primary.bg}
              label={`${Math.round(winRate * 100)}%`}
              labelColor={theme.text}
              progress={winRate}
              size={68}
              strokeWidth={7}
              trackColor={theme.border}
            />
            <Text style={[styles.pairLabel, { color: theme.muted }]}>
              WIN RATE
            </Text>
            <Text style={[styles.pairSub, { color: theme.muted }]}>
              {stats.gamesWon} of {stats.gamesPlayed}
            </Text>
          </View>

          <View
            style={[
              styles.pairCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            <Icon color={theme.warm.bg} name="flame" size={30} strokeWidth={1.6} />
            <Text style={[styles.streakValue, { color: theme.text }]}>
              {stats.currentStreak}
            </Text>
            <Text style={[styles.pairLabel, { color: theme.muted }]}>
              DAY STREAK
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.detailCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          <DetailRow label="Games played" theme={theme} value={stats.gamesPlayed} />
          <DetailRow label="Games won" theme={theme} value={stats.gamesWon} />
          <DetailRow label="Moves made" theme={theme} value={stats.movesMade} />
          <DetailRow label="Hints used" theme={theme} value={stats.hintsUsed} />
          <DetailRow label="Ads watched" theme={theme} value={stats.adsWatched} />
          <DetailRow
            label="Longest session"
            last
            theme={theme}
            value={formatDuration(stats.longestSessionMs)}
          />
        </View>
      </ScrollView>

      <View style={styles.navWrap}>
        <BottomNav
          active="stats"
          onNavigate={route => navigation.navigate(route)}
          theme={theme}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navWrap: {
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xs,
  },
  content: {
    gap: SPACING.md,
    padding: SCREEN_PADDING,
    paddingBottom: SPACING.xxl,
  },
  hero: {
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.xs,
    padding: SPACING.lg,
  },
  heroLabel: {
    ...TYPE.overline,
  },
  heroValue: {
    ...TYPE.numeralLarge,
  },
  heroCaption: {
    ...TYPE.caption,
    fontSize: 11,
  },
  pairRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  pairCard: {
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flex: 1,
    gap: SPACING.xs,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  pairLabel: {
    ...TYPE.overline,
    marginTop: SPACING.xs,
  },
  pairSub: {
    ...TYPE.caption,
    fontSize: 11,
  },
  streakValue: {
    fontSize: 30,
    fontWeight: '600',
  },
  detailCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    ...TYPE.body,
  },
  detailValue: {
    ...TYPE.bodyStrong,
  },
})
