import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import type { AppTheme } from '@modules/number-match/constants/palette'
import {
  DURATION,
  RADIUS,
  SPACING,
  elevation,
} from '@modules/number-match/constants/tokens'
import { Icon } from './Icon'

type StuckBannerProps = {
  theme: AppTheme
  /** Number of tiles Add Lines will restore. */
  restoreCount: number
}

/**
 * Shown when no matches remain. This is the moment the player is most likely to
 * quit, so it is deliberately the loudest element on the screen.
 */
export function StuckBanner({ theme, restoreCount }: StuckBannerProps) {
  const pulse = useSharedValue(0)

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: DURATION.pulse,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: DURATION.pulse,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    )

    return () => cancelAnimation(pulse)
  }, [pulse])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.015 }],
    opacity: 0.9 + pulse.value * 0.1,
  }))

  return (
    <Animated.View
      style={[
        styles.banner,
        elevation(2),
        { backgroundColor: theme.accent.bg, shadowColor: theme.accent.bg },
        animatedStyle,
      ]}>
      <Icon color={theme.accent.ink} name="bulb" size={22} />
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: theme.accent.ink }]}>
          NO MATCHES LEFT
        </Text>
        <Text style={[styles.body, { color: theme.accent.ink }]}>
          Rescue power-ups are free — Add Lines restores {restoreCount} numbers.
        </Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  body: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 1,
    opacity: 0.85,
  },
})
