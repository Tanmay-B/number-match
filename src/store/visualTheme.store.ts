import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import {
  DEFAULT_UNLOCKED_THEMES,
  STORAGE_KEYS,
  VISUAL_THEMES,
  type VisualThemeId,
} from '@modules/number-match/constants/storage'

type VisualThemeStore = {
  currentTheme: VisualThemeId
  unlockedThemes: VisualThemeId[]
  isHydrated: boolean
  setCurrentTheme: (theme: VisualThemeId) => void
  unlockTheme: (theme: VisualThemeId) => void
  hydrateVisualThemes: () => Promise<void>
}

function isVisualTheme(value: string): value is VisualThemeId {
  return VISUAL_THEMES.includes(value as VisualThemeId)
}

export const useVisualThemeStore = create<VisualThemeStore>(set => ({
  currentTheme: 'classic',
  unlockedThemes: DEFAULT_UNLOCKED_THEMES,
  isHydrated: false,
  setCurrentTheme: currentTheme => {
    set({ currentTheme })
    AsyncStorage.setItem(STORAGE_KEYS.VISUAL_THEME, currentTheme).catch(
      () => {},
    )
  },
  unlockTheme: theme => {
    set(state => {
      if (state.unlockedThemes.includes(theme)) {
        return state
      }

      const unlockedThemes = [...state.unlockedThemes, theme]
      AsyncStorage.setItem(
        STORAGE_KEYS.UNLOCKED_THEMES,
        JSON.stringify(unlockedThemes),
      ).catch(() => {})

      return { unlockedThemes }
    })
  },
  hydrateVisualThemes: async () => {
    try {
      const [savedTheme, savedUnlocked] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.VISUAL_THEME),
        AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED_THEMES),
      ])

      const currentTheme =
        savedTheme && isVisualTheme(savedTheme) ? savedTheme : 'classic'

      let unlockedThemes = DEFAULT_UNLOCKED_THEMES
      if (savedUnlocked) {
        const parsed = JSON.parse(savedUnlocked) as string[]
        unlockedThemes = parsed.filter(isVisualTheme)
        if (unlockedThemes.length === 0) {
          unlockedThemes = DEFAULT_UNLOCKED_THEMES
        }
      }

      set({ currentTheme, unlockedThemes, isHydrated: true })
    } catch {
      set({ isHydrated: true })
    }
  },
}))
