export type Tile = {
  id: string
  value: number
  row: number
  col: number
  removed: boolean
}

export type GameStatus = 'playing' | 'won' | 'lost'

export type GameState = {
  tiles: Tile[]
  gridSize: number
  score: number
  moves: number
  selectedTileIds: string[]
  status: GameStatus
  difficulty: number
}

export type TilePair = {
  tileAId: string
  tileBId: string
}
