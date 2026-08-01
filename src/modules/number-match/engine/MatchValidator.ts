import { canConnectTiles } from './PathValidator'
import type { GameState, Tile } from './types'

export function areValuesMatchable(valueA: number, valueB: number): boolean {
  return valueA === valueB || valueA + valueB === 10
}

export function isValidMatch(tileA: Tile, tileB: Tile): boolean {
  if (tileA.removed || tileB.removed) {
    return false
  }

  if (tileA.id === tileB.id) {
    return false
  }

  return areValuesMatchable(tileA.value, tileB.value)
}

export function canMatchTiles(
  state: GameState,
  tileA: Tile,
  tileB: Tile,
): boolean {
  return isValidMatch(tileA, tileB) && canConnectTiles(state, tileA, tileB)
}
