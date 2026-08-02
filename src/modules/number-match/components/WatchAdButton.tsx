import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import type { AppTheme } from '@modules/number-match/constants/palette'
import {
  RADIUS,
  SPACING,
  TYPE,
  elevation,
} from '@modules/number-match/constants/tokens'
import { CoinAmount } from './CoinAmount'
import { Icon } from './Icon'

type WatchAdButtonProps = {
  theme: AppTheme
  rewardAmount: number
  remainingToday: number
  dailyCap: number
  canWatch: boolean
  isLoaded: boolean
  isLoading: boolean
  onPress: () => void
  /**
   * `strip` — a quiet full-width row (Home).
   * `pill`  — a floating capsule that overlays the board (Gameplay).
   */
  variant?: 'strip' | 'pill'
}

export function WatchAdButton({
  theme,
  rewardAmount,
  remainingToday,
  dailyCap,
  canWatch,
  isLoaded,
  isLoading,
  onPress,
  variant = 'strip',
}: WatchAdButtonProps) {
  const disabled = !canWatch || !isLoaded || isLoading
  const isPill = variant === 'pill'

  return (
    <Pressable
      accessibilityLabel={`Watch an ad for ${rewardAmount} coins`}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        isPill ? styles.pill : styles.strip,
        isPill ? elevation(3) : elevation(0),
        {
          backgroundColor: isPill ? theme.surfaceElevated : theme.surface,
          borderColor: canWatch ? theme.accent.bg : theme.border,
        },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Icon color={theme.accent.bg} name="play" size={15} />

      <View style={styles.textWrap}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.text }]}>
            {isLoading ? 'Loading ad…' : 'Watch ad for '}
          </Text>
          {!isLoading ? (
            <CoinAmount amount={rewardAmount} color={theme.text} size="medium" />
          ) : null}
        </View>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          {canWatch
            ? `${remainingToday} of ${dailyCap} left today`
            : `Daily limit reached (${dailyCap}/${dailyCap})`}
        </Text>
      </View>

      {isLoading ? <ActivityIndicator color={theme.accent.bg} /> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  strip: {
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  pill: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  textWrap: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    ...TYPE.bodyStrong,
    fontSize: 14,
  },
  subtitle: {
    ...TYPE.caption,
    fontSize: 11,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
})
