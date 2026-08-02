import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RADIUS, scale } from '@modules/number-match/constants/tokens'
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
              <Icon color={theme.warm.ink} name="flame" size={scale(16)} />
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
              <Icon color={theme.support.ink} name="settings" size={scale(16)} />
            </Pressable>
          </View>
        </View>

        {/*
          The hero absorbs whatever vertical space is left over, so the page
          fills the viewport on a tall phone instead of stacking against the
          top edge, and still scrolls if a short one runs out of room.
        */}
        <View style={styles.hero}>
          <GameLogo theme={theme} />
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

/**
 * Every measurement here is the value from the design, put through `scale()`
 * so the proportions hold on any screen width. The only departure is the hero,
 * which stretches to soak up leftover height on a tall phone rather than
 * leaving the page stacked against the top edge.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: scale(18),
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(16),
  },
  topActions: {
    flexDirection: 'row',
    gap: scale(10),
  },
  circleButton: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: scale(32),
    justifyContent: 'center',
    width: scale(32),
  },
  hero: {
    alignItems: 'stretch',
    flex: 1,
    gap: scale(20),
    justifyContent: 'center',
    marginBottom: scale(16),
  },
  continueButton: {
    marginBottom: scale(10),
  },
  newGameButton: {
    marginBottom: scale(16),
  },
  chipRow: {
    flexDirection: 'row',
    gap: scale(10),
    marginBottom: scale(10),
  },
  navWrap: {
    paddingBottom: scale(10),
    paddingHorizontal: scale(18),
    paddingTop: scale(10),
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.94 }],
  },
})
