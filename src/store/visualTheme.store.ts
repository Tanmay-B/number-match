import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import {
  DEFAULT_UNLOCKED_THEMES,
  DEFAULT_VISUAL_THEME,
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
  currentTheme: DEFAULT_VISUAL_THEME,
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
        savedTheme && isVisualTheme(savedTheme) ? savedTheme : DEFAULT_VISUAL_THEME

      // Always union with the free themes: a theme that becomes free in a
      // later release must unlock for players who installed before it did.
      const saved = savedUnlocked
        ? (JSON.parse(savedUnlocked) as string[]).filter(isVisualTheme)
        : []
      const unlockedThemes = Array.from(
        new Set([...DEFAULT_UNLOCKED_THEMES, ...saved]),
      )

      set({ currentTheme, unlockedThemes, isHydrated: true })
    } catch {
      set({ isHydrated: true })
    }
  },
}))
