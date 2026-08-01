export function calculateBoardBonus(gridSize: number, moves: number): number {
  const base = gridSize * gridSize * 5
  const efficiencyBonus = Math.max(0, gridSize * 4 - moves)
  return base + efficiencyBonus
}

export function calculateVictoryCoins(gridSize: number, moves: number): number {
  return Math.floor(calculateBoardBonus(gridSize, moves) / 5)
}
