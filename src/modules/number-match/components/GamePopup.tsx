import { StyleSheet, Text, View } from 'react-native'
import type { AppTheme } from '@modules/number-match/constants/palette'
import { RADIUS, SPACING, TYPE } from '@modules/number-match/constants/tokens'
import { Icon, type IconName } from './Icon'
import { ModalShell } from './ModalShell'
import { PrimaryButton } from './PrimaryButton'

export type PopupStat = { label: string; value: string | number }

type GamePopupProps = {
  theme: AppTheme
  title: string
  body?: string
  icon?: IconName
  /** Result numbers, rendered as a row of pills instead of inline text. */
  stats?: PopupStat[]
  primaryLabel: string
  onPrimaryPress: () => void
  secondaryLabel?: string
  onSecondaryPress?: () => void
  tertiaryLabel?: string
  onTertiaryPress?: () => void
  primaryVariant?: 'primary' | 'secondary'
}

export function GamePopup({
  theme,
  title,
  body,
  icon,
  stats,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  tertiaryLabel,
  onTertiaryPress,
  primaryVariant = 'primary',
}: GamePopupProps) {
  return (
    <ModalShell theme={theme} zIndex={25}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Icon color={theme.accent.bg} name={icon} size={48} strokeWidth={1.6} />
        </View>
      ) : null}
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {body ? (
        <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
      ) : null}

      {stats?.length ? (
        <View style={styles.statRow}>
          {stats.map(stat => (
            <View
              key={stat.label}
              style={[
                styles.statPill,
                { backgroundColor: theme.statBg, borderColor: theme.border },
              ]}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {typeof stat.value === 'number'
                  ? stat.value.toLocaleString()
                  : stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.muted }]}>
                {stat.label.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <PrimaryButton
        label={primaryLabel}
        onPress={onPrimaryPress}
        theme={theme}
        variant={primaryVariant}
      />
      {tertiaryLabel && onTertiaryPress ? (
        <PrimaryButton
          label={tertiaryLabel}
          onPress={onTertiaryPress}
          theme={theme}
          variant="secondary"
        />
      ) : null}
      {secondaryLabel && onSecondaryPress ? (
        <PrimaryButton
          label={secondaryLabel}
          onPress={onSecondaryPress}
          theme={theme}
          variant="outline"
        />
      ) : null}
    </ModalShell>
  )
}

const styles = StyleSheet.create({
  title: {
    ...TYPE.title,
    textAlign: 'center',
  },
  body: {
    ...TYPE.body,
    textAlign: 'center',
  },
  iconWrap: {
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  statPill: {
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flex: 1,
    paddingVertical: SPACING.md,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  statLabel: {
    ...TYPE.overline,
    marginTop: 2,
  },
})
