import { useEffect } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import type { AppTheme } from '@modules/number-match/constants/palette'
import { RADIUS, SPACING, HIT_SLOP } from '@modules/number-match/constants/tokens'
import { useCountUp } from '@modules/number-match/hooks/useCountUp'
import { Icon } from './Icon'

type CoinBadgeProps = {
  coins: number
  theme: AppTheme
  onAddPress?: () => void
  compact?: boolean
}

/** Gold chip carrying the coin balance, with dark ink matched to the chip. */
export function CoinBadge({
  coins,
  theme,
  onAddPress,
  compact = false,
}: CoinBadgeProps) {
  const { displayed, direction } = useCountUp(coins)
  const valueScale = useSharedValue(1)

  useEffect(() => {
    if (direction === 'none') {
      return
    }

    valueScale.value = withSequence(
      withTiming(direction === 'down' ? 0.84 : 1.18, { duration: 120 }),
      withTiming(1, { duration: 280 }),
    )
  }, [direction, displayed, valueScale])

  const valueStyle = useAnimatedStyle(() => ({
    transform: [{ scale: valueScale.value }],
  }))

  const iconSize = compact ? 15 : 18

  return (
    <View
      style={[
        styles.badge,
        compact && styles.compact,
        { backgroundColor: theme.accent.bg },
      ]}>
      <Icon color={theme.accent.ink} name="coin" size={iconSize} />
      <Animated.Text
        style={[
          styles.value,
          compact && styles.compactValue,
          { color: theme.accent.ink },
          valueStyle,
        ]}>
        {displayed.toLocaleString()}
      </Animated.Text>
      {onAddPress ? (
        <Pressable
          accessibilityLabel="Get more coins"
          accessibilityRole="button"
          hitSlop={HIT_SLOP}
          onPress={onAddPress}
          style={({ pressed }) => [pressed && styles.pressed]}>
          <Icon color={theme.accent.ink} name="plusCircle" size={iconSize} />
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.sm + 1,
  },
  compact: {
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
  },
  compactValue: {
    fontSize: 13,
  },
  pressed: {
    opacity: 0.6,
  },
})
