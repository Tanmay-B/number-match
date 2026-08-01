import { addLines } from './AddLinesEngine'
import { canMatchTiles } from './MatchValidator'
import { calculateMatchScore } from './ScoreCalculator'
import type { GameState, GameStatus, Tile } from './types'

export function findTile(state: GameState, tileId: string): Tile | undefined {
  return state.tiles.find(tile => tile.id === tileId && !tile.removed)
}

export function hasAvailableMoves(state: GameState): boolean {
  const active = state.tiles.filter(tile => !tile.removed)

  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      if (canMatchTiles(state, active[i]!, active[j]!)) {
        return true
      }
    }
  }

  return false
}

export function canAddLines(state: GameState): boolean {
  return state.tiles.some(tile => tile.removed)
}

export function evaluateGameStatus(state: GameState): GameStatus {
  const activeCount = state.tiles.filter(tile => !tile.removed).length

  if (activeCount === 0) {
    return 'won'
  }

  if (hasAvailableMoves(state)) {
    return 'playing'
  }

  if (canAddLines(state)) {
    return 'playing'
  }

  return 'lost'
}

export function applyTileSelection(state: GameState, tileId: string): GameState {
  const tile = findTile(state, tileId)
  if (!tile) {
    return state
  }

  const selectedTileIds = [...state.selectedTileIds]

  if (selectedTileIds.includes(tileId)) {
    return {
      ...state,
      selectedTileIds: selectedTileIds.filter(id => id !== tileId),
    }
  }

  if (selectedTileIds.length === 0) {
    return { ...state, selectedTileIds: [tileId] }
  }

  if (selectedTileIds.length === 1) {
    const firstTile = findTile(state, selectedTileIds[0]!)
    if (!firstTile) {
      return { ...state, selectedTileIds: [tileId] }
    }

    if (canMatchTiles(state, firstTile, tile)) {
      const tiles = state.tiles.map(current =>
        current.id === firstTile.id || current.id === tile.id
          ? { ...current, removed: true }
          : current,
      )

      const moves = state.moves + 1
      const comboCount = moves
      const score =
        state.score + calculateMatchScore(firstTile, tile, comboCount)

      const nextState: GameState = {
        ...state,
        tiles,
        selectedTileIds: [],
        moves,
        score,
        status: 'playing',
      }

      return {
        ...nextState,
        status: evaluateGameStatus(nextState),
      }
    }

    return { ...state, selectedTileIds: [tileId] }
  }

  return { ...state, selectedTileIds: [tileId] }
}

export function applyAddLines(state: GameState): GameState {
  const next = addLines(state)
  if (!next) {
    return state
  }

  return {
    ...next,
    status: evaluateGameStatus(next),
  }
}
