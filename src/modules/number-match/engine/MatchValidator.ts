import type { Tile } from './types'

export function isValidMatch(tileA: Tile, tileB: Tile): boolean {
  if (tileA.removed || tileB.removed) {
    return false
  }

  if (tileA.id === tileB.id) {
    return false
  }

  return tileA.value === tileB.value || tileA.value + tileB.value === 10
}

export function canMatchTiles(tileA: Tile, tileB: Tile): boolean {
  return isValidMatch(tileA, tileB)
}
