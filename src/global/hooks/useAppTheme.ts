import { useCallback, useEffect } from 'react'
import { useColorScheme } from 'react-native'
import {
  darkTheme,
  lightTheme,
} from '@modules/number-match/constants/palette'
import { resolveIsDark, useThemeStore } from '@store/theme.store'

export function useAppTheme() {
  const systemScheme = useColorScheme()
  const themeMode = useThemeStore(state => state.themeMode)
  const isHydrated = useThemeStore(state => state.isHydrated)
  const hydrateTheme = useThemeStore(state => state.hydrateTheme)
  const setThemeMode = useThemeStore(state => state.setThemeMode)

  useEffect(() => {
    hydrateTheme()
  }, [hydrateTheme])

  const isDark = resolveIsDark(themeMode, systemScheme)
  const theme = isDark ? darkTheme : lightTheme

  const toggleThemeMode = useCallback(() => {
    setThemeMode(isDark ? 'light' : 'dark')
  }, [isDark, setThemeMode])

  return {
    isDark,
    theme,
    themeMode,
    isHydrated,
    toggleThemeMode,
    setThemeMode,
  }
}
