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
  // Dark by default so the first frames match the stored preference that
  // hydration is about to apply, instead of flashing the light palette.
  themeMode: 'dark',
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

    set({ themeMode: 'dark', isHydrated: true })
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
