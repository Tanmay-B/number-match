import { addLines } from './AddLinesEngine'
import { canMatchTiles } from './MatchValidator'
import type { GameState, Tile } from './types'

export function calculateMoveScore(tileA: Tile, tileB: Tile): number {
  if (tileA.value === tileB.value) {
    return tileA.value * 2
  }

  return 10
}

export function calculateBoardBonus(gridSize: number, moves: number): number {
  const base = gridSize * gridSize * 5
  const efficiencyBonus = Math.max(0, gridSize * 4 - moves)
  return base + efficiencyBonus
}

export function calculateVictoryCoins(gridSize: number, moves: number): number {
  return Math.floor(calculateBoardBonus(gridSize, moves) / 5)
}

export function calculateMatchScore(
  tileA: Tile,
  tileB: Tile,
  comboCount: number,
): number {
  const base = calculateMoveScore(tileA, tileB)
  const comboBonus = comboCount > 1 ? (comboCount - 1) * 5 : 0
  return base + comboBonus
}
