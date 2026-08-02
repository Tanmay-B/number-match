import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import type { AppTheme } from '@modules/number-match/constants/palette'
import { RADIUS, SPACING } from '@modules/number-match/constants/tokens'

const DOT_VALUES = [3, 7, 1, 5, 9]
const STAGGER_MS = 110

type TileDotsLoaderProps = {
  theme: AppTheme
}

/**
 * Loading indicator built from board tiles rather than a generic spinner, so
 * the splash previews the game's visual language.
 */
export function TileDotsLoader({ theme }: TileDotsLoaderProps) {
  return (
    <View style={styles.row}>
      {DOT_VALUES.map((value, index) => (
        <Dot
          key={value}
          color={theme.tiles[value] ?? theme.tiles[1]!}
          delay={index * STAGGER_MS}
        />
      ))}
    </View>
  )
}

function Dot({ color, delay }: { color: string; delay: number }) {
  const lift = useSharedValue(0)

  useEffect(() => {
    lift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 420, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 360 }),
        ),
        -1,
        false,
      ),
    )

    return () => cancelAnimation(lift)
  }, [delay, lift])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + lift.value * 0.55,
    transform: [
      { translateY: -lift.value * 10 },
      { scale: 0.85 + lift.value * 0.15 },
    ],
  }))

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: color }, animatedStyle]}
    />
  )
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: SPACING.sm,
    height: 32,
  },
  dot: {
    borderRadius: RADIUS.xs,
    height: 14,
    width: 14,
  },
})
