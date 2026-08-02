import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Board } from '@modules/number-match/components/Board'
import { GameHud } from '@modules/number-match/components/GameHud'
import { GamePopup } from '@modules/number-match/components/GamePopup'
import type { MatchPath } from '@modules/number-match/components/MatchPathOverlay'
import { PauseMenu } from '@modules/number-match/components/PauseMenu'
import { PowerUpButton } from '@modules/number-match/components/PowerUpButton'
import { PowerUpOfferModal } from '@modules/number-match/components/PowerUpOfferModal'
import {
  StuckBanner,
  STUCK_BANNER_HEIGHT,
} from '@modules/number-match/components/StuckBanner'
import { WatchAdButton } from '@modules/number-match/components/WatchAdButton'
import { createNewGame } from '@modules/number-match/engine/BoardGenerator'
import { findHintPair } from '@modules/number-match/engine/HintEngine'
import {
  applyAddLines as applyAddLinesMove,
  applyTileSelection,
  evaluateGameStatus,
  hasAvailableMoves,
} from '@modules/number-match/engine/MoveCalculator'
import {
  getPowerUpAvailability,
  isCoinBlocked,
  needsCoinTopUp,
  type PowerUpId,
} from '@modules/number-match/engine/PowerUpAvailability'
import {
  getBoardsUntilNextStep,
  getGridLabel,
  getGridSizeForBoardsCompleted,
} from '@modules/number-match/engine/DifficultyManager'
import { calculateVictoryCoins } from '@modules/number-match/engine/ScoreCalculator'
import { shuffleActiveTiles } from '@modules/number-match/engine/ShuffleEngine'
import type { GameState } from '@modules/number-match/engine/types'
import { COIN_COSTS } from '@modules/number-match/constants/storage'
import { SPACING } from '@modules/number-match/constants/tokens'
import { useRewardedCoinAd } from '@infra/ads/RewardedAdProvider'
import { useVictoryInterstitial } from '@infra/ads/useVictoryInterstitial'
import { useAppTheme } from '@global/hooks/useAppTheme'
import { awardBoardCoins, useGameStore } from '@store/game.store'
import { useSettingsStore } from '@store/settings.store'
import { useStatsStore } from '@store/stats.store'
import { AppRoutes, AppStackParams } from '@router/routes'

type Props = NativeStackScreenProps<AppStackParams, AppRoutes.GAMEPLAY>

type PowerUpModal = 'hint' | 'addLines' | null

/** How long the connect-the-match line stays on screen after a match. */
const MATCH_PATH_LINGER_MS = 700

export function GameplayScreen({ navigation, route }: Props) {
  const { theme, isDark, toggleThemeMode } = useAppTheme()
  const game = useGameStore(state => state.game)
  const coins = useGameStore(state => state.coins)
  const coinSpendTick = useGameStore(state => state.coinSpendTick)
  const setGame = useGameStore(state => state.setGame)
  const setStatus = useGameStore(state => state.setStatus)
  const addCoins = useGameStore(state => state.addCoins)
  const spendCoins = useGameStore(state => state.spendCoins)
  const recordMove = useStatsStore(state => state.recordMove)
  const recordWin = useStatsStore(state => state.recordWin)
  const recordGamePlayed = useStatsStore(state => state.recordGamePlayed)
  const recordHint = useStatsStore(state => state.recordHint)
  const bestScore = useStatsStore(state => state.bestScore)
  const gamesWon = useStatsStore(state => state.gamesWon)
  const [history, setHistory] = useState<GameState[]>([])
  const [hintedTileIds, setHintedTileIds] = useState<string[]>([])
  const [lastSpentPowerUp, setLastSpentPowerUp] = useState<PowerUpId | null>(null)
  const [paused, setPaused] = useState(false)
  const [powerUpModal, setPowerUpModal] = useState<PowerUpModal>(null)
  const [matchPath, setMatchPath] = useState<MatchPath | null>(null)
  const matchTokenRef = useRef(0)
  const matchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const soundEnabled = useSettingsStore(state => state.soundEnabled)
  const musicEnabled = useSettingsStore(state => state.musicEnabled)
  const hapticsEnabled = useSettingsStore(state => state.hapticsEnabled)
  const setSoundEnabled = useSettingsStore(state => state.setSoundEnabled)
  const setMusicEnabled = useSettingsStore(state => state.setMusicEnabled)
  const setHapticsEnabled = useSettingsStore(state => state.setHapticsEnabled)
  const rewardedRef = useRef<string | null>(null)

  const rewardedCoinAd = useRewardedCoinAd()
  const { showAfterVictory } = useVictoryInterstitial()

  useEffect(
    () => () => {
      if (matchTimerRef.current) {
        clearTimeout(matchTimerRef.current)
      }
    },
    [],
  )

  const clearMatchPath = useCallback(() => {
    if (matchTimerRef.current) {
      clearTimeout(matchTimerRef.current)
      matchTimerRef.current = null
    }
    setMatchPath(null)
  }, [])

  const resetHistory = useCallback(() => {
    setHistory([])
    setHintedTileIds([])
    rewardedRef.current = null
  }, [])

  const maybeSpend = useCallback(
    (cost: number, freeWhenStuck = false, powerUpId?: PowerUpId) => {
      if (freeWhenStuck) {
        return true
      }

      if (coins >= cost) {
        spendCoins(cost)
        if (powerUpId) {
          setLastSpentPowerUp(powerUpId)
        }
        return true
      }

      return false
    },
    [coins, spendCoins],
  )

  // Mirrors `game` so the tile press handler can stay referentially stable.
  // TileView is memoised on its props, and a handler that changed every render
  // would re-render all 16 tiles on every store update.
  const gameRef = useRef(game)
  useEffect(() => {
    gameRef.current = game
  }, [game])

  const commitGame = useCallback(
    (next: GameState) => {
      if (game) {
        setHistory(current => [...current.slice(-19), game])
      }
      setGame(next)
      setHintedTileIds([])
    },
    [game, setGame],
  )

  /**
   * Starts a board at the size the player's cleared-board count has earned.
   * Read from the store rather than a subscribed value so that winning a board
   * cannot retrigger the focus effect below and deal a fresh one.
   */
  const startNewRound = useCallback(
    (gridSize?: number) => {
      const size =
        gridSize ??
        getGridSizeForBoardsCompleted(useStatsStore.getState().gamesWon)

      resetHistory()
      clearMatchPath()
      recordGamePlayed()
      setGame(createNewGame(size))
      setStatus('playing')
    },
    [clearMatchPath, recordGamePlayed, resetHistory, setGame, setStatus],
  )

  const finishVictoryAction = useCallback(
    (action: () => void) => {
      showAfterVictory()
      action()
    },
    [showAfterVictory],
  )

  useFocusEffect(
    useCallback(() => {
      if (route.params?.newGame) {
        startNewRound()
        navigation.setParams({ newGame: undefined })
        return
      }

      if (!useGameStore.getState().game) {
        startNewRound()
      }
    }, [navigation, route.params?.newGame, startNewRound]),
  )

  useEffect(() => {
    if (!game || game.status !== 'playing') {
      return
    }

    const status = evaluateGameStatus(game)
    if (status === 'lost') {
      setGame({ ...game, status: 'lost' })
      setStatus('lost')
    }
  }, [game, setGame, setStatus])

  useEffect(() => {
    if (!game || game.status !== 'won') {
      return
    }

    const rewardKey = `${game.score}-${game.moves}-${game.gridSize}`
    if (rewardedRef.current === rewardKey) {
      return
    }

    rewardedRef.current = rewardKey
    recordWin(game.score)
    addCoins(awardBoardCoins() + calculateVictoryCoins(game.gridSize, game.moves))
    setStatus('won')
  }, [addCoins, game, recordWin, setStatus])

  const isStuck = game?.status === 'playing' ? !hasAvailableMoves(game) : false

  const powerUpContext = {
    coins,
    historyLength: history.length,
    isStuck,
  }

  const undoState = game
    ? getPowerUpAvailability('undo', game, powerUpContext)
    : null
  const hintState = game
    ? getPowerUpAvailability('hint', game, powerUpContext)
    : null
  const shuffleState = game
    ? getPowerUpAvailability('shuffle', game, powerUpContext)
    : null
  const addLinesState = game
    ? getPowerUpAvailability('addLines', game, powerUpContext)
    : null

  const showWatchAd =
    needsCoinTopUp(coins, isStuck) ||
    [undoState, hintState, shuffleState, addLinesState].some(isCoinBlocked)

  const handleTilePress = useCallback(
    (tileId: string) => {
      const current = gameRef.current
      if (!current || current.status !== 'playing') {
        return
      }

      const next = applyTileSelection(current, tileId)
      if (next === current) {
        return
      }

      if (next.moves > current.moves) {
        recordMove()

        // The pair that just matched is the previously selected tile plus the
        // one tapped now. Capture their cells before the board re-renders.
        const firstId = current.selectedTileIds[0]
        const first = current.tiles.find(tile => tile.id === firstId)
        const second = current.tiles.find(tile => tile.id === tileId)

        if (first && second) {
          matchTokenRef.current += 1
          setMatchPath({
            a: { row: first.row, col: first.col },
            b: { row: second.row, col: second.col },
            token: matchTokenRef.current,
          })

          if (matchTimerRef.current) {
            clearTimeout(matchTimerRef.current)
          }
          matchTimerRef.current = setTimeout(() => {
            setMatchPath(null)
            matchTimerRef.current = null
          }, MATCH_PATH_LINGER_MS)
        }
      }

      setHistory(history => [...history.slice(-19), current])
      setGame(next)
      setHintedTileIds([])
    },
    [recordMove, setGame],
  )

  const applyHint = useCallback(() => {
    if (!game || game.status !== 'playing') {
      return false
    }

    const pair = findHintPair(game)
    if (!pair) {
      return false
    }

    recordHint()
    setHintedTileIds([pair.tileAId, pair.tileBId])
    setGame({ ...game, selectedTileIds: [pair.tileAId, pair.tileBId] })
    return true
  }, [game, recordHint, setGame])

  const performAddLines = useCallback(() => {
    if (!game || game.status !== 'playing') {
      return false
    }

    commitGame(applyAddLinesMove(game))
    return true
  }, [commitGame, game])

  const handleUndo = useCallback(() => {
    if (!game || game.status !== 'playing' || !undoState?.enabled) {
      return
    }

    const previous = history[history.length - 1]
    if (!previous || !maybeSpend(COIN_COSTS.undo, isStuck, 'undo')) {
      return
    }

    clearMatchPath()
    setHistory(current => current.slice(0, -1))
    setGame({ ...previous, selectedTileIds: [] })
    setHintedTileIds([])
  }, [
    clearMatchPath,
    game,
    history,
    isStuck,
    maybeSpend,
    setGame,
    undoState?.enabled,
  ])

  const handleHint = useCallback(() => {
    if (!game || game.status !== 'playing' || !hintState) {
      return
    }

    if (!findHintPair(game)) {
      return
    }

    if (hintState.enabled && (hintState.cost === 'free' || coins >= COIN_COSTS.hint)) {
      if (maybeSpend(COIN_COSTS.hint, isStuck, 'hint')) {
        applyHint()
      }
      return
    }

    setPowerUpModal('hint')
  }, [applyHint, coins, game, hintState, isStuck, maybeSpend])

  const handleHintWithCoins = useCallback(() => {
    if (!maybeSpend(COIN_COSTS.hint, isStuck, 'hint')) {
      return
    }

    applyHint()
    setPowerUpModal(null)
  }, [applyHint, isStuck, maybeSpend])

  const handleHintWithAd = useCallback(() => {
    rewardedCoinAd.watchAd({
      grantCoins: false,
      onReward: () => {
        applyHint()
        setPowerUpModal(null)
      },
    })
  }, [applyHint, rewardedCoinAd])

  const handleShuffle = useCallback(() => {
    if (!game || game.status !== 'playing' || !shuffleState?.enabled) {
      return
    }

    const activeCount = game.tiles.filter(tile => !tile.removed).length
    if (activeCount < 2 || !maybeSpend(COIN_COSTS.shuffle, isStuck, 'shuffle')) {
      return
    }

    clearMatchPath()
    const shuffled = shuffleActiveTiles(game)
    commitGame({
      ...shuffled,
      status: evaluateGameStatus(shuffled),
    })
  }, [
    clearMatchPath,
    commitGame,
    game,
    isStuck,
    maybeSpend,
    shuffleState?.enabled,
  ])

  const handleAddLines = useCallback(() => {
    if (!game || game.status !== 'playing' || !addLinesState) {
      return
    }

    if (
      addLinesState.enabled &&
      (addLinesState.cost === 'free' || coins >= COIN_COSTS.addLines)
    ) {
      if (maybeSpend(COIN_COSTS.addLines, isStuck, 'addLines')) {
        performAddLines()
      }
      return
    }

    setPowerUpModal('addLines')
  }, [addLinesState, coins, game, isStuck, maybeSpend, performAddLines])

  const handleAddLinesWithCoins = useCallback(() => {
    if (!maybeSpend(COIN_COSTS.addLines, isStuck, 'addLines')) {
      return
    }

    performAddLines()
    setPowerUpModal(null)
  }, [isStuck, maybeSpend, performAddLines])

  const handleAddLinesWithAd = useCallback(() => {
    rewardedCoinAd.watchAd({
      grantCoins: false,
      onReward: () => {
        performAddLines()
        setPowerUpModal(null)
      },
    })
  }, [performAddLines, rewardedCoinAd])

  const handleContinueWithAd = useCallback(() => {
    if (!game) {
      return
    }

    rewardedCoinAd.watchAd({
      grantCoins: false,
      onReward: () => {
        const next = applyAddLinesMove({ ...game, status: 'playing' })
        setGame(next)
        setStatus('playing')
        setHintedTileIds([])
      },
    })
  }, [game, rewardedCoinAd, setGame, setStatus])

  const canContinueWithAd =
    game?.status === 'lost' &&
    rewardedCoinAd.canWatch &&
    rewardedCoinAd.isLoaded

  if (!game) {
    return (
      <SafeAreaView
        style={[styles.container, styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary.bg} size="large" />
      </SafeAreaView>
    )
  }

  const tilesRemaining = game.tiles.filter(tile => !tile.removed).length

  // `gamesWon` already counts the board just cleared, so this is the size the
  // next one will be dealt at.
  const nextGridSize = getGridSizeForBoardsCompleted(gamesWon)
  const boardsToNextStep = getBoardsUntilNextStep(gamesWon)
  const victoryBody =
    nextGridSize > game.gridSize
      ? `The board steps up to ${getGridLabel(nextGridSize)}.`
      : boardsToNextStep > 0
        ? `${boardsToNextStep} more ${
            boardsToNextStep === 1 ? 'board' : 'boards'
          } until ${getGridLabel(nextGridSize + 1)}.`
        : undefined

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <GameHud
        best={bestScore}
        coins={coins}
        gridLabel={getGridLabel(game.gridSize)}
        moves={game.moves}
        onAddCoins={rewardedCoinAd.watchAd}
        onPause={() => setPaused(true)}
        score={game.score}
        theme={theme}
        tilesRemaining={tilesRemaining}
        totalTiles={game.tiles.length}
      />

      {/*
        Permanently reserved slot. The banner comes and goes inside it, so the
        board never moves under the player's finger. The board is sized from
        screen width, so holding this space back costs nothing but slack.
      */}
      <View style={styles.bannerSlot}>
        {isStuck && game.status === 'playing' ? (
          <StuckBanner restoreCount={game.gridSize} theme={theme} />
        ) : null}
      </View>

      <View style={styles.stage}>
        <Board
          game={game}
          hintedTileIds={hintedTileIds}
          matchPath={matchPath}
          onTilePress={handleTilePress}
          theme={theme}
        />

        {showWatchAd ? (
          <View pointerEvents="box-none" style={styles.adPillWrap}>
            <WatchAdButton
              canWatch={rewardedCoinAd.canWatch}
              dailyCap={rewardedCoinAd.dailyCap}
              isLoaded={rewardedCoinAd.isLoaded}
              isLoading={rewardedCoinAd.isLoading}
              onPress={rewardedCoinAd.watchAd}
              remainingToday={rewardedCoinAd.remainingToday}
              rewardAmount={rewardedCoinAd.rewardAmount}
              theme={theme}
              variant="pill"
            />
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <PowerUpButton
          cost={undoState?.cost ?? COIN_COSTS.undo}
          dimmed={isStuck}
          disabled={!undoState?.enabled}
          disabledReason={undoState?.reason}
          disabledReasonCost={undoState?.reasonCost}
          label="Undo"
          onPress={handleUndo}
          spinKey={lastSpentPowerUp === 'undo' ? coinSpendTick : 0}
          theme={theme}
        />
        <PowerUpButton
          cost={hintState?.cost ?? COIN_COSTS.hint}
          dimmed={isStuck}
          disabled={!hintState?.enabled && hintState?.reasonCost === undefined}
          disabledReason={hintState?.reason}
          disabledReasonCost={hintState?.reasonCost}
          label="Hint"
          onPress={handleHint}
          spinKey={lastSpentPowerUp === 'hint' ? coinSpendTick : 0}
          theme={theme}
        />
        <PowerUpButton
          cost={shuffleState?.cost ?? COIN_COSTS.shuffle}
          dimmed={isStuck}
          disabled={!shuffleState?.enabled}
          disabledReason={shuffleState?.reason}
          disabledReasonCost={shuffleState?.reasonCost}
          label="Shuffle"
          onPress={handleShuffle}
          spinKey={lastSpentPowerUp === 'shuffle' ? coinSpendTick : 0}
          theme={theme}
        />
        <PowerUpButton
          badgeText={isStuck ? `+${game.gridSize}` : undefined}
          cost={addLinesState?.cost ?? COIN_COSTS.addLines}
          disabled={
            !addLinesState?.enabled &&
            addLinesState?.reasonCost === undefined &&
            !isStuck
          }
          disabledReason={addLinesState?.reason}
          disabledReasonCost={addLinesState?.reasonCost}
          highlight={isStuck}
          label={isStuck ? 'Add Lines!' : 'Add Lines'}
          onPress={handleAddLines}
          spinKey={lastSpentPowerUp === 'addLines' ? coinSpendTick : 0}
          theme={theme}
        />
      </View>

      {game.status === 'won' ? (
        <GamePopup
          body={victoryBody}
          icon="crown"
          onPrimaryPress={() => finishVictoryAction(() => startNewRound())}
          onSecondaryPress={() =>
            finishVictoryAction(() => navigation.navigate(AppRoutes.HOME))
          }
          primaryLabel="Next Board"
          secondaryLabel="Home"
          stats={[
            { label: 'Score', value: game.score },
            { label: 'Moves', value: game.moves },
          ]}
          theme={theme}
          title="Board cleared!"
        />
      ) : null}

      {game.status === 'lost' ? (
        <GamePopup
          body="No valid moves remain."
          icon="puzzle"
          onPrimaryPress={() => startNewRound(game.gridSize)}
          onSecondaryPress={() => navigation.navigate(AppRoutes.HOME)}
          onTertiaryPress={canContinueWithAd ? handleContinueWithAd : undefined}
          primaryLabel="Restart"
          primaryVariant="secondary"
          secondaryLabel="Home"
          stats={[
            { label: 'Score', value: game.score },
            { label: 'Best', value: bestScore },
          ]}
          tertiaryLabel={canContinueWithAd ? 'Continue · Watch Ad' : undefined}
          theme={theme}
          title="Game over"
        />
      ) : null}

      {paused ? (
        <PauseMenu
          hapticsEnabled={hapticsEnabled}
          isDark={isDark}
          musicEnabled={musicEnabled}
          onHome={() => {
            setPaused(false)
            navigation.navigate(AppRoutes.HOME)
          }}
          onResume={() => setPaused(false)}
          onToggleDark={() => toggleThemeMode()}
          onToggleHaptics={setHapticsEnabled}
          onToggleMusic={setMusicEnabled}
          onToggleSound={setSoundEnabled}
          soundEnabled={soundEnabled}
          theme={theme}
        />
      ) : null}

      {powerUpModal === 'hint' ? (
        <PowerUpOfferModal
          body="Reveal a valid pair on the board."
          canUseCoins={coins >= COIN_COSTS.hint || isStuck}
          canWatchAd={rewardedCoinAd.canWatch}
          cost={hintState?.cost ?? COIN_COSTS.hint}
          icon="bulb"
          isAdLoaded={rewardedCoinAd.isLoaded}
          onClose={() => setPowerUpModal(null)}
          onUseCoins={handleHintWithCoins}
          onWatchAd={handleHintWithAd}
          theme={theme}
          title="Hint"
        />
      ) : null}

      {powerUpModal === 'addLines' ? (
        <PowerUpOfferModal
          body={`Restores ${game.gridSize} numbers to keep you playing.`}
          canUseCoins={coins >= COIN_COSTS.addLines || isStuck}
          canWatchAd={rewardedCoinAd.canWatch}
          cost={addLinesState?.cost ?? COIN_COSTS.addLines}
          icon="plus"
          isAdLoaded={rewardedCoinAd.isLoaded}
          onClose={() => setPowerUpModal(null)}
          onUseCoins={handleAddLinesWithCoins}
          onWatchAd={handleAddLinesWithAd}
          theme={theme}
          title="Add Lines"
        />
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  bannerSlot: {
    height: STUCK_BANNER_HEIGHT,
    justifyContent: 'center',
  },
  adPillWrap: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    justifyContent: 'space-between',
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
  },
})
