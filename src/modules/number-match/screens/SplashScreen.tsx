import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { APP_VERSION } from '@modules/number-match/constants/storage'
import { GAME_TAGLINE } from '@modules/number-match/constants/gameCopy'
import { ConfettiDots } from '@modules/number-match/components/ConfettiDots'
import { GameLogo } from '@modules/number-match/components/GameLogo'
import { TileDotsLoader } from '@modules/number-match/components/TileDotsLoader'
import { SPACING, TYPE } from '@modules/number-match/constants/tokens'
import { useAppTheme } from '@global/hooks/useAppTheme'
import { useGameStore } from '@store/game.store'
import { useAdRewardStore } from '@store/adReward.store'
import { useSettingsStore } from '@store/settings.store'
import { useStatsStore } from '@store/stats.store'
import { useThemeStore } from '@store/theme.store'
import { useVisualThemeStore } from '@store/visualTheme.store'
import { AppRoutes, AppStackParams } from '@router/routes'

type Props = NativeStackScreenProps<AppStackParams, AppRoutes.SPLASH>

/** Minimum time on screen so the intro animation can play out. */
const MIN_SPLASH_MS = 900

export function SplashScreen({ navigation }: Props) {
  const { theme } = useAppTheme()
  const hydrateGameStore = useGameStore(state => state.hydrateGameStore)
  const hydrateAdRewards = useAdRewardStore(state => state.hydrateAdRewards)
  const hydrateSettings = useSettingsStore(state => state.hydrateSettings)
  const hydrateStats = useStatsStore(state => state.hydrateStats)
  const hydrateTheme = useThemeStore(state => state.hydrateTheme)
  const hydrateVisualThemes = useVisualThemeStore(
    state => state.hydrateVisualThemes,
  )

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      // Run hydration and the minimum display time concurrently, so a fast
      // device is not held back by more than the animation needs.
      await Promise.all([
        hydrateTheme(),
        hydrateSettings(),
        hydrateStats(),
        hydrateGameStore(),
        hydrateAdRewards(),
        hydrateVisualThemes(),
        new Promise<void>(resolve => {
          setTimeout(resolve, MIN_SPLASH_MS)
        }),
      ])

      if (!cancelled) {
        navigation.replace(AppRoutes.HOME)
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [
    hydrateAdRewards,
    hydrateGameStore,
    hydrateSettings,
    hydrateStats,
    hydrateTheme,
    hydrateVisualThemes,
    navigation,
  ])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ConfettiDots theme={theme} />

      <View style={styles.content}>
        <GameLogo animated theme={theme} />
        <Animated.Text
          entering={FadeIn.delay(420).duration(400)}
          style={[styles.tagline, { color: theme.muted }]}>
          {GAME_TAGLINE}
        </Animated.Text>
        <View style={styles.loader}>
          <TileDotsLoader theme={theme} />
        </View>
      </View>
      <Text style={[styles.version, { color: theme.muted }]}>v{APP_VERSION}</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xxl,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  tagline: {
    ...TYPE.body,
    fontSize: 16,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  loader: {
    marginTop: SPACING.xxl,
  },
  version: {
    ...TYPE.caption,
    textAlign: 'center',
  },
})
