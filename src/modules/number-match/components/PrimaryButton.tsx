import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native'
import { PALETTE } from '@modules/number-match/constants/palette'
import type { AppTheme } from '@modules/number-match/constants/palette'

type PrimaryButtonProps = {
  label: string
  onPress: () => void
  theme: AppTheme
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  style?: ViewStyle
}

export function PrimaryButton({
  label,
  onPress,
  theme,
  variant = 'primary',
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const isPrimary = variant === 'primary'
  const isGhost = variant === 'ghost'

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        variant === 'secondary' && {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
        },
        isGhost && styles.ghost,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text
        style={[
          styles.label,
          isPrimary && styles.primaryLabel,
          !isPrimary && { color: theme.text },
        ]}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: PALETTE.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
})
