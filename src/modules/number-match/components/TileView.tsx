import { memo, useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import type { AppTheme } from '@modules/number-match/constants/palette'
import { RADIUS } from '@modules/number-match/constants/tokens'
import type { Tile } from '@modules/number-match/engine/types'

const SPRING = { damping: 14, stiffness: 220, mass: 0.6 }

/*
 * Tiles are deliberately flat — no shadow on the view and none on the numeral.
 * The design draws them as flat fills, and a blurred shadow on every tile costs
 * an offscreen pass per tile per frame while the board animates. Selection is
 * carried by the border, the lift and the scale instead.
 */

/**
 * Clear timings. The pop and the fade run back to back and finish together, so
 * the tile reaches scale 0 and opacity 0 on the same frame and the swap to an
 * empty cell is never visible.
 */
const CLEAR_POP_MS = 110
const CLEAR_FADE_MS = 200

type TileViewProps = {
  tile: Tile
  size: number
  theme: AppTheme
  selected: boolean
  hinted: boolean
  onPress: (tileId: string) => void
}

function TileViewBase({
  tile,
  size,
  theme,
  selected,
  hinted,
  onPress,
}: TileViewProps) {
  // Seeded from the tile so a resumed game renders cleared cells with no
  // animation, while a match cleared during play animates out first.
  const [cleared, setCleared] = useState(tile.removed)

  const scale = useSharedValue(tile.removed ? 0 : 0.7)
  const opacity = useSharedValue(tile.removed ? 0 : 0)
  const selectLift = useSharedValue(0)
  const pulse = useSharedValue(0)

  // Entry: new tiles (new board, or Add Lines) pop into place.
  useEffect(() => {
    if (tile.removed) {
      return
    }

    opacity.value = withTiming(1, { duration: 160 })
    scale.value = withSpring(1, SPRING)
    // Mount only — later transitions are handled by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clear / restore (a match removes a tile, an undo brings it back).
  useEffect(() => {
    if (tile.removed) {
      if (cleared) {
        return
      }

      // A hinted tile can be the one that clears; stop its loop first so the
      // pulse does not fight the exit transform.
      cancelAnimation(pulse)
      pulse.value = 0

      scale.value = withSequence(
        withTiming(1.22, {
          duration: CLEAR_POP_MS,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(
          0,
          { duration: CLEAR_FADE_MS, easing: Easing.in(Easing.cubic) },
          finished => {
            if (finished) {
              runOnJS(setCleared)(true)
            }
          },
        ),
      )
      opacity.value = withDelay(
        CLEAR_POP_MS,
        withTiming(0, {
          duration: CLEAR_FADE_MS,
          easing: Easing.in(Easing.quad),
        }),
      )
      return
    }

    if (cleared) {
      setCleared(false)
      opacity.value = withTiming(1, { duration: 160 })
      scale.value = withSpring(1, SPRING)
    }
  }, [cleared, opacity, pulse, scale, tile.removed])

  useEffect(() => {
    selectLift.value = withSpring(selected ? 1 : 0, SPRING)
  }, [selectLift, selected])

  useEffect(() => {
    if (!hinted) {
      cancelAnimation(pulse)
      pulse.value = withTiming(0, { duration: 150 })
      return
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 460, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 460, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    )

    return () => cancelAnimation(pulse)
  }, [hinted, pulse])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value + selectLift.value * 0.09 + pulse.value * 0.06 },
      { translateY: selectLift.value * -3 },
    ],
  }))

  if (cleared && tile.removed) {
    return (
      <Animated.View
        style={[
          styles.emptyCell,
          {
            width: size,
            height: size,
            borderColor: theme.border,
          },
        ]}
      />
    )
  }

  const tileColor = theme.tiles[tile.value] ?? theme.tiles[1]!
  const inkColor = theme.tileInk[tile.value] ?? '#FFFFFF'
  const fontSize = Math.max(18, Math.floor(size * 0.42))
  const outline = selected
    ? theme.tileSelected
    : hinted
      ? theme.tileHint
      : 'transparent'

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityLabel={`Tile ${tile.value}`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        disabled={tile.removed}
        onPress={() => onPress(tile.id)}
        style={[
          styles.tile,
          {
            width: size,
            height: size,
            backgroundColor: tileColor,
            borderColor: outline,
            borderWidth: selected || hinted ? 3 : 0,
          },
        ]}>
        <Text style={[styles.value, { fontSize, color: inkColor }]}>
          {tile.value}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

/**
 * The board re-renders on every store change (score ticks, coin counts, hint
 * state). Without this every tile re-renders mid-animation and the clear
 * transition stutters. Engine updates preserve the identity of untouched
 * `Tile` objects, so reference equality is a safe comparison here.
 */
export const TileView = memo(
  TileViewBase,
  (prev, next) =>
    prev.tile === next.tile &&
    prev.size === next.size &&
    prev.selected === next.selected &&
    prev.hinted === next.hinted &&
    prev.theme === next.theme &&
    prev.onPress === next.onPress,
)

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    borderRadius: RADIUS.xs,
    justifyContent: 'center',
  },
  emptyCell: {
    borderRadius: RADIUS.xs,
    borderStyle: 'dashed',
    borderWidth: 1,
    opacity: 0.25,
  },
  value: {
    fontWeight: '600',
  },
})
