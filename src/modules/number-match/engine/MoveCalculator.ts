import { canMatchTiles } from './MatchValidator'
import type { GameState, Tile } from './types'

export function findTile(state: GameState, tileId: string): Tile | undefined {
  return state.tiles.find(tile => tile.id === tileId && !tile.removed)
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

    if (canMatchTiles(firstTile, tile)) {
      const tiles = state.tiles.map(current =>
        current.id === firstTile.id || current.id === tile.id
          ? { ...current, removed: true }
          : current,
      )

      const activeTiles = tiles.filter(current => !current.removed)
      const status = activeTiles.length === 0 ? 'won' : state.status

      return {
        ...state,
        tiles,
        selectedTileIds: [],
        moves: state.moves + 1,
        score: state.score + calculateMoveScore(firstTile, tile),
        status,
      }
    }

    return { ...state, selectedTileIds: [tileId] }
  }

  return { ...state, selectedTileIds: [tileId] }
}

function calculateMoveScore(tileA: Tile, tileB: Tile): number {
  return tileA.value === tileB.value ? tileA.value * 2 : 10
}

export function hasAvailableMoves(state: GameState): boolean {
  const active = state.tiles.filter(tile => !tile.removed)

  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      if (canMatchTiles(active[i]!, active[j]!)) {
        return true
      }
    }
  }

  return false
}
