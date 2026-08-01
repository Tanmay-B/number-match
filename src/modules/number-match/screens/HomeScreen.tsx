import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { APP_VERSION } from '@modules/number-match/constants/storage'
import { MenuCard } from '@modules/number-match/components/MenuCard'
import { CoinBadge, ScreenHeader } from '@modules/number-match/components/ScreenHeader'
import { useAppTheme } from '@global/hooks/useAppTheme'
import { useGameStore } from '@store/game.store'
import { useStatsStore } from '@store/stats.store'
import { AppRoutes, AppStackParams } from '@router/routes'

type Props = NativeStackScreenProps<AppStackParams, AppRoutes.HOME>

export function HomeScreen({ navigation }: Props) {
  const { theme } = useAppTheme()
  const coins = useGameStore(state => state.coins)
  const savedGame = useGameStore(state => state.game)
  const currentStreak = useStatsStore(state => state.currentStreak)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          rightSlot={<CoinBadge coins={coins} />}
          theme={theme}
          title="Number Match"
        />

        <Text style={[styles.streak, { color: theme.muted }]}>
          Streak: {currentStreak} day{currentStreak === 1 ? '' : 's'}
        </Text>

        {savedGame ? (
          <MenuCard
            badge="Resume"
            onPress={() => navigation.navigate(AppRoutes.GAMEPLAY)}
            subtitle={`Score ${savedGame.score} · ${savedGame.gridSize}×${savedGame.gridSize}`}
            theme={theme}
            title="Continue Game"
          />
        ) : null}

        <MenuCard
          onPress={() =>
            navigation.navigate(AppRoutes.GAMEPLAY, { newGame: true })
          }
          subtitle="Start a fresh board"
          theme={theme}
          title="New Game"
        />

        <MenuCard
          badge="Daily"
          onPress={() => {}}
          subtitle="Claim your free coins"
          theme={theme}
          title="Daily Reward"
        />

        <MenuCard
          onPress={() => navigation.navigate(AppRoutes.STATISTICS)}
          subtitle="Track your progress"
          theme={theme}
          title="Statistics"
        />

        <MenuCard
          onPress={() => navigation.navigate(AppRoutes.THEMES)}
          subtitle="Classic, Ocean, Forest, and more"
          theme={theme}
          title="Themes"
        />

        <MenuCard
          onPress={() => navigation.navigate(AppRoutes.SETTINGS)}
          subtitle="Sound, haptics, and preferences"
          theme={theme}
          title="Settings"
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.muted }]}>
            Remove Ads (coming soon)
          </Text>
          <Text style={[styles.footerText, { color: theme.muted }]}>
            v{APP_VERSION}
          </Text>
        </View>
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
    paddingBottom: 32,
  },
  streak: {
    fontSize: 14,
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  footerText: {
    fontSize: 12,
  },
})
