import { useCallback, useEffect, useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { resolveAppTheme } from '@modules/number-match/constants/palette'
import { resolveIsDark, useThemeStore } from '@store/theme.store'
import { useVisualThemeStore } from '@store/visualTheme.store'

/**
 * Resolves the active theme from two independent axes:
 *  - `visualThemeId` — the palette the player picked on the Themes screen
 *  - `isDark` — the light/dark mode toggle (or the system scheme)
 */
export function useAppTheme() {
  const systemScheme = useColorScheme()
  const themeMode = useThemeStore(state => state.themeMode)
  const isHydrated = useThemeStore(state => state.isHydrated)
  const hydrateTheme = useThemeStore(state => state.hydrateTheme)
  const setThemeMode = useThemeStore(state => state.setThemeMode)
  const visualThemeId = useVisualThemeStore(state => state.currentTheme)

  useEffect(() => {
    hydrateTheme()
  }, [hydrateTheme])

  const isDark = resolveIsDark(themeMode, systemScheme)
  const theme = useMemo(
    () => resolveAppTheme(visualThemeId, isDark),
    [isDark, visualThemeId],
  )

  const toggleThemeMode = useCallback(() => {
    setThemeMode(isDark ? 'light' : 'dark')
  }, [isDark, setThemeMode])

  return {
    isDark,
    theme,
    themeMode,
    visualThemeId,
    isHydrated,
    toggleThemeMode,
    setThemeMode,
  }
}
