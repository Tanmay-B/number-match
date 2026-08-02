import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import type { AppTheme } from '@modules/number-match/constants/palette'

type GameLogoProps = {
  theme: AppTheme
  size?: 'large' | 'medium'
  /** Plays a scale-in on mount (used on the splash screen). */
  animated?: boolean
}

export function GameLogo({
  theme,
  size = 'large',
  animated = false,
}: GameLogoProps) {
  const isLarge = size === 'large'
  const scale = useSharedValue(animated ? 0.7 : 1)
  const opacity = useSharedValue(animated ? 0 : 1)
  const matchOpacity = useSharedValue(animated ? 0 : 1)
  const matchShift = useSharedValue(animated ? 10 : 0)

  useEffect(() => {
    if (!animated) {
      return
    }

    opacity.value = withTiming(1, { duration: 260 })
    scale.value = withSpring(1, { damping: 12, stiffness: 160 })
    matchOpacity.value = withDelay(180, withTiming(1, { duration: 300 }))
    matchShift.value = withDelay(
      180,
      withSpring(0, { damping: 14, stiffness: 180 }),
    )
  }, [animated, matchOpacity, matchShift, opacity, scale])

  const topStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  const bottomStyle = useAnimatedStyle(() => ({
    opacity: matchOpacity.value,
    transform: [{ translateY: matchShift.value }],
  }))

  return (
    <View style={styles.wrap}>
      <Animated.Text
        style={[
          styles.word,
          isLarge ? styles.wordLarge : styles.wordMedium,
          { color: theme.accent.bg },
          topStyle,
        ]}>
        NUMBER
      </Animated.Text>
      <Animated.Text
        style={[
          styles.word,
          isLarge ? styles.wordLarge : styles.wordMedium,
          { color: theme.accentAlt.bg },
          bottomStyle,
        ]}>
        MATCH
      </Animated.Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  word: {
    fontWeight: '500',
    letterSpacing: 1,
  },
  wordLarge: {
    fontSize: 34,
    lineHeight: 40,
  },
  wordMedium: {
    fontSize: 26,
    lineHeight: 31,
  },
})
