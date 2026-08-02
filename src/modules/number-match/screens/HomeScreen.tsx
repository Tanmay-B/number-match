import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RADIUS } from '@modules/number-match/constants/tokens'
import { BottomNav } from '@modules/number-match/components/BottomNav'
import { ChipCard, ChipRow } from '@modules/number-match/components/ChipCard'
import { CoinBadge } from '@modules/number-match/components/CoinBadge'
import { ConfettiDots } from '@modules/number-match/components/ConfettiDots'
import { GameLogo } from '@modules/number-match/components/GameLogo'
import { HowToPlayModal } from '@modules/number-match/components/HowToPlayModal'
import { Icon } from '@modules/number-match/components/Icon'
import { PrimaryButton } from '@modules/number-match/components/PrimaryButton'
import { TileStrip } from '@modules/number-match/components/TileStrip'
import { useRewardedCoinAd } from '@infra/ads/useRewardedCoinAd'
import { useAppTheme } from '@global/hooks/useAppTheme'
import { useGameStore } from '@store/game.store'
import { useStatsStore } from '@store/stats.store'
import { AppRoutes, AppStackParams } from '@router/routes'

type Props = NativeStackScreenProps<AppStackParams, AppRoutes.HOME>

export function HomeScreen({ navigation }: Props) {
  const { theme } = useAppTheme()
  const coins = useGameStore(state => state.coins)
  const savedGame = useGameStore(state => state.game)
  const gamesWon = useStatsStore(state => state.gamesWon)
  const currentStreak = useStatsStore(state => state.currentStreak)
  const rewardedCoinAd = useRewardedCoinAd()
  const [showHowToPlay, setShowHowToPlay] = useState(false)

  const canResume = Boolean(savedGame && savedGame.status === 'playing')
  // The board you are on is one past every board you have cleared.
  const level = gamesWon + 1

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ConfettiDots theme={theme} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <CoinBadge
            coins={coins}
            onAddPress={rewardedCoinAd.watchAd}
            theme={theme}
          />

          <View style={styles.topActions}>
            <Pressable
              accessibilityLabel={`Streak: ${currentStreak} days`}
              accessibilityRole="button"
              onPress={() => navigation.navigate(AppRoutes.STATISTICS)}
              style={({ pressed }) => [
                styles.circleButton,
                { backgroundColor: theme.warm.bg },
                pressed && styles.pressed,
              ]}>
              <Icon color={theme.warm.ink} name="flame" size={16} />
            </Pressable>
            <Pressable
              accessibilityLabel="Settings"
              accessibilityRole="button"
              onPress={() => navigation.navigate(AppRoutes.SETTINGS)}
              style={({ pressed }) => [
                styles.circleButton,
                { backgroundColor: theme.support.bg },
                pressed && styles.pressed,
              ]}>
              <Icon color={theme.support.ink} name="settings" size={16} />
            </Pressable>
          </View>
        </View>

        <View style={styles.logoWrap}>
          <GameLogo theme={theme} />
        </View>

        <View style={styles.stripWrap}>
          <TileStrip theme={theme} />
        </View>

        {canResume ? (
          <PrimaryButton
            label={`Continue · level ${level}`}
            onPress={() => navigation.navigate(AppRoutes.GAMEPLAY)}
            style={styles.continueButton}
            theme={theme}
            variant="primary"
          />
        ) : null}

        <PrimaryButton
          label="New game"
          onPress={() =>
            navigation.navigate(AppRoutes.GAMEPLAY, { newGame: true })
          }
          style={styles.newGameButton}
          theme={theme}
          variant={canResume ? 'secondary' : 'primary'}
        />

        <View style={styles.chipRow}>
          <ChipCard
            icon="infoCircle"
            label="How to play"
            onPress={() => setShowHowToPlay(true)}
            role={theme.support}
          />
          <ChipCard
            icon="gift"
            label="Daily reward"
            onPress={() => {}}
            role={theme.accentAlt}
          />
        </View>

        <ChipRow
          disabled={!rewardedCoinAd.canWatch || !rewardedCoinAd.isLoaded}
          icon="play"
          label={
            rewardedCoinAd.isLoading
              ? 'Loading ad…'
              : `Watch ad for ${rewardedCoinAd.rewardAmount} coins`
          }
          meta={
            rewardedCoinAd.canWatch
              ? `${rewardedCoinAd.remainingToday}/${rewardedCoinAd.dailyCap} left`
              : 'Limit reached'
          }
          onPress={rewardedCoinAd.watchAd}
          role={theme.accent}
        />
      </ScrollView>

      <View style={styles.navWrap}>
        <BottomNav
          active="home"
          onNavigate={route => navigation.navigate(route)}
          theme={theme}
        />
      </View>

      {showHowToPlay ? (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} theme={theme} />
      ) : null}
    </SafeAreaView>
  )
}

// Vertical rhythm is taken straight from the design rather than a uniform gap.
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
  },
  circleButton: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stripWrap: {
    marginBottom: 16,
  },
  continueButton: {
    marginBottom: 10,
  },
  newGameButton: {
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  navWrap: {
    paddingBottom: 10,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.94 }],
  },
})
