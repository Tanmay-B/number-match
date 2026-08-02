export const MIN_GRID = 4
export const MAX_GRID = 8

/** Boards you must clear before the grid grows by one on each side. */
export const BOARDS_PER_STEP = 3

/** Highest difficulty step, i.e. the one that yields MAX_GRID. */
export const MAX_DIFFICULTY = MAX_GRID - MIN_GRID

export function getGridSizeForDifficulty(difficulty: number): number {
  return Math.min(MAX_GRID, Math.max(MIN_GRID, MIN_GRID + difficulty))
}

export function getDifficultyForGridSize(gridSize: number): number {
  return Math.min(MAX_DIFFICULTY, Math.max(0, gridSize - MIN_GRID))
}

/**
 * Difficulty is derived from the player's total cleared boards rather than
 * stepped incrementally. A derived value cannot drift out of sync if a bump is
 * ever missed, and it needs no storage of its own.
 */
export function getDifficultyForBoardsCompleted(boardsCompleted: number): number {
  const step = Math.floor(Math.max(0, boardsCompleted) / BOARDS_PER_STEP)
  return Math.min(MAX_DIFFICULTY, step)
}

export function getGridSizeForBoardsCompleted(boardsCompleted: number): number {
  return getGridSizeForDifficulty(
    getDifficultyForBoardsCompleted(boardsCompleted),
  )
}

/** Boards still to clear before the grid grows again, or 0 once maxed out. */
export function getBoardsUntilNextStep(boardsCompleted: number): number {
  if (getDifficultyForBoardsCompleted(boardsCompleted) >= MAX_DIFFICULTY) {
    return 0
  }

  return BOARDS_PER_STEP - (Math.max(0, boardsCompleted) % BOARDS_PER_STEP)
}

export function getGridLabel(gridSize: number): string {
  return `${gridSize}×${gridSize}`
}

export function getDifficultyLabel(difficulty: number): string {
  return getGridLabel(getGridSizeForDifficulty(difficulty))
}
