import { COIN_COSTS } from '@modules/number-match/constants/storage'
import { findHintPair } from './HintEngine'
import { canAddLines, hasAvailableMoves } from './MoveCalculator'
import type { GameState } from './types'

export type PowerUpId = 'undo' | 'hint' | 'shuffle' | 'addLines'

export type PowerUpAvailability = {
  enabled: boolean
  reason?: string
  reasonCost?: number
  cost: number | 'free'
}

type PowerUpContext = {
  coins: number
  historyLength: number
  isStuck: boolean
}

function canAfford(coins: number, cost: number, isStuck: boolean): boolean {
  return coins >= cost || isStuck
}

function resolveCost(cost: number, isStuck: boolean): number | 'free' {
  return isStuck ? 'free' : cost
}

export function getCheapestPowerUpCost(): number {
  return Math.min(...Object.values(COIN_COSTS))
}

export function needsCoinTopUp(coins: number, isStuck: boolean): boolean {
  return !isStuck && coins < getCheapestPowerUpCost()
}

export function isCoinBlocked(state: PowerUpAvailability | null): boolean {
  return state?.reasonCost !== undefined
}

export function getPowerUpAvailability(
  id: PowerUpId,
  game: GameState,
  context: PowerUpContext,
): PowerUpAvailability {
  const { coins, historyLength, isStuck } = context
  const cost = COIN_COSTS[id]
  const resolvedCost = resolveCost(cost, isStuck)
  const activeCount = game.tiles.filter(tile => !tile.removed).length

  if (game.status !== 'playing') {
    return { enabled: false, reason: 'Round is over', cost: resolvedCost }
  }

  switch (id) {
    case 'undo':
      if (historyLength === 0) {
        return { enabled: false, reason: 'No moves to undo', cost: resolvedCost }
      }
      if (!canAfford(coins, cost, isStuck)) {
        return {
          enabled: false,
          reasonCost: cost,
          cost: resolvedCost,
        }
      }
      return { enabled: true, cost: resolvedCost }

    case 'hint':
      if (!findHintPair(game)) {
        return { enabled: false, reason: 'No matches available', cost: resolvedCost }
      }
      if (!canAfford(coins, cost, isStuck)) {
        return {
          enabled: false,
          reasonCost: cost,
          cost: resolvedCost,
        }
      }
      return { enabled: true, cost: resolvedCost }

    case 'shuffle':
      if (activeCount < 2) {
        return { enabled: false, reason: 'Need at least 2 tiles', cost: resolvedCost }
      }
      if (isStuck && activeCount <= 2 && !hasAvailableMoves(game)) {
        return { enabled: false, reason: 'Try Add Lines instead', cost: resolvedCost }
      }
      if (!canAfford(coins, cost, isStuck)) {
        return {
          enabled: false,
          reasonCost: cost,
          cost: resolvedCost,
        }
      }
      return { enabled: true, cost: resolvedCost }

    case 'addLines':
      if (!canAddLines(game)) {
        return { enabled: false, reason: 'Board is full', cost: resolvedCost }
      }
      if (!canAfford(coins, cost, isStuck)) {
        return {
          enabled: false,
          reasonCost: cost,
          cost: resolvedCost,
        }
      }
      return { enabled: true, cost: resolvedCost }

    default:
      return { enabled: false, reason: 'Unavailable', cost: resolvedCost }
  }
}
