import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native'
import type { ColorRole } from '@modules/number-match/constants/palette'
import { RADIUS, SPACING } from '@modules/number-match/constants/tokens'
import { Icon, type IconName } from './Icon'

type ChipCardProps = {
  role: ColorRole
  icon: IconName
  label: string
  onPress: () => void
  style?: ViewStyle
  disabled?: boolean
}

/**
 * Small filled card — icon above a label — used for the two-up shortcuts.
 * Ink always comes from the role, so contrast holds in every theme.
 */
export function ChipCard({
  role,
  icon,
  label,
  onPress,
  style,
  disabled = false,
}: ChipCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: role.bg },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      <Icon color={role.ink} name={icon} size={18} />
      <Text style={[styles.label, { color: role.ink }]}>{label}</Text>
    </Pressable>
  )
}

type ChipRowProps = {
  role: ColorRole
  icon: IconName
  label: string
  /** Trailing text, e.g. an ad allowance. */
  meta?: string
  onPress: () => void
  disabled?: boolean
}

/** Full-width filled row — the ad strip in the design. */
export function ChipRow({
  role,
  icon,
  label,
  meta,
  onPress,
  disabled = false,
}: ChipRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: role.bg },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <View style={styles.rowLeft}>
        <Icon color={role.ink} name={icon} size={15} />
        <Text style={[styles.rowLabel, { color: role.ink }]}>{label}</Text>
      </View>
      {meta ? (
        <Text style={[styles.rowMeta, { color: role.ink }]}>{meta}</Text>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: RADIUS.md,
    flex: 1,
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  row: {
    alignItems: 'center',
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.md,
  },
  rowLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: SPACING.xs + 2,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  rowMeta: {
    fontSize: 11,
    fontWeight: '400',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
})
