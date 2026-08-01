import { canMatchTiles } from './MatchValidator'
import type { GameState, TilePair } from './types'

export function findHintPair(state: GameState): TilePair | null {
  const active = state.tiles.filter(tile => !tile.removed)

  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      if (canMatchTiles(active[i]!, active[j]!)) {
        return { tileAId: active[i]!.id, tileBId: active[j]!.id }
      }
    }
  }

  return null
}
