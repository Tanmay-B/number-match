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

const NUMBER_COUNT = 18

/** How far above the top edge a numeral travels before looping back under. */
const OVERSHOOT = 80

type NumberSpec = {
  /** The digit shown, 1-9, which also picks its tile colour. */
  value: number
  fontSize: number
  /** Horizontal position as a fraction of the layer width. */
  left: number
  durationMs: number
  /** Starting point along the path, so the field is populated immediately. */
  offset: number
  swayAmplitude: number
  swayCycles: number
  tilt: number
}

/**
 * Deterministic pseudo-random field. A fixed seed keeps the drift identical on
 * every launch and across re-renders, which a Math.random field would not.
 */
function buildNumbers(count: number): NumberSpec[] {
  let seed = 20260802
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }

  // Both `left` and `offset` are stratified — one numeral per column and one
  // per slice of the path, jittered within its band. Sampling them freely left
  // gaps down one side and clumps of numerals at the same height.
  return Array.from({ length: count }, (_, index) => ({
    value: 1 + Math.floor(next() * 9),
    fontSize: 14 + Math.round(next() * 16),
    left: (index + 0.12 + next() * 0.76) / count,
    durationMs: 9000 + Math.round(next() * 11000),
    offset: (index + next() * 0.9) / count,
    swayAmplitude: 6 + next() * 14,
    swayCycles: 1 + Math.round(next() * 2),
    tilt: -14 + next() * 28,
  }))
}

const NUMBERS = buildNumbers(NUMBER_COUNT)

type FloatingNumbersProps = {
  theme: AppTheme
  /** Scales every numeral's opacity — lower it on dense screens. */
  opacity?: number
}

/**
 * Board digits drifting up the background. Purely visual: the layer never
 * intercepts touches, it pauses while the screen is off-view, and it falls
 * back to a still field when the user has asked to reduce motion.
 */
export function FloatingNumbers({ theme, opacity = 1 }: FloatingNumbersProps) {
  const { height: windowHeight } = useWindowDimensions()
  const [height, setHeight] = useState(windowHeight)
  const reducedMotion = useReducedMotion()
  // Screens stay mounted behind a push, so without this every screen the
  // player has visited keeps its field animating in the background.
  const isFocused = useIsFocused()

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.height
    if (next > 0 && next !== height) {
      setHeight(next)
    }
  }

  return (
    <Animated.View onLayout={onLayout} pointerEvents="none" style={styles.layer}>
      {NUMBERS.map((spec, index) => (
        <FloatingNumber
          key={index}
          color={theme.tiles[spec.value] ?? theme.accent.bg}
          height={height}
          // Numerals carry more ink than dots did, so they sit further back.
          opacity={(theme.isDark ? 0.8 : 0.5) * opacity}
          spec={spec}
          still={reducedMotion || !isFocused}
        />
      ))}
    </Animated.View>
  )
}

type FloatingNumberProps = {
  spec: NumberSpec
  color: string
  height: number
  opacity: number
  still: boolean
}

function FloatingNumber({
  spec,
  color,
  height,
  opacity,
  still,
}: FloatingNumberProps) {
  // Runs from `offset` to `offset + 1`; the style reads it modulo 1, so the
  // numeral wraps back to the bottom without a visible jump.
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
        { rotateZ: `${spec.tilt}deg` },
      ],
    }
  })

  return (
    <Animated.Text
      style={[
        styles.numeral,
        {
          color,
          fontSize: spec.fontSize,
          lineHeight: Math.round(spec.fontSize * 1.2),
          left: `${spec.left * 100}%`,
        },
        animatedStyle,
      ]}>
      {spec.value}
    </Animated.Text>
  )
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  numeral: {
    fontWeight: '600',
    position: 'absolute',
    top: 0,
  },
})
