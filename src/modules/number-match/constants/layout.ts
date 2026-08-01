import { Dimensions } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export function getBoardPadding(): number {
  return 16
}

export function getTileSize(gridSize: number): number {
  const padding = getBoardPadding()
  const gap = 8
  const available = SCREEN_WIDTH - padding * 2 - gap * (gridSize - 1)
  return Math.floor(available / gridSize)
}

export function getTileFontSize(tileSize: number): number {
  return Math.max(16, Math.floor(tileSize * 0.45))
}
