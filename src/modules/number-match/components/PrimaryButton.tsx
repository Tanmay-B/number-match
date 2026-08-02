import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native'
import type { AppTheme } from '@modules/number-match/constants/palette'
import {
  RADIUS,
  SPACING,
  elevation,
} from '@modules/number-match/constants/tokens'
import { Icon, type IconName } from './Icon'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'

export type ButtonSize = 'hero' | 'regular' | 'compact'

type PrimaryButtonProps = {
  label: string
  onPress: () => void
  theme: AppTheme
  variant?: ButtonVariant
  size?: ButtonSize
  /** Secondary line rendered under the label (e.g. resume context). */
  subtitle?: string
  /** Leading icon. */
  icon?: IconName
  disabled?: boolean
  style?: ViewStyle
  uppercase?: boolean
}

const SIZES: Record<ButtonSize, { minHeight: number; paddingHorizontal: number }> =
  {
    hero: { minHeight: 66, paddingHorizontal: SPACING.xl },
    regular: { minHeight: 52, paddingHorizontal: SPACING.xl },
    compact: { minHeight: 40, paddingHorizontal: SPACING.md },
  }

function resolveColors(variant: ButtonVariant, theme: AppTheme) {
  switch (variant) {
    case 'primary':
      return {
        background: theme.primary.bg,
        label: theme.primary.ink,
        border: 'transparent',
      }
    case 'secondary':
      return {
        background: theme.secondary.bg,
        label: theme.secondary.ink,
        border: 'transparent',
      }
    case 'danger':
      return {
        background: theme.danger.bg,
        label: theme.danger.ink,
        border: 'transparent',
      }
    case 'outline':
      return {
        background: theme.surfaceElevated,
        label: theme.text,
        border: theme.border,
      }
    case 'ghost':
    default:
      return {
        background: 'transparent',
        label: theme.text,
        border: 'transparent',
      }
  }
}

export function PrimaryButton({
  label,
  onPress,
  theme,
  variant = 'primary',
  size = 'regular',
  subtitle,
  icon,
  disabled = false,
  style,
  uppercase = false,
}: PrimaryButtonProps) {
  const colors = resolveColors(variant, theme)
  const dimensions = SIZES[size]
  const isFilled =
    variant === 'primary' || variant === 'secondary' || variant === 'danger'

  return (
    <Pressable
      accessibilityLabel={subtitle ? `${label}. ${subtitle}` : label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        dimensions,
        isFilled ? elevation(2) : elevation(0),
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <View style={styles.inner}>
        {icon ? (
          <Icon color={colors.label} name={icon} size={size === 'hero' ? 20 : 18} />
        ) : null}
        <View style={styles.labelWrap}>
          <Text
            numberOfLines={1}
            style={[
              size === 'hero' ? styles.heroLabel : styles.label,
              { color: colors.label },
            ]}>
            {uppercase ? label.toUpperCase() : label}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[styles.subtitle, { color: colors.label }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  labelWrap: {
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  heroLabel: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
    opacity: 0.85,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.4,
  },
})
