import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { APP_VERSION } from '@modules/number-match/constants/storage'
import { useAppTheme } from '@global/hooks/useAppTheme'
import { useGameStore } from '@store/game.store'
import { useSettingsStore } from '@store/settings.store'
import { useStatsStore } from '@store/stats.store'
import { useThemeStore } from '@store/theme.store'
import { useVisualThemeStore } from '@store/visualTheme.store'
import { AppRoutes, AppStackParams } from '@router/routes'

type Props = NativeStackScreenProps<AppStackParams, AppRoutes.SPLASH>

export function SplashScreen({ navigation }: Props) {
  const { theme } = useAppTheme()
  const hydrateGameStore = useGameStore(state => state.hydrateGameStore)
  const hydrateSettings = useSettingsStore(state => state.hydrateSettings)
  const hydrateStats = useStatsStore(state => state.hydrateStats)
  const hydrateTheme = useThemeStore(state => state.hydrateTheme)
  const hydrateVisualThemes = useVisualThemeStore(
    state => state.hydrateVisualThemes,
  )

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      await Promise.all([
        hydrateTheme(),
        hydrateSettings(),
        hydrateStats(),
        hydrateGameStore(),
        hydrateVisualThemes(),
      ])

      await new Promise<void>(resolve => {
        setTimeout(resolve, 1200)
      })

      if (!cancelled) {
        navigation.replace(AppRoutes.HOME)
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [
    hydrateGameStore,
    hydrateSettings,
    hydrateStats,
    hydrateTheme,
    hydrateVisualThemes,
    navigation,
  ])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.logo, { color: theme.text }]}>Number Match</Text>
        <Text style={[styles.tagline, { color: theme.muted }]}>
          Relax. Match. Repeat.
        </Text>
        <View style={[styles.loader, { borderColor: theme.border }]} />
      </View>
      <Text style={[styles.version, { color: theme.muted }]}>v{APP_VERSION}</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    marginTop: 8,
  },
  loader: {
    borderRadius: 999,
    borderWidth: 3,
    height: 28,
    marginTop: 28,
    width: 28,
  },
  version: {
    fontSize: 12,
    textAlign: 'center',
  },
})
