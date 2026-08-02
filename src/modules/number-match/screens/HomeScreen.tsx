import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { APP_VERSION } from '@modules/number-match/constants/storage'
import { SPACING, RADIUS, TYPE } from '@modules/number-match/constants/tokens'
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
  const currentStreak = useStatsStore(state => state.currentStreak)
  const rewardedCoinAd = useRewardedCoinAd()
  const [showHowToPlay, setShowHowToPlay] = useState(false)

  const canResume = Boolean(savedGame && savedGame.status === 'playing')
  const tilesLeft = savedGame
    ? savedGame.tiles.filter(tile => !tile.removed).length
    : 0

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
              <Icon color={theme.warm.ink} name="flame" size={17} />
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
              <Icon color={theme.support.ink} name="settings" size={17} />
            </Pressable>
          </View>
        </View>

        <View style={styles.logoWrap}>
          <GameLogo theme={theme} />
        </View>

        <TileStrip theme={theme} />

        <View style={styles.actions}>
          {canResume ? (
            <PrimaryButton
              label={`Continue · ${savedGame!.score.toLocaleString()} pts`}
              onPress={() => navigation.navigate(AppRoutes.GAMEPLAY)}
              subtitle={`${tilesLeft} ${tilesLeft === 1 ? 'tile' : 'tiles'} left`}
              theme={theme}
              variant="primary"
            />
          ) : null}

          <PrimaryButton
            label="New game"
            onPress={() =>
              navigation.navigate(AppRoutes.GAMEPLAY, { newGame: true })
            }
            theme={theme}
            variant={canResume ? 'secondary' : 'primary'}
          />
        </View>

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

        <Text style={[styles.version, { color: theme.muted }]}>
          v{APP_VERSION}
        </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topActions: {
    flexDirection: 'row',
    gap: SPACING.sm + 2,
  },
  circleButton: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  logoWrap: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  actions: {
    gap: SPACING.sm + 2,
  },
  chipRow: {
    flexDirection: 'row',
    gap: SPACING.sm + 2,
  },
  version: {
    ...TYPE.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  navWrap: {
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.94 }],
  },
})
