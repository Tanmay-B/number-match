import { canMatchTiles } from './MatchValidator'
import type { GameState, TilePair } from './types'

/**
 * Cache keyed on the state object. The hint button asks for this on every
 * render to decide whether it is enabled, and when no pair exists the scan runs
 * over the whole board before answering.
 */
const hintPairs = new WeakMap<GameState, TilePair | null>()

export function findHintPair(state: GameState): TilePair | null {
  const cached = hintPairs.get(state)
  if (cached !== undefined) {
    return cached
  }

  const active = state.tiles.filter(tile => !tile.removed)
  let pair: TilePair | null = null

  outer: for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      if (canMatchTiles(state, active[i]!, active[j]!)) {
        pair = { tileAId: active[i]!.id, tileBId: active[j]!.id }
        break outer
      }
    }
  }

  hintPairs.set(state, pair)
  return pair
}
