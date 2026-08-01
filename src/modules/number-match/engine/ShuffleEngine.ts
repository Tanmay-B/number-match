import type { GameState, Tile } from './types'

function randomValue(): number {
  return Math.floor(Math.random() * 9) + 1
}

export function shuffleActiveTiles(state: GameState): GameState {
  const active = state.tiles.filter(tile => !tile.removed)
  const values = active.map(tile => tile.value)

  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[values[i], values[j]] = [values[j]!, values[i]!]
  }

  let index = 0
  const tiles: Tile[] = state.tiles.map(tile => {
    if (tile.removed) {
      return tile
    }

    const next = { ...tile, value: values[index] ?? randomValue() }
    index += 1
    return next
  })

  return {
    ...state,
    tiles,
    selectedTileIds: [],
  }
}
