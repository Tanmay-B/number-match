import type { GameState, Tile } from './types'

export function getTileAt(
  state: GameState,
  row: number,
  col: number,
): Tile | undefined {
  return state.tiles.find(tile => tile.row === row && tile.col === col)
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
