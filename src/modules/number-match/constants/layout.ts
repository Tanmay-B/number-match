import { Dimensions } from 'react-native'
import { SPACING } from './tokens'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

/** Gap between tiles. Shared by the board grid and the match-path overlay. */
export const BOARD_GAP = SPACING.sm

export function getBoardPadding(): number {
  return SPACING.lg
}

export function getTileSize(gridSize: number): number {
  const padding = getBoardPadding()
  const available =
    SCREEN_WIDTH - padding * 2 - BOARD_GAP * (gridSize - 1)
  return Math.floor(available / gridSize)
}

/** Total pixel width/height of the square board at a given grid size. */
export function getBoardSize(gridSize: number): number {
  return getTileSize(gridSize) * gridSize + BOARD_GAP * (gridSize - 1)
}

/** Centre point of a grid cell, in board-local pixels. */
export function getCellCenter(
  row: number,
  col: number,
  tileSize: number,
): { x: number; y: number } {
  return {
    x: col * (tileSize + BOARD_GAP) + tileSize / 2,
    y: row * (tileSize + BOARD_GAP) + tileSize / 2,
  }
}
