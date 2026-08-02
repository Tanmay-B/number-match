import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import type { AppTheme } from '@modules/number-match/constants/palette'
import { RADIUS, elevation } from '@modules/number-match/constants/tokens'
import type { Tile } from '@modules/number-match/engine/types'

const SPRING = { damping: 14, stiffness: 220, mass: 0.6 }

type TileViewProps = {
  tile: Tile
  size: number
  theme: AppTheme
  selected: boolean
  hinted: boolean
  onPress: (tileId: string) => void
}

export function TileView({
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

      opacity.value = withTiming(0, { duration: 240 })
      scale.value = withSequence(
        withTiming(1.28, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(0.25, { duration: 160 }, finished => {
          if (finished) {
            runOnJS(setCleared)(true)
          }
        }),
      )
      return
    }

    if (cleared) {
      setCleared(false)
      opacity.value = withTiming(1, { duration: 160 })
      scale.value = withSpring(1, SPRING)
    }
  }, [cleared, opacity, scale, tile.removed])

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
            borderRadius: RADIUS.xs,
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
          elevation(selected ? 3 : 1),
          {
            width: size,
            height: size,
            backgroundColor: tileColor,
            borderColor: outline,
            borderWidth: selected || hinted ? 3 : 0,
            shadowColor: selected ? tileColor : '#000000',
          },
        ]}>
        <Text style={[styles.value, { fontSize, color: inkColor }]}>
          {tile.value}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    borderRadius: RADIUS.xs,
    justifyContent: 'center',
  },
  emptyCell: {
    borderStyle: 'dashed',
    borderWidth: 1,
    opacity: 0.25,
  },
  value: {
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})
