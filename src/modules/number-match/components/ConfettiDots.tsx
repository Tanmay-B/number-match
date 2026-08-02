import { useIsFocused } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import { StyleSheet, useWindowDimensions, type LayoutChangeEvent } from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import type { AppTheme } from '@modules/number-match/constants/palette'

const DOT_COUNT = 18

/** How far above the top edge a dot travels before looping back under. */
const OVERSHOOT = 60

type DotSpec = {
  size: number
  /** Horizontal position as a fraction of the layer width. */
  left: number
  colorIndex: number
  durationMs: number
  /** Starting point along the path, so the field is populated immediately. */
  offset: number
  swayAmplitude: number
  swayCycles: number
}

/**
 * Deterministic pseudo-random field. A fixed seed keeps the drift identical on
 * every launch and across re-renders, which a Math.random field would not.
 */
function buildDots(count: number): DotSpec[] {
  let seed = 20260802
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }

  // Both `left` and `offset` are stratified — one dot per column and one per
  // slice of the path, jittered within its band. Sampling them freely left
  // gaps down one side and clumps of dots at the same height.
  return Array.from({ length: count }, (_, index) => ({
    size: 5 + Math.round(next() * 6),
    left: (index + 0.15 + next() * 0.7) / count,
    colorIndex: index,
    durationMs: 9000 + Math.round(next() * 11000),
    offset: (index + next() * 0.9) / count,
    swayAmplitude: 6 + next() * 14,
    swayCycles: 1 + Math.round(next() * 2),
  }))
}

const DOTS = buildDots(DOT_COUNT)

type ConfettiDotsProps = {
  theme: AppTheme
  /** Scales every dot's opacity — lower it on dense screens. */
  opacity?: number
}

/**
 * Decorative dots drifting up the background. Purely visual: the layer never
 * intercepts touches, it pauses while the screen is off-view, and it falls
 * back to a still field when the user has asked to reduce motion.
 */
export function ConfettiDots({ theme, opacity = 1 }: ConfettiDotsProps) {
  const { height: windowHeight } = useWindowDimensions()
  const [height, setHeight] = useState(windowHeight)
  const reducedMotion = useReducedMotion()
  // Screens stay mounted behind a push, so without this every screen the
  // player has visited keeps its field animating in the background.
  const isFocused = useIsFocused()

  // The design's confetti colours, plus its lighter blue which has no role.
  const colors = [
    theme.accent.bg,
    theme.accentAlt.bg,
    theme.support.bg,
    '#85B7EB',
    theme.warm.bg,
    theme.secondary.bg,
  ]

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.height
    if (next > 0 && next !== height) {
      setHeight(next)
    }
  }

  return (
    <Animated.View onLayout={onLayout} pointerEvents="none" style={styles.layer}>
      {DOTS.map((dot, index) => (
        <Dot
          key={index}
          color={colors[dot.colorIndex % colors.length]!}
          height={height}
          opacity={(theme.isDark ? 1 : 0.55) * opacity}
          spec={dot}
          still={reducedMotion || !isFocused}
        />
      ))}
    </Animated.View>
  )
}

type DotProps = {
  spec: DotSpec
  color: string
  height: number
  opacity: number
  still: boolean
}

function Dot({ spec, color, height, opacity, still }: DotProps) {
  // Runs from `offset` to `offset + 1`; the style reads it modulo 1, so the
  // dot wraps back to the bottom without a visible jump.
  const progress = useSharedValue(spec.offset)

  useEffect(() => {
    if (still) {
      cancelAnimation(progress)
      progress.value = spec.offset
      return
    }

    progress.value = spec.offset
    progress.value = withRepeat(
      withTiming(spec.offset + 1, {
        duration: spec.durationMs,
        easing: Easing.linear,
      }),
      -1,
      false,
    )

    return () => cancelAnimation(progress)
  }, [progress, spec.durationMs, spec.offset, still])

  const animatedStyle = useAnimatedStyle(() => {
    const travelled = progress.value % 1
    const distance = height + OVERSHOOT

    // Fade in as it enters and out as it leaves, so nothing pops at the edges.
    const fade =
      travelled < 0.15
        ? travelled / 0.15
        : travelled > 0.85
          ? (1 - travelled) / 0.15
          : 1

    return {
      opacity: opacity * fade,
      transform: [
        { translateY: height - travelled * distance },
        {
          translateX:
            Math.sin(travelled * Math.PI * 2 * spec.swayCycles) *
            spec.swayAmplitude,
        },
      ],
    }
  })

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: spec.size,
          height: spec.size,
          borderRadius: spec.size / 2,
          backgroundColor: color,
          left: `${spec.left * 100}%`,
        },
        animatedStyle,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    top: 0,
  },
})
