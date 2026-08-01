import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Board } from '@modules/number-match/components/Board'
import { PrimaryButton } from '@modules/number-match/components/PrimaryButton'
import { CoinBadge } from '@modules/number-match/components/ScreenHeader'
import { addLines } from '@modules/number-match/engine/AddLinesEngine'
import { createNewGame } from '@modules/number-match/engine/BoardGenerator'
import { findHintPair } from '@modules/number-match/engine/HintEngine'
import { applyTileSelection, hasAvailableMoves } from '@modules/number-match/engine/MoveCalculator'
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
  const [showVictory, setShowVictory] = useState(false)
  const [history, setHistory] = useState<GameState[]>([])

  const resetHistory = useCallback(() => {
    setHistory([])
  }, [])

  const maybeSpend = useCallback(
    (cost: number) => {
      if (coins >= cost) {
        spendCoins(cost)
      }
    },
    [coins, spendCoins],
  )

  const commitGame = useCallback(
    (next: GameState) => {
      if (game) {
        setHistory(current => [...current.slice(-19), game])
      }
      setGame(next)
    },
    [game, setGame],
  )

  useFocusEffect(
    useCallback(() => {
      if (route.params?.newGame) {
        recordGamePlayed()
        resetHistory()
        setGame(createNewGame(4))
        setShowVictory(false)
        navigation.setParams({ newGame: undefined })
        return
      }

      if (!useGameStore.getState().game) {
        recordGamePlayed()
        resetHistory()
        setGame(createNewGame(4))
        setShowVictory(false)
      }
    }, [navigation, recordGamePlayed, resetHistory, route.params?.newGame, setGame]),
  )

  useEffect(() => {
    if (game?.status === 'won') {
      setShowVictory(true)
      setStatus('won')
      recordWin(game.score)
      addCoins(awardBoardCoins() + calculateVictoryCoins(game.gridSize, game.moves))
    }
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
    if (!previous) {
      return
    }

    maybeSpend(COIN_COSTS.undo)
    setHistory(current => current.slice(0, -1))
    setGame({ ...previous, selectedTileIds: [] })
  }, [game, history, maybeSpend, setGame])

  const handleHint = useCallback(() => {
    if (!game || game.status !== 'playing') {
      return
    }

    const pair = findHintPair(game)
    if (!pair) {
      return
    }

    maybeSpend(COIN_COSTS.hint)
    recordHint()
    setGame({ ...game, selectedTileIds: [pair.tileAId, pair.tileBId] })
  }, [game, maybeSpend, recordHint, setGame])

  const handleShuffle = useCallback(() => {
    if (!game || game.status !== 'playing') {
      return
    }

    const activeCount = game.tiles.filter(tile => !tile.removed).length
    if (activeCount < 2) {
      return
    }

    maybeSpend(COIN_COSTS.shuffle)
    commitGame(shuffleActiveTiles(game))
  }, [commitGame, game, maybeSpend])

  const handleAddLines = useCallback(() => {
    if (!game || game.status !== 'playing') {
      return
    }

    const next = addLines(game)
    if (!next) {
      return
    }

    maybeSpend(COIN_COSTS.addLines)
    commitGame(next)
  }, [commitGame, game, maybeSpend])

  const canUndo = history.length > 0
  const canHint = game ? findHintPair(game) !== null : false
  const activeTileCount = game?.tiles.filter(tile => !tile.removed).length ?? 0
  const canShuffle = activeTileCount >= 2
  const canAddLines = (game?.tiles.some(tile => tile.removed) ?? false)
  const isStuck = game ? !hasAvailableMoves(game) : false

  if (!game) {
    return (
      <SafeAreaView style={[styles.container, styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.tileSelected} size="large" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <CoinBadge coins={coins} />
        <Text style={[styles.meta, { color: theme.text }]}>
          Moves {game.moves}
        </Text>
        <Text style={[styles.meta, { color: theme.text }]}>
          Score {game.score}
        </Text>
        <PrimaryButton
          label="Pause"
          onPress={() => navigation.navigate(AppRoutes.HOME)}
          style={styles.pauseButton}
          theme={theme}
          variant="ghost"
        />
      </View>

      <View style={styles.boardWrap}>
        <Board game={game} onTilePress={handleTilePress} theme={theme} />
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
          disabled={!canAddLines}
          label={isStuck ? 'Add Lines!' : 'Add Lines'}
          onPress={handleAddLines}
          theme={theme}
          variant="secondary"
        />
      </View>

      {showVictory ? (
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Victory!</Text>
            <Text style={[styles.modalBody, { color: theme.muted }]}>
              Score {game.score}
            </Text>
            <PrimaryButton
              label="Play Again"
              onPress={() => {
                setShowVictory(false)
                resetHistory()
                setGame(createNewGame(game.gridSize))
              }}
              theme={theme}
            />
            <PrimaryButton
              label="Home"
              onPress={() => navigation.navigate(AppRoutes.HOME)}
              style={styles.modalSecondary}
              theme={theme}
              variant="secondary"
            />
          </View>
        </View>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalSecondary: {
    marginTop: 4,
  },
})
