import { useEffect } from 'react'
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native'
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
  RADIUS,
  SPACING,
  elevation,
} from '@modules/number-match/constants/tokens'
import { CoinCost } from './CoinAmount'
import { Icon, type IconName } from './Icon'

const POWER_UP_ICONS: Record<string, IconName> = {
  Undo: 'undo',
  Hint: 'bulb',
  Shuffle: 'shuffle',
  'Add Lines': 'plus',
  'Add Lines!': 'plus',
}

type PowerUpButtonProps = {
  label: string
  cost: number | 'free'
  disabledReason?: string
  disabledReasonCost?: number
  spinKey?: number
  theme: AppTheme
  disabled?: boolean
  onPress: () => void
  style?: ViewStyle
  /** Draws attention to this power-up (used for the rescue action). */
  highlight?: boolean
  /** Pushed to the background while another action is the priority. */
  dimmed?: boolean
  badgeText?: string
}

export function PowerUpButton({
  label,
  cost,
  spinKey = 0,
  theme,
  disabled = false,
  onPress,
  style,
  highlight = false,
  dimmed = false,
  badgeText,
}: PowerUpButtonProps) {
  const icon = POWER_UP_ICONS[label] ?? 'plus'
  const pulse = useSharedValue(0)

  useEffect(() => {
    if (!highlight) {
      cancelAnimation(pulse)
      pulse.value = withTiming(0, { duration: 200 })
      return
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 620, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 620, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    )

    return () => cancelAnimation(pulse)
  }, [highlight, pulse])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.08 }],
  }))

  const iconColor = highlight ? theme.accent.ink : theme.text

  return (
    <View style={[styles.wrap, dimmed && styles.dimmed, style]}>
      <Animated.View style={animatedStyle}>
        <Pressable
          accessibilityLabel={label}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={onPress}
          style={({ pressed }) => [
            styles.circle,
            highlight ? elevation(2) : elevation(0),
            {
              backgroundColor: highlight
                ? theme.accent.bg
                : theme.surfaceElevated,
              borderColor: highlight ? theme.accent.bg : theme.border,
              shadowColor: theme.accent.bg,
            },
            disabled && styles.disabled,
            pressed && !disabled && styles.pressed,
          ]}>
          <Icon color={iconColor} name={icon} size={21} />
          {badgeText ? (
            <View style={[styles.badge, { backgroundColor: theme.danger.bg }]}>
              <Text style={[styles.badgeText, { color: theme.danger.ink }]}>
                {badgeText}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
      <Text
        numberOfLines={1}
        style={[
          styles.name,
          { color: highlight ? theme.accent.bg : theme.muted },
        ]}>
        {label.replace('!', '').toUpperCase()}
      </Text>
      <CoinCost
        color={highlight ? theme.accent.bg : theme.muted}
        cost={cost}
        spinKey={spinKey}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flex: 1,
    gap: SPACING.xs,
  },
  dimmed: {
    opacity: 0.38,
  },
  circle: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    borderWidth: 2,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  name: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  badge: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: SPACING.xs,
    position: 'absolute',
    right: -4,
    top: -4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
})
