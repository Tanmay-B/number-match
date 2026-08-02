import { Pressable, StyleSheet, View } from 'react-native'
import type { AppTheme } from '@modules/number-match/constants/palette'
import { RADIUS, SPACING } from '@modules/number-match/constants/tokens'
import { Icon, type IconName } from './Icon'
import { AppRoutes } from '@router/routes'

export type NavTab = 'home' | 'stats' | 'themes' | 'settings'

const TABS: { id: NavTab; icon: IconName; route: AppRoutes; label: string }[] = [
  { id: 'home', icon: 'home', route: AppRoutes.HOME, label: 'Home' },
  { id: 'stats', icon: 'chart', route: AppRoutes.STATISTICS, label: 'Statistics' },
  { id: 'themes', icon: 'palette', route: AppRoutes.THEMES, label: 'Themes' },
  {
    id: 'settings',
    icon: 'settings',
    route: AppRoutes.SETTINGS,
    label: 'Settings',
  },
]

type BottomNavProps = {
  theme: AppTheme
  active: NavTab
  onNavigate: (route: AppRoutes) => void
}

/**
 * Presentational tab bar. It drives the existing stack navigator rather than
 * replacing it, so screens keep their push/pop behaviour.
 */
export function BottomNav({ theme, active, onNavigate }: BottomNavProps) {
  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.isDark
            ? 'rgba(255,255,255,0.12)'
            : theme.surfaceElevated,
          borderColor: theme.isDark ? 'transparent' : theme.border,
        },
      ]}>
      {TABS.map(tab => {
        const isActive = tab.id === active

        return (
          <Pressable
            key={tab.id}
            accessibilityLabel={tab.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => {
              if (!isActive) {
                onNavigate(tab.route)
              }
            }}
            style={({ pressed }) => [
              styles.tab,
              pressed && !isActive && styles.pressed,
            ]}>
            <Icon
              color={isActive ? theme.accent.bg : theme.muted}
              name={tab.icon}
              size={22}
            />
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm + 2,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
})
