import { Dimensions, type TextStyle, type ViewStyle } from 'react-native'

/** Width of the canvas the designs are drawn on. */
const DESIGN_WIDTH = 360

const { width: SCREEN_WIDTH } = Dimensions.get('window')

/**
 * How much larger this device is than the design canvas. Clamped so a tablet
 * does not end up with absurd type, and a very narrow phone stays legible.
 */
export const SCALE = Math.min(1.3, Math.max(0.85, SCREEN_WIDTH / DESIGN_WIDTH))

/**
 * Converts a measurement taken from a design into device points.
 *
 * Use this for anything specified in a mockup — padding, radii, font sizes —
 * so the layout keeps the designed proportions on every screen width instead
 * of being hand-tuned per element.
 */
export function scale(size: number): number {
  return Math.round(size * SCALE)
}

/**
 * Shared spacing / radius / type / motion scale.
 *
 * Every screen and component should pull sizing from here rather than using
 * literal numbers, so the app reads as one system.
 */

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const

/** Rounded, candy-styled corners: 8 on tiles, 16 on cards, 20 on buttons. */
export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
} as const

/**
 * Type is deliberately light — the candy direction leans on colour and shape
 * for hierarchy rather than heavy weights.
 */
export const TYPE = {
  display: {
    fontSize: 34,
    fontWeight: '500',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  heading: {
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
  },
  bodyStrong: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  overline: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  numeral: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  numeralLarge: {
    fontSize: 44,
    fontWeight: '600',
    letterSpacing: -1,
  },
} as const satisfies Record<string, TextStyle>

export const DURATION = {
  instant: 120,
  fast: 180,
  base: 260,
  slow: 420,
  pulse: 900,
} as const

export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const

export function elevation(level: 0 | 1 | 2 | 3): ViewStyle {
  if (level === 0) {
    return { shadowOpacity: 0, elevation: 0 }
  }

  const config = {
    1: { height: 2, radius: 4, opacity: 0.16, android: 2 },
    2: { height: 4, radius: 8, opacity: 0.22, android: 5 },
    3: { height: 10, radius: 20, opacity: 0.3, android: 12 },
  }[level]

  return {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: config.height },
    shadowOpacity: config.opacity,
    shadowRadius: config.radius,
    elevation: config.android,
  }
}
