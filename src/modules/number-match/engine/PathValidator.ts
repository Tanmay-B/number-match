import type { GameState, Tile } from './types'

/**
 * Row/col index per board, built once and reused.
 *
 * Keyed on the state object, which the engine always replaces rather than
 * mutates, so an entry can never go stale. A WeakMap lets superseded boards be
 * collected with their index.
 */
const cellIndex = new WeakMap<GameState, Map<number, Tile>>()

function getCellIndex(state: GameState): Map<number, Tile> {
  const cached = cellIndex.get(state)
  if (cached) {
    return cached
  }

  const index = new Map<number, Tile>()
  for (const tile of state.tiles) {
    index.set(tile.row * state.gridSize + tile.col, tile)
  }
  cellIndex.set(state, index)
  return index
}

export function getTileAt(
  state: GameState,
  row: number,
  col: number,
): Tile | undefined {
  return getCellIndex(state).get(row * state.gridSize + col)
}

function areGridAdjacent(tileA: Tile, tileB: Tile): boolean {
  const rowDelta = Math.abs(tileA.row - tileB.row)
  const colDelta = Math.abs(tileA.col - tileB.col)

  return rowDelta <= 1 && colDelta <= 1 && rowDelta + colDelta > 0
}

function hasClearHorizontalPath(
  state: GameState,
  tileA: Tile,
  tileB: Tile,
): boolean {
  if (tileA.row !== tileB.row) {
    return false
  }

  const minCol = Math.min(tileA.col, tileB.col)
  const maxCol = Math.max(tileA.col, tileB.col)

  for (let col = minCol + 1; col < maxCol; col += 1) {
    const between = getTileAt(state, tileA.row, col)
    if (between && !between.removed) {
      return false
    }
  }

  return true
}

function hasClearVerticalPath(
  state: GameState,
  tileA: Tile,
  tileB: Tile,
): boolean {
  if (tileA.col !== tileB.col) {
    return false
  }

  const minRow = Math.min(tileA.row, tileB.row)
  const maxRow = Math.max(tileA.row, tileB.row)

  for (let row = minRow + 1; row < maxRow; row += 1) {
    const between = getTileAt(state, row, tileA.col)
    if (between && !between.removed) {
      return false
    }
  }

  return true
}

function hasRowWrapPath(state: GameState, tileA: Tile, tileB: Tile): boolean {
  const isAFirst =
    tileA.col === 0 &&
    tileB.col === state.gridSize - 1 &&
    tileA.row === tileB.row + 1
  const isBFirst =
    tileB.col === 0 &&
    tileA.col === state.gridSize - 1 &&
    tileB.row === tileA.row + 1

  return isAFirst || isBFirst
}

export function canConnectTiles(
  state: GameState,
  tileA: Tile,
  tileB: Tile,
): boolean {
  if (tileA.removed || tileB.removed) {
    return false
  }

  if (areGridAdjacent(tileA, tileB)) {
    return true
  }

  if (hasClearHorizontalPath(state, tileA, tileB)) {
    return true
  }

  if (hasClearVerticalPath(state, tileA, tileB)) {
    return true
  }

  return hasRowWrapPath(state, tileA, tileB)
}
