import { StyleSheet, Text, View } from 'react-native'
import type { AppTheme } from '@modules/number-match/constants/palette'
import { RADIUS, SPACING, TYPE } from '@modules/number-match/constants/tokens'
import { ModalShell } from './ModalShell'
import { PrimaryButton } from './PrimaryButton'
import { SettingToggleRow } from './SettingRow'

type PauseMenuProps = {
  theme: AppTheme
  isDark: boolean
  soundEnabled: boolean
  musicEnabled: boolean
  hapticsEnabled: boolean
  onResume: () => void
  onHome: () => void
  onToggleDark: () => void
  onToggleSound: (value: boolean) => void
  onToggleMusic: (value: boolean) => void
  onToggleHaptics: (value: boolean) => void
}

export function PauseMenu({
  theme,
  isDark,
  soundEnabled,
  musicEnabled,
  hapticsEnabled,
  onResume,
  onHome,
  onToggleDark,
  onToggleSound,
  onToggleMusic,
  onToggleHaptics,
}: PauseMenuProps) {
  return (
    <ModalShell onDismiss={onResume} theme={theme} zIndex={30}>
      <Text style={[styles.title, { color: theme.text }]}>Paused</Text>

      <PrimaryButton
        icon="play"
        label="Resume"
        onPress={onResume}
        size="hero"
        theme={theme}
      />

      <View
        style={[
          styles.toggles,
          { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
        ]}>
        <SettingToggleRow
          icon="volume"
          label="Sound"
          onValueChange={onToggleSound}
          theme={theme}
          value={soundEnabled}
        />
        <SettingToggleRow
          icon="music"
          label="Music"
          onValueChange={onToggleMusic}
          theme={theme}
          value={musicEnabled}
        />
        <SettingToggleRow
          icon="vibrate"
          label="Haptics"
          onValueChange={onToggleHaptics}
          theme={theme}
          value={hapticsEnabled}
        />
        <SettingToggleRow
          icon={isDark ? 'moon' : 'sun'}
          label="Dark Mode"
          last
          onValueChange={onToggleDark}
          theme={theme}
          value={isDark}
        />
      </View>

      <PrimaryButton
        label="Quit to Home"
        onPress={onHome}
        theme={theme}
        variant="outline"
      />
    </ModalShell>
  )
}

const styles = StyleSheet.create({
  title: {
    ...TYPE.title,
    fontSize: 26,
    textAlign: 'center',
  },
  toggles: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.xs,
    overflow: 'hidden',
  },
})
