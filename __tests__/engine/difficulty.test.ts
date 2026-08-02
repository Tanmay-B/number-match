import { createNewGame } from '@modules/number-match/engine/BoardGenerator'
import {
  BOARDS_PER_STEP,
  MAX_DIFFICULTY,
  MAX_GRID,
  MIN_GRID,
  getBoardsUntilNextStep,
  getDifficultyForBoardsCompleted,
  getDifficultyForGridSize,
  getGridLabel,
  getGridSizeForBoardsCompleted,
  getGridSizeForDifficulty,
} from '@modules/number-match/engine/DifficultyManager'

describe('DifficultyManager', () => {
  it('starts at the smallest grid before any board is cleared', () => {
    expect(getGridSizeForBoardsCompleted(0)).toBe(MIN_GRID)
    expect(getDifficultyForBoardsCompleted(0)).toBe(0)
  })

  it('grows the grid by one every BOARDS_PER_STEP cleared boards', () => {
    expect(getGridSizeForBoardsCompleted(BOARDS_PER_STEP - 1)).toBe(MIN_GRID)
    expect(getGridSizeForBoardsCompleted(BOARDS_PER_STEP)).toBe(MIN_GRID + 1)
    expect(getGridSizeForBoardsCompleted(BOARDS_PER_STEP * 2)).toBe(MIN_GRID + 2)
  })

  it('caps at the largest grid however many boards are cleared', () => {
    expect(getGridSizeForBoardsCompleted(BOARDS_PER_STEP * MAX_DIFFICULTY)).toBe(
      MAX_GRID,
    )
    expect(getGridSizeForBoardsCompleted(10_000)).toBe(MAX_GRID)
  })

  it('never moves backwards as boards accumulate', () => {
    let previous = 0
    for (let cleared = 0; cleared <= 40; cleared += 1) {
      const size = getGridSizeForBoardsCompleted(cleared)
      expect(size).toBeGreaterThanOrEqual(previous)
      previous = size
    }
  })

  it('treats negative counts as a fresh player', () => {
    expect(getGridSizeForBoardsCompleted(-5)).toBe(MIN_GRID)
  })

  it('counts down the boards left before the next step', () => {
    expect(getBoardsUntilNextStep(0)).toBe(BOARDS_PER_STEP)
    expect(getBoardsUntilNextStep(BOARDS_PER_STEP - 1)).toBe(1)
    expect(getBoardsUntilNextStep(BOARDS_PER_STEP)).toBe(BOARDS_PER_STEP)
  })

  it('reports nothing left to unlock once maxed out', () => {
    expect(getBoardsUntilNextStep(BOARDS_PER_STEP * MAX_DIFFICULTY)).toBe(0)
  })

  it('round-trips a grid size through its difficulty step', () => {
    for (let size = MIN_GRID; size <= MAX_GRID; size += 1) {
      expect(getGridSizeForDifficulty(getDifficultyForGridSize(size))).toBe(size)
    }
  })

  it('clamps difficulty for grid sizes outside the supported range', () => {
    expect(getDifficultyForGridSize(1)).toBe(0)
    expect(getDifficultyForGridSize(99)).toBe(MAX_DIFFICULTY)
  })

  it('labels a board by its dimensions', () => {
    expect(getGridLabel(6)).toBe('6×6')
  })
})

describe('BoardGenerator difficulty', () => {
  it('builds a board of the requested size with a matching difficulty step', () => {
    for (let size = MIN_GRID; size <= MAX_GRID; size += 1) {
      const game = createNewGame(size)

      expect(game.gridSize).toBe(size)
      expect(game.tiles).toHaveLength(size * size)
      expect(game.difficulty).toBe(getDifficultyForGridSize(size))
    }
  })

  it('defaults to the smallest grid', () => {
    expect(createNewGame().gridSize).toBe(MIN_GRID)
  })
})
