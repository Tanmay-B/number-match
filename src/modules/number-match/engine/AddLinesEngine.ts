import type { GameState, Tile } from './types'

function randomValue(): number {
  return Math.floor(Math.random() * 9) + 1
}

export function addLines(state: GameState): GameState | null {
  const removed = state.tiles
    .filter(tile => tile.removed)
    .sort((a, b) => a.row - b.row || a.col - b.col)

  if (removed.length === 0) {
    return null
  }

  const toRestore = removed.slice(0, state.gridSize)
  const restoreIds = new Set(toRestore.map(tile => tile.id))

  const tiles: Tile[] = state.tiles.map(tile =>
    restoreIds.has(tile.id)
      ? { ...tile, removed: false, value: randomValue() }
      : tile,
  )

  return {
    ...state,
    tiles,
    selectedTileIds: [],
  }
}
