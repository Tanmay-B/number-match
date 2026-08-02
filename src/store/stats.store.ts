import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { STORAGE_KEYS } from '@modules/number-match/constants/storage'

type StatsStore = {
  gamesPlayed: number
  gamesWon: number
  bestScore: number
  longestSessionMs: number
  movesMade: number
  hintsUsed: number
  adsWatched: number
  currentStreak: number
  /** Scores of the most recent wins, oldest first. Drives the sparkline. */
  recentScores: number[]
  isHydrated: boolean
  hydrateStats: () => Promise<void>
  recordGamePlayed: () => void
  recordWin: (score: number) => void
  recordMove: () => void
  recordHint: () => void
  recordAdWatched: () => void
  recordSessionDuration: (durationMs: number) => void
  updateStreak: (streak: number) => void
  resetStats: () => void
}

type PersistedStats = Omit<StatsStore, 'isHydrated' | keyof StatsActions>
type StatsActions = Pick<
  StatsStore,
  | 'hydrateStats'
  | 'recordGamePlayed'
  | 'recordWin'
  | 'recordMove'
  | 'recordHint'
  | 'recordAdWatched'
  | 'recordSessionDuration'
  | 'updateStreak'
  | 'resetStats'
>

const defaultStats: PersistedStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestScore: 0,
  longestSessionMs: 0,
  movesMade: 0,
  hintsUsed: 0,
  adsWatched: 0,
  currentStreak: 0,
  recentScores: [],
}

const RECENT_SCORES_LIMIT = 12

export const useStatsStore = create<StatsStore>(set => ({
  ...defaultStats,
  isHydrated: false,
  hydrateStats: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.STATS)
      if (!raw) {
        set({ isHydrated: true })
        return
      }

      const saved = JSON.parse(raw) as Partial<PersistedStats>
      const recentScores = Array.isArray(saved.recentScores)
        ? saved.recentScores.filter(
            (score): score is number => typeof score === 'number',
          )
        : []
      set({ ...defaultStats, ...saved, recentScores, isHydrated: true })
    } catch {
      set({ isHydrated: true })
    }
  },
  recordGamePlayed: () => {
    set(state => {
      const gamesPlayed = state.gamesPlayed + 1
      persistStats({ ...state, gamesPlayed })
      return { gamesPlayed }
    })
  },
  recordWin: score => {
    set(state => {
      const gamesWon = state.gamesWon + 1
      const bestScore = Math.max(state.bestScore, score)
      const recentScores = [...state.recentScores, score].slice(
        -RECENT_SCORES_LIMIT,
      )
      persistStats({ ...state, gamesWon, bestScore, recentScores })
      return { gamesWon, bestScore, recentScores }
    })
  },
  resetStats: () => {
    set({ ...defaultStats })
    AsyncStorage.setItem(
      STORAGE_KEYS.STATS,
      JSON.stringify(defaultStats),
    ).catch(() => {})
  },
  recordMove: () => {
    set(state => {
      const movesMade = state.movesMade + 1
      persistStats({ ...state, movesMade })
      return { movesMade }
    })
  },
  recordHint: () => {
    set(state => {
      const hintsUsed = state.hintsUsed + 1
      persistStats({ ...state, hintsUsed })
      return { hintsUsed }
    })
  },
  recordAdWatched: () => {
    set(state => {
      const adsWatched = state.adsWatched + 1
      persistStats({ ...state, adsWatched })
      return { adsWatched }
    })
  },
  recordSessionDuration: durationMs => {
    set(state => {
      const longestSessionMs = Math.max(state.longestSessionMs, durationMs)
      persistStats({ ...state, longestSessionMs })
      return { longestSessionMs }
    })
  },
  updateStreak: currentStreak => {
    set(state => {
      persistStats({ ...state, currentStreak })
      return { currentStreak }
    })
  },
}))

async function persistStats(stats: PersistedStats) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats))
  } catch {
    // Ignore persistence errors
  }
}
