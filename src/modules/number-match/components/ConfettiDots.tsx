import { StyleSheet, View } from 'react-native'
import type { AppTheme } from '@modules/number-match/constants/palette'

type DotSpec = {
  size: number
  /** Which role supplies the colour. */
  role: 'accent' | 'accentAlt' | 'support' | 'secondary' | 'warm'
  /** Overrides the role colour with a literal from the design. */
  color?: string
  top?: number
  bottom?: number
  left?: number
  right?: number
}

/**
 * Fixed positions taken from the design, rather than random ones, so the
 * decoration is stable across re-renders and identical on every launch.
 */
const DOTS: DotSpec[] = [
  { size: 10, role: 'accent', top: 10, left: 14 },
  { size: 8, role: 'accentAlt', top: 60, right: 20 },
  { size: 7, role: 'support', top: 140, left: 8 },
  { size: 9, role: 'secondary', color: '#85B7EB', bottom: 120, right: 12 },
]

type ConfettiDotsProps = {
  theme: AppTheme
  /** Scales every dot's opacity — lower it on dense screens. */
  opacity?: number
}

/** Decorative background dots. Purely visual; never intercepts touches. */
export function ConfettiDots({ theme, opacity = 1 }: ConfettiDotsProps) {
  return (
    <View pointerEvents="none" style={styles.layer}>
      {DOTS.map((dot, index) => (
        <View
          key={`${dot.role}-${index}`}
          style={[
            styles.dot,
            {
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              backgroundColor: dot.color ?? theme[dot.role].bg,
              opacity: (theme.isDark ? 1 : 0.55) * opacity,
              top: dot.top,
              bottom: dot.bottom,
              left: dot.left,
              right: dot.right,
            },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
  },
})
