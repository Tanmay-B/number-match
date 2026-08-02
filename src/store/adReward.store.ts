import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { AD_REWARDS, STORAGE_KEYS } from '@modules/number-match/constants/storage'

type AdRewardState = {
  date: string
  count: number
}

type AdRewardStore = {
  watchesToday: number
  isHydrated: boolean
  hydrateAdRewards: () => Promise<void>
  canWatchToday: () => boolean
  remainingToday: () => number
  recordWatch: () => Promise<void>
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function readState(raw: string | null): AdRewardState {
  if (!raw) {
    return { date: todayKey(), count: 0 }
  }

  try {
    const parsed = JSON.parse(raw) as AdRewardState
    if (parsed.date !== todayKey()) {
      return { date: todayKey(), count: 0 }
    }

    return {
      date: todayKey(),
      count: Number.isFinite(parsed.count) ? parsed.count : 0,
    }
  } catch {
    return { date: todayKey(), count: 0 }
  }
}

export const useAdRewardStore = create<AdRewardStore>((set, get) => ({
  watchesToday: 0,
  isHydrated: false,
  hydrateAdRewards: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.AD_REWARDS)
      const state = readState(raw)
      set({ watchesToday: state.count, isHydrated: true })
    } catch {
      set({ isHydrated: true })
    }
  },
  canWatchToday: () => get().watchesToday < AD_REWARDS.dailyCap,
  remainingToday: () => Math.max(0, AD_REWARDS.dailyCap - get().watchesToday),
  recordWatch: async () => {
    const nextCount = get().watchesToday + 1
    set({ watchesToday: nextCount })

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.AD_REWARDS,
        JSON.stringify({ date: todayKey(), count: nextCount }),
      )
    } catch {
      // Ignore persistence errors
    }
  },
}))
