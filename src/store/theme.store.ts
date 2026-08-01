import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { STORAGE_KEYS } from '@modules/number-match/constants/storage'

export type ThemeMode = 'light' | 'dark'

type ThemeStore = {
  themeMode: ThemeMode | null
  isHydrated: boolean
  setThemeMode: (mode: ThemeMode) => void
  hydrateTheme: () => Promise<void>
}

export const useThemeStore = create<ThemeStore>(set => ({
  themeMode: null,
  isHydrated: false,
  setThemeMode: themeMode => {
    set({ themeMode })
    AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode).catch(() => {})
  },
  hydrateTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE)
      if (saved === 'light' || saved === 'dark') {
        set({ themeMode: saved, isHydrated: true })
        return
      }
    } catch {
      // Fall through to system default
    }

    set({ themeMode: null, isHydrated: true })
  },
}))

export function resolveIsDark(
  themeMode: ThemeMode | null,
  systemScheme: 'light' | 'dark' | null | undefined,
): boolean {
  if (themeMode) {
    return themeMode === 'dark'
  }

  return systemScheme === 'dark'
}
