import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { PrimaryButton } from '@modules/number-match/components/PrimaryButton'
import { useAppTheme } from '@global/hooks/useAppTheme'
import { getPrimaryShareUrl } from '@infra/share/appLinks'
import { useSettingsStore } from '@store/settings.store'
import { AppRoutes, AppStackParams } from '@router/routes'

type Props = NativeStackScreenProps<AppStackParams, AppRoutes.SETTINGS>

type SettingRowProps = {
  label: string
  value: boolean
  onValueChange: (value: boolean) => void
  themeText: string
}

function SettingRow({ label, value, onValueChange, themeText }: SettingRowProps) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: themeText }]}>{label}</Text>
      <Switch onValueChange={onValueChange} value={value} />
    </View>
  )
}

export function SettingsScreen({ navigation }: Props) {
  const { theme, isDark, toggleThemeMode } = useAppTheme()
  const soundEnabled = useSettingsStore(state => state.soundEnabled)
  const musicEnabled = useSettingsStore(state => state.musicEnabled)
  const hapticsEnabled = useSettingsStore(state => state.hapticsEnabled)
  const setSoundEnabled = useSettingsStore(state => state.setSoundEnabled)
  const setMusicEnabled = useSettingsStore(state => state.setMusicEnabled)
  const setHapticsEnabled = useSettingsStore(state => state.setHapticsEnabled)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        <SettingRow
          label="Sound"
          onValueChange={setSoundEnabled}
          themeText={theme.text}
          value={soundEnabled}
        />
        <SettingRow
          label="Music"
          onValueChange={setMusicEnabled}
          themeText={theme.text}
          value={musicEnabled}
        />
        <SettingRow
          label="Haptics"
          onValueChange={setHapticsEnabled}
          themeText={theme.text}
          value={hapticsEnabled}
        />
        <SettingRow
          label="Dark Mode"
          onValueChange={() => toggleThemeMode()}
          themeText={theme.text}
          value={isDark}
        />

        <PrimaryButton
          label="Reset Progress"
          onPress={() => {}}
          style={styles.action}
          theme={theme}
          variant="secondary"
        />
        <PrimaryButton
          label="Privacy Policy"
          onPress={() => {}}
          style={styles.action}
          theme={theme}
          variant="secondary"
        />
        <PrimaryButton
          label="Rate App"
          onPress={() => {}}
          style={styles.action}
          theme={theme}
          variant="secondary"
        />
        <PrimaryButton
          label={`Share App (${getPrimaryShareUrl()})`}
          onPress={() => {}}
          style={styles.action}
          theme={theme}
          variant="secondary"
        />

        <PrimaryButton
          label="Back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          theme={theme}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  action: {
    marginBottom: 10,
  },
  backButton: {
    marginTop: 8,
  },
})
