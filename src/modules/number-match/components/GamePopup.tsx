import { StyleSheet, Text, View } from 'react-native'
import type { AppTheme } from '@modules/number-match/constants/palette'
import { PrimaryButton } from './PrimaryButton'

type GamePopupProps = {
  theme: AppTheme
  title: string
  body: string
  primaryLabel: string
  onPrimaryPress: () => void
  secondaryLabel?: string
  onSecondaryPress?: () => void
  tertiaryLabel?: string
  onTertiaryPress?: () => void
}

export function GamePopup({
  theme,
  title,
  body,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  tertiaryLabel,
  onTertiaryPress,
}: GamePopupProps) {
  return (
    <View style={styles.overlay}>
      <View
        style={[
          styles.modal,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
        <PrimaryButton label={primaryLabel} onPress={onPrimaryPress} theme={theme} />
        {secondaryLabel && onSecondaryPress ? (
          <PrimaryButton
            label={secondaryLabel}
            onPress={onSecondaryPress}
            style={styles.secondary}
            theme={theme}
            variant="secondary"
          />
        ) : null}
        {tertiaryLabel && onTertiaryPress ? (
          <PrimaryButton
            label={tertiaryLabel}
            onPress={onTertiaryPress}
            style={styles.secondary}
            theme={theme}
            variant="ghost"
          />
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  secondary: {
    marginTop: 4,
  },
})
