import { createInitialBoard } from '@modules/number-match/engine/BoardGenerator'
import { canMatchTiles, isValidMatch } from '@modules/number-match/engine/MatchValidator'
import {
  applyTileSelection,
  evaluateGameStatus,
  hasAvailableMoves,
} from '@modules/number-match/engine/MoveCalculator'
import { findHintPair } from '@modules/number-match/engine/HintEngine'
import {
  canConnectTiles,
  getTileAt,
} from '@modules/number-match/engine/PathValidator'
import type { GameState, Tile } from '@modules/number-match/engine/types'

function tile(
  id: string,
  value: number,
  row: number,
  col: number,
  removed = false,
): Tile {
  return { id, value, row, col, removed }
}

function buildState(tiles: Tile[], gridSize = 4): GameState {
  return {
    tiles,
    gridSize,
    score: 0,
    moves: 0,
    selectedTileIds: [],
    status: 'playing',
    difficulty: gridSize - 3,
  }
}

describe('PathValidator', () => {
  it('allows adjacent tiles to connect when values match', () => {
    const state = buildState([
      tile('0-0', 5, 0, 0),
      tile('0-1', 5, 0, 1),
    ])

    expect(canConnectTiles(state, state.tiles[0]!, state.tiles[1]!)).toBe(true)
  })

  it('allows horizontal line-of-sight through removed tiles', () => {
    const state = buildState([
      tile('0-0', 3, 0, 0),
      tile('0-1', 7, 0, 1, true),
      tile('0-2', 7, 0, 2),
    ])

    expect(canConnectTiles(state, state.tiles[0]!, state.tiles[2]!)).toBe(true)
  })

  it('blocks horizontal matches when an active tile is between', () => {
    const state = buildState([
      tile('0-0', 4, 0, 0),
      tile('0-1', 2, 0, 1),
      tile('0-2', 6, 0, 2),
    ])

    expect(isValidMatch(state.tiles[0]!, state.tiles[2]!)).toBe(true)
    expect(canConnectTiles(state, state.tiles[0]!, state.tiles[2]!)).toBe(false)
  })

  it('allows row-wrap matches between rows', () => {
    const state = buildState([
      tile('0-3', 5, 0, 3),
      tile('1-0', 5, 1, 0),
    ])

    expect(canConnectTiles(state, state.tiles[0]!, state.tiles[1]!)).toBe(true)
  })
})

describe('MoveCalculator', () => {
  it('removes a valid adjacent pair and increments score', () => {
    const state = buildState([
      tile('0-0', 2, 0, 0),
      tile('0-1', 8, 0, 1),
    ])

    const selected = applyTileSelection(state, '0-0')
    const next = applyTileSelection(selected, '0-1')

    expect(next.moves).toBe(1)
    expect(next.score).toBe(10)
    expect(next.tiles.every((current: Tile) => current.removed)).toBe(true)
    expect(next.status).toBe('won')
  })

  it('marks the board as lost when no moves or add-lines remain', () => {
    const state = buildState([
      tile('0-0', 1, 0, 0),
      tile('0-1', 2, 0, 1),
      tile('1-0', 3, 1, 0),
      tile('1-1', 4, 1, 1),
    ])

    expect(hasAvailableMoves(state)).toBe(false)
    expect(evaluateGameStatus(state)).toBe('lost')
  })

  it('creates boards with at least one available move', () => {
    const state = createInitialBoard(4)
    expect(hasAvailableMoves(state)).toBe(true)
  })

  it('requires positional connectivity for matches', () => {
    const state = buildState([
      tile('0-0', 5, 0, 0),
      tile('0-2', 5, 0, 2),
      tile('0-1', 1, 0, 1),
    ])

    expect(canMatchTiles(state, state.tiles[0]!, state.tiles[1]!)).toBe(false)
  })
})

describe('board scan caching', () => {
  // hasAvailableMoves and findHintPair memoise on the state object. These lock
  // in that a derived board is never answered from its parent's entry.
  it('re-answers after a match clears the last pair', () => {
    const before = buildState([
      tile('0-0', 4, 0, 0),
      tile('0-1', 6, 0, 1),
    ])

    expect(hasAvailableMoves(before)).toBe(true)
    expect(findHintPair(before)).toEqual({ tileAId: '0-0', tileBId: '0-1' })

    const after = applyTileSelection(
      applyTileSelection(before, '0-0'),
      '0-1',
    )

    expect(after).not.toBe(before)
    expect(hasAvailableMoves(after)).toBe(false)
    expect(findHintPair(after)).toBeNull()
    // The parent's answers must be untouched by the child's.
    expect(hasAvailableMoves(before)).toBe(true)
  })

  it('answers two boards that share tile objects independently', () => {
    const tiles = [tile('0-0', 4, 0, 0), tile('0-1', 6, 0, 1)]
    const withMove = buildState(tiles)
    const finished: GameState = { ...withMove, status: 'won' }

    expect(hasAvailableMoves(withMove)).toBe(true)
    expect(hasAvailableMoves(finished)).toBe(true)
    expect(findHintPair(finished)).toEqual({ tileAId: '0-0', tileBId: '0-1' })
  })

  it('indexes cells correctly on a non-square-indexed board', () => {
    const state = buildState(
      [tile('1-2', 7, 1, 2), tile('2-1', 3, 2, 1)],
      4,
    )

    expect(getTileAt(state, 1, 2)?.id).toBe('1-2')
    expect(getTileAt(state, 2, 1)?.id).toBe('2-1')
    expect(getTileAt(state, 0, 0)).toBeUndefined()
  })
})
