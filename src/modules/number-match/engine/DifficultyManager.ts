const MIN_GRID = 4
const MAX_GRID = 8

export function getGridSizeForDifficulty(difficulty: number): number {
  return Math.min(MAX_GRID, Math.max(MIN_GRID, MIN_GRID + difficulty))
}

export function getNextDifficulty(current: number, boardsCompleted: number): number {
  if (boardsCompleted > 0 && boardsCompleted % 3 === 0) {
    return Math.min(current + 1, MAX_GRID - MIN_GRID)
  }

  return current
}

export function getDifficultyLabel(difficulty: number): string {
  const size = getGridSizeForDifficulty(difficulty)
  return `${size}×${size}`
}
