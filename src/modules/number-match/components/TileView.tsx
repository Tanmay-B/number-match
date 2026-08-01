import { Pressable, StyleSheet, Text, View } from 'react-native'
import { getTileFontSize } from '@modules/number-match/constants/layout'
import type { AppTheme } from '@modules/number-match/constants/palette'
import type { Tile } from '@modules/number-match/engine/types'

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
  if (tile.removed) {
    return (
      <View
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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onPress(tile.id)}
      style={({ pressed }) => [
        styles.tile,
        {
          width: size,
          height: size,
          backgroundColor: selected
            ? theme.tileSelected
            : hinted
              ? theme.tile
              : theme.tile,
          borderColor: hinted ? '#F59E0B' : selected ? '#4F46E5' : theme.border,
          borderWidth: selected || hinted ? 2 : 1,
        },
        pressed && styles.pressed,
      ]}>
      <Text
        style={[
          styles.value,
          { fontSize: getTileFontSize(size), color: theme.text },
        ]}>
        {tile.value}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
  },
  emptyCell: {
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    opacity: 0.35,
  },
  value: {
    fontWeight: '800',
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
})
