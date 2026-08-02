import { useEffect, useRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import type { AppTheme } from '@modules/number-match/constants/palette'
import {
  RADIUS,
  SPACING,
  TYPE,
  HIT_SLOP,
} from '@modules/number-match/constants/tokens'
import { useCountUp } from '@modules/number-match/hooks/useCountUp'
import { CoinBadge } from './CoinBadge'
import { Icon } from './Icon'

type GameHudProps = {
  theme: AppTheme
  coins: number
  score: number
  best: number
  moves: number
  tilesRemaining: number
  totalTiles: number
  onPause: () => void
  onAddCoins?: () => void
}

/**
 * Single row of gameplay chrome. Replaces the old stacked top bar + stat bar so
 * the board keeps as much vertical space as possible.
 */
export function GameHud({
  theme,
  coins,
  score,
  best,
  moves,
  tilesRemaining,
  totalTiles,
  onPause,
  onAddCoins,
}: GameHudProps) {
  const { displayed: displayedScore } = useCountUp(score, 500)
  const scorePop = useSharedValue(1)
  const hasScoredRef = useRef(false)
  const cleared = Math.max(0, totalTiles - tilesRemaining)
  const progress = totalTiles > 0 ? cleared / totalTiles : 0
  const progressWidth = useSharedValue(progress)

  useEffect(() => {
    // Skip the first run so the score does not pop just from mounting.
    if (!hasScoredRef.current) {
      hasScoredRef.current = true
      return
    }

    scorePop.value = withSpring(1.12, { damping: 10, stiffness: 260 }, () => {
      scorePop.value = withSpring(1, { damping: 14, stiffness: 220 })
    })
  }, [score, scorePop])

  useEffect(() => {
    progressWidth.value = withTiming(progress, { duration: 320 })
  }, [progress, progressWidth])

  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scorePop.value }],
  }))

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(0, progressWidth.value * 100))}%`,
  }))

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityLabel="Pause game"
          accessibilityRole="button"
          hitSlop={HIT_SLOP}
          onPress={onPause}
          style={({ pressed }) => [
            styles.pauseButton,
            {
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.border,
            },
            pressed && styles.pressed,
          ]}>
          <Icon color={theme.text} name="pause" size={18} />
        </Pressable>

        <View style={styles.scoreBlock}>
          <Animated.Text
            style={[styles.score, { color: theme.text }, scoreStyle]}>
            {displayedScore.toLocaleString()}
          </Animated.Text>
          <Text style={[styles.scoreLabel, { color: theme.muted }]}>SCORE</Text>
        </View>

        <CoinBadge
          coins={coins}
          compact
          onAddPress={onAddCoins}
          theme={theme}
        />
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: theme.muted }]}>
          BEST {best.toLocaleString()}
        </Text>
        <Text style={[styles.metaDot, { color: theme.muted }]}>·</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          {moves} {moves === 1 ? 'MOVE' : 'MOVES'}
        </Text>
        <Text style={[styles.metaDot, { color: theme.muted }]}>·</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          {tilesRemaining} LEFT
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: theme.primary.bg }, barStyle]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.xs,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pauseButton: {
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },

  scoreBlock: {
    alignItems: 'center',
    flex: 1,
  },
  score: {
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  scoreLabel: {
    ...TYPE.overline,
    marginTop: -2,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    justifyContent: 'center',
  },
  meta: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.8,
  },
  metaDot: {
    fontSize: 10,
    fontWeight: '500',
  },
  track: {
    borderRadius: RADIUS.pill,
    height: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: RADIUS.pill,
    height: '100%',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
})
