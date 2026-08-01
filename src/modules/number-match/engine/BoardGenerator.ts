import { hasAvailableMoves } from './MoveCalculator'
import type { GameState, Tile } from './types'

function createTile(id: string, value: number, row: number, col: number): Tile {
  return { id, value, row, col, removed: false }
}

function randomValue(): number {
  return Math.floor(Math.random() * 9) + 1
}

function buildBoard(gridSize: number): GameState {
  const tiles: Tile[] = []

  for (let row = 0; row < gridSize; row += 1) {
    for (let col = 0; col < gridSize; col += 1) {
      const id = `${row}-${col}`
      tiles.push(createTile(id, randomValue(), row, col))
    }
  }

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

export function createInitialBoard(gridSize: number): GameState {
  let board = buildBoard(gridSize)
  let attempts = 0

  while (!hasAvailableMoves(board) && attempts < 100) {
    board = buildBoard(gridSize)
    attempts += 1
  }

  return board
}

export function createNewGame(gridSize = 4): GameState {
  return createInitialBoard(gridSize)
}
