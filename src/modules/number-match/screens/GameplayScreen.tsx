import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Board } from '@modules/number-match/components/Board'
import { GamePopup } from '@modules/number-match/components/GamePopup'
import { PrimaryButton } from '@modules/number-match/components/PrimaryButton'
import { CoinBadge } from '@modules/number-match/components/ScreenHeader'
import { createNewGame } from '@modules/number-match/engine/BoardGenerator'
import { findHintPair } from '@modules/number-match/engine/HintEngine'
import {
  applyAddLines,
  applyTileSelection,
  canAddLines,
  evaluateGameStatus,
  hasAvailableMoves,
} from '@modules/number-match/engine/MoveCalculator'
import { calculateVictoryCoins } from '@modules/number-match/engine/ScoreCalculator'
import { shuffleActiveTiles } from '@modules/number-match/engine/ShuffleEngine'
import type { GameState } from '@modules/number-match/engine/types'
import { COIN_COSTS } from '@modules/number-match/constants/storage'
import { useAppTheme } from '@global/hooks/useAppTheme'
import { awardBoardCoins, useGameStore } from '@store/game.store'
import { useStatsStore } from '@store/stats.store'
import { AppRoutes, AppStackParams } from '@router/routes'

type Props = NativeStackScreenProps<AppStackParams, AppRoutes.GAMEPLAY>

export function GameplayScreen({ navigation, route }: Props) {
  const { theme } = useAppTheme()
  const game = useGameStore(state => state.game)
  const coins = useGameStore(state => state.coins)
  const setGame = useGameStore(state => state.setGame)
  const setStatus = useGameStore(state => state.setStatus)
  const addCoins = useGameStore(state => state.addCoins)
  const spendCoins = useGameStore(state => state.spendCoins)
  const recordMove = useStatsStore(state => state.recordMove)
  const recordWin = useStatsStore(state => state.recordWin)
  const recordGamePlayed = useStatsStore(state => state.recordGamePlayed)
  const recordHint = useStatsStore(state => state.recordHint)
  const [history, setHistory] = useState<GameState[]>([])
  const [hintedTileIds, setHintedTileIds] = useState<string[]>([])
  const rewardedRef = useRef<string | null>(null)

  const resetHistory = useCallback(() => {
    setHistory([])
    setHintedTileIds([])
    rewardedRef.current = null
  }, [])

  const maybeSpend = useCallback(
    (cost: number) => {
      if (coins >= cost) {
        spendCoins(cost)
        return true
      }

      return false
    },
    [coins, spendCoins],
  )

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

  const startNewRound = useCallback(
    (gridSize = 4) => {
      resetHistory()
      setGame(createNewGame(gridSize))
      setStatus('playing')
    },
    [resetHistory, setGame, setStatus],
  )

  useFocusEffect(
    useCallback(() => {
      if (route.params?.newGame) {
        recordGamePlayed()
        startNewRound(4)
        navigation.setParams({ newGame: undefined })
        return
      }

      if (!useGameStore.getState().game) {
        recordGamePlayed()
        startNewRound(4)
      }
    }, [navigation, recordGamePlayed, route.params?.newGame, startNewRound]),
  )

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

  const handleTilePress = useCallback(
    (tileId: string) => {
      if (!game || game.status !== 'playing') {
        return
      }

      const next = applyTileSelection(game, tileId)
      if (next.moves > game.moves) {
        recordMove()
      }
      commitGame(next)
    },
    [commitGame, game, recordMove],
  )

  const handleUndo = useCallback(() => {
    if (!game || game.status !== 'playing') {
      return
    }

    const previous = history[history.length - 1]
    if (!previous || !maybeSpend(COIN_COSTS.undo)) {
      return
    }

    setHistory(current => current.slice(0, -1))
    setGame({ ...previous, selectedTileIds: [] })
    setHintedTileIds([])
  }, [game, history, maybeSpend, setGame])

  const handleHint = useCallback(() => {
    if (!game || game.status !== 'playing') {
      return
    }

    const pair = findHintPair(game)
    if (!pair || !maybeSpend(COIN_COSTS.hint)) {
      return
    }

    recordHint()
    setHintedTileIds([pair.tileAId, pair.tileBId])
    setGame({ ...game, selectedTileIds: [pair.tileAId, pair.tileBId] })
  }, [game, maybeSpend, recordHint, setGame])

  const handleShuffle = useCallback(() => {
    if (!game || game.status !== 'playing') {
      return
    }

    const activeCount = game.tiles.filter(tile => !tile.removed).length
    if (activeCount < 2 || !maybeSpend(COIN_COSTS.shuffle)) {
      return
    }

    const shuffled = shuffleActiveTiles(game)
    commitGame({
      ...shuffled,
      status: evaluateGameStatus(shuffled),
    })
  }, [commitGame, game, maybeSpend])

  const handleAddLines = useCallback(() => {
    if (!game || game.status !== 'playing') {
      return
    }

    if (!canAddLines(game) || !maybeSpend(COIN_COSTS.addLines)) {
      return
    }

    commitGame(applyAddLines(game))
  }, [commitGame, game, maybeSpend])

  const canUndo = history.length > 0 && coins >= COIN_COSTS.undo
  const canHint = game ? findHintPair(game) !== null && coins >= COIN_COSTS.hint : false
  const activeTileCount = game?.tiles.filter(tile => !tile.removed).length ?? 0
  const canShuffle =
    activeTileCount >= 2 && coins >= COIN_COSTS.shuffle
  const canRestoreLines = game ? canAddLines(game) && coins >= COIN_COSTS.addLines : false
  const isStuck = game ? !hasAvailableMoves(game) : false

  if (!game) {
    return (
      <SafeAreaView
        style={[styles.container, styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.tileSelected} size="large" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <CoinBadge coins={coins} />
        <Text style={[styles.meta, { color: theme.text }]}>Moves {game.moves}</Text>
        <Text style={[styles.meta, { color: theme.text }]}>Score {game.score}</Text>
        <PrimaryButton
          label="Pause"
          onPress={() => navigation.navigate(AppRoutes.HOME)}
          style={styles.pauseButton}
          theme={theme}
          variant="ghost"
        />
      </View>

      {isStuck && game.status === 'playing' ? (
        <Text style={[styles.stuckBanner, { color: theme.muted }]}>
          No matches left — add a line or shuffle to continue.
        </Text>
      ) : null}

      <View style={styles.boardWrap}>
        <Board
          game={game}
          hintedTileIds={hintedTileIds}
          onTilePress={handleTilePress}
          theme={theme}
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          disabled={!canUndo}
          label="Undo"
          onPress={handleUndo}
          theme={theme}
          variant="secondary"
        />
        <PrimaryButton
          disabled={!canHint}
          label="Hint"
          onPress={handleHint}
          theme={theme}
          variant="secondary"
        />
        <PrimaryButton
          disabled={!canShuffle}
          label="Shuffle"
          onPress={handleShuffle}
          theme={theme}
          variant="secondary"
        />
        <PrimaryButton
          disabled={!canRestoreLines}
          label={isStuck ? 'Add Lines!' : 'Add Lines'}
          onPress={handleAddLines}
          theme={theme}
          variant="secondary"
        />
      </View>

      {game.status === 'won' ? (
        <GamePopup
          body={`You cleared the board in ${game.moves} moves.\nFinal score: ${game.score}`}
          onPrimaryPress={() => startNewRound(game.gridSize)}
          onSecondaryPress={() => navigation.navigate(AppRoutes.HOME)}
          primaryLabel="Play Again"
          secondaryLabel="Home"
          theme={theme}
          title="Victory!"
        />
      ) : null}

      {game.status === 'lost' ? (
        <GamePopup
          body={`No valid moves remain.\nFinal score: ${game.score}`}
          onPrimaryPress={() => startNewRound(game.gridSize)}
          onSecondaryPress={() => navigation.navigate(AppRoutes.HOME)}
          primaryLabel="Restart"
          secondaryLabel="Home"
          theme={theme}
          title="Game Over"
        />
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  meta: {
    fontSize: 14,
    fontWeight: '700',
  },
  stuckBanner: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  pauseButton: {
    minHeight: 40,
    paddingHorizontal: 12,
  },
  boardWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 12,
  },
})
