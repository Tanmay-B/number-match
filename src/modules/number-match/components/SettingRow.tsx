import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import type { AppTheme } from '@modules/number-match/constants/palette'
import { SPACING, TYPE } from '@modules/number-match/constants/tokens'
import { Icon, type IconName } from './Icon'

type BaseProps = {
  theme: AppTheme
  label: string
  icon?: IconName
  subtitle?: string
  /** Hides the divider — set on the last row of a section. */
  last?: boolean
}

type ToggleRowProps = BaseProps & {
  value: boolean
  onValueChange: (next: boolean) => void
}

export function SettingToggleRow({
  theme,
  label,
  icon,
  subtitle,
  last = false,
  value,
  onValueChange,
}: ToggleRowProps) {
  return (
    <View
      style={[
        styles.row,
        { borderColor: theme.border },
        last && styles.lastRow,
      ]}>
      {icon ? (
        <Icon color={theme.muted} name={icon} size={19} />
      ) : null}
      <View style={styles.textWrap}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={label}
        onValueChange={onValueChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: theme.border, true: theme.primary.bg }}
        value={value}
      />
    </View>
  )
}

type LinkRowProps = BaseProps & {
  onPress: () => void
  /** Right-aligned text, e.g. the current value or a version number. */
  value?: string
  tone?: 'default' | 'danger'
}

export function SettingLinkRow({
  theme,
  label,
  icon,
  subtitle,
  last = false,
  onPress,
  value,
  tone = 'default',
}: LinkRowProps) {
  const color = tone === 'danger' ? theme.danger.bg : theme.text

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: theme.border },
        last && styles.lastRow,
        pressed && styles.pressed,
      ]}>
      {icon ? <Icon color={color} name={icon} size={19} /> : null}
      <View style={styles.textWrap}>
        <Text style={[styles.label, { color }]}>{label}</Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[styles.subtitle, { color: theme.muted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text style={[styles.value, { color: theme.muted }]}>{value}</Text>
      ) : null}
      <Icon color={theme.muted} name="chevronRight" size={17} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    ...TYPE.bodyStrong,
  },
  subtitle: {
    ...TYPE.caption,
    marginTop: 1,
  },
  value: {
    ...TYPE.caption,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
})
