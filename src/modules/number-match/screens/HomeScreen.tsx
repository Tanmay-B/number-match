import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { GAME_TAGLINE } from '@modules/number-match/constants/gameCopy'
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

/**
 * A gap from the design, expressed as a flex weight.
 *
 * The design is a content-height card; a phone has roughly 200pt more to fill.
 * Weighting each gap by its designed size means that surplus is shared out in
 * the design's own 16/20/16/10/16/10 rhythm rather than pooling in one place.
 * `minHeight` keeps the designed spacing intact when there is no surplus to
 * share, at which point the page simply scrolls.
 */
function Gap({ size }: { size: number }) {
  return <View style={{ flex: size, minHeight: scale(size) }} />
}

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

        <Gap size={16} />
        {/* Tagline sits with the logo as one block, so the gap below stays
            the spacing the design puts between the title and the strip. */}
        <View style={styles.logoBlock}>
          <GameLogo theme={theme} />
          <Text style={[styles.tagline, { color: theme.muted }]}>
            {GAME_TAGLINE}
          </Text>
        </View>

        <Gap size={20} />
        <TileStrip theme={theme} />

        <Gap size={16} />
        {canResume ? (
          <>
            <PrimaryButton
              label={`Continue · level ${level}`}
              onPress={() => navigation.navigate(AppRoutes.GAMEPLAY)}
              theme={theme}
              variant="primary"
            />
            <Gap size={10} />
          </>
        ) : null}

        <PrimaryButton
          label="New game"
          onPress={() =>
            navigation.navigate(AppRoutes.GAMEPLAY, { newGame: true })
          }
          theme={theme}
          variant={canResume ? 'secondary' : 'primary'}
        />

        <Gap size={16} />
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

        <Gap size={10} />
        {/*
          Deliberately stays at full strength while an ad is still loading —
          dimming it made the row look broken for the seconds before the SDK
          reports ready. It only greys out once the daily cap is actually spent.
        */}
        <ChipRow
          disabled={!rewardedCoinAd.canWatch}
          icon="play"
          label={`Watch ad for ${rewardedCoinAd.rewardAmount} coins`}
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
 * Every measurement is the design's own value put through `scale()`, so the
 * proportions hold on any screen width. Vertical gaps live in `Gap` above.
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
  logoBlock: {
    alignItems: 'center',
    gap: scale(8),
  },
  tagline: {
    fontSize: scale(14),
    fontWeight: '400',
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    gap: scale(10),
  },
  navWrap: {
    paddingBottom: scale(10),
    paddingHorizontal: scale(18),
    paddingTop: scale(18),
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.94 }],
  },
})
