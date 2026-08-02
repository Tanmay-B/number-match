import { StyleSheet, Text, View } from 'react-native'
import type { AppTheme } from '@modules/number-match/constants/palette'
import { SPACING, TYPE } from '@modules/number-match/constants/tokens'
import { CoinAmount } from './CoinAmount'
import { Icon, type IconName } from './Icon'
import { ModalShell } from './ModalShell'
import { PrimaryButton } from './PrimaryButton'

type PowerUpOfferModalProps = {
  theme: AppTheme
  title: string
  body: string
  icon?: IconName
  cost: number | 'free'
  canUseCoins: boolean
  canWatchAd: boolean
  isAdLoaded: boolean
  onUseCoins: () => void
  onWatchAd: () => void
  onClose: () => void
}

export function PowerUpOfferModal({
  theme,
  title,
  body,
  icon,
  cost,
  canUseCoins,
  canWatchAd,
  isAdLoaded,
  onUseCoins,
  onWatchAd,
  onClose,
}: PowerUpOfferModalProps) {
  return (
    <ModalShell onDismiss={onClose} theme={theme} zIndex={22}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Icon color={theme.accent.bg} name={icon} size={40} strokeWidth={1.6} />
        </View>
      ) : null}
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>

      <PrimaryButton
        disabled={!canUseCoins}
        label={cost === 'free' ? `Use ${title} — Free` : `Use ${title}`}
        onPress={onUseCoins}
        theme={theme}
        variant="primary"
      />
      {cost !== 'free' ? (
        <View style={styles.costRow}>
          <Text style={[styles.costLabel, { color: theme.muted }]}>Costs </Text>
          <CoinAmount amount={cost} color={theme.muted} size="small" />
        </View>
      ) : null}

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        <Text style={[styles.dividerText, { color: theme.muted }]}>OR</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>

      <PrimaryButton
        disabled={!canWatchAd || !isAdLoaded}
        icon="play"
        label={`Free ${title}`}
        onPress={onWatchAd}
        subtitle={canWatchAd ? 'Watch a short ad' : 'Daily ad limit reached'}
        theme={theme}
        variant="secondary"
      />

      <PrimaryButton
        label="Cancel"
        onPress={onClose}
        theme={theme}
        variant="ghost"
      />
    </ModalShell>
  )
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
  },
  title: {
    ...TYPE.title,
    fontSize: 24,
    textAlign: 'center',
  },
  body: {
    ...TYPE.body,
    textAlign: 'center',
  },
  costRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -SPACING.xs,
  },
  costLabel: {
    ...TYPE.caption,
    fontWeight: '600',
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...TYPE.overline,
  },
})
