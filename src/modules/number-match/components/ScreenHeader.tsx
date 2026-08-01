import { StyleSheet, Text, View } from 'react-native'
import { PALETTE } from '@modules/number-match/constants/palette'
import type { AppTheme } from '@modules/number-match/constants/palette'

type ScreenHeaderProps = {
  title: string
  theme: AppTheme
  leftLabel?: string
  onLeftPress?: () => void
  rightSlot?: React.ReactNode
}

export function ScreenHeader({
  title,
  theme,
  rightSlot,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {rightSlot}
    </View>
  )
}

type StatPillProps = {
  label: string
  value: string | number
  theme: AppTheme
}

export function StatPill({ label, value, theme }: StatPillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.pillLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.pillValue, { color: theme.text }]}>{value}</Text>
    </View>
  )
}

type CoinBadgeProps = {
  coins: number
}

export function CoinBadge({ coins }: CoinBadgeProps) {
  return (
    <View style={styles.coinBadge}>
      <Text style={styles.coinIcon}>●</Text>
      <Text style={styles.coinValue}>{coins}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  pill: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pillLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  pillValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  coinBadge: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  coinIcon: {
    color: PALETTE.coin,
    fontSize: 12,
  },
  coinValue: {
    color: '#92400E',
    fontSize: 15,
    fontWeight: '800',
  },
})
