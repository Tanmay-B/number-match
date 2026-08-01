import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { COIN_REWARDS, STORAGE_KEYS } from '@modules/number-match/constants/storage'
import type { GameState } from '@modules/number-match/engine/types'

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost'

type GameStore = {
  coins: number
  game: GameState | null
  status: GameStatus
  isHydrated: boolean
  hydrateGameStore: () => Promise<void>
  setGame: (game: GameState | null) => void
  setStatus: (status: GameStatus) => void
  addCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean
  persistGame: () => Promise<void>
  clearSavedGame: () => Promise<void>
}

export const useGameStore = create<GameStore>((set, get) => ({
  coins: 0,
  game: null,
  status: 'idle',
  isHydrated: false,
  hydrateGameStore: async () => {
    try {
      const [coinsRaw, gameRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.COINS),
        AsyncStorage.getItem(STORAGE_KEYS.GAME),
      ])

      const coins = coinsRaw ? Number(coinsRaw) : 0
      const game = gameRaw ? (JSON.parse(gameRaw) as GameState) : null
      const status: GameStatus = game ? 'playing' : 'idle'

      set({ coins: Number.isFinite(coins) ? coins : 0, game, status, isHydrated: true })
    } catch {
      set({ isHydrated: true })
    }
  },
  setGame: game => {
    set({ game, status: game ? 'playing' : 'idle' })
    get().persistGame()
  },
  setStatus: status => set({ status }),
  addCoins: amount => {
    set(state => {
      const coins = state.coins + amount
      AsyncStorage.setItem(STORAGE_KEYS.COINS, String(coins)).catch(() => {})
      return { coins }
    })
  },
  spendCoins: amount => {
    const { coins } = get()
    if (coins < amount) {
      return false
    }

    const next = coins - amount
    set({ coins: next })
    AsyncStorage.setItem(STORAGE_KEYS.COINS, String(next)).catch(() => {})
    return true
  },
  persistGame: async () => {
    try {
      const { game } = get()
      if (game) {
        await AsyncStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(game))
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.GAME)
      }
    } catch {
      // Ignore persistence errors
    }
  },
  clearSavedGame: async () => {
    set({ game: null, status: 'idle' })
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.GAME)
    } catch {
      // Ignore persistence errors
    }
  },
}))

export function awardBoardCoins(): number {
  return COIN_REWARDS.boardComplete
}
