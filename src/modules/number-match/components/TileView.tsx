import { Pressable, StyleSheet, Text, View } from 'react-native'
import { getTileFontSize } from '@modules/number-match/constants/layout'
import type { AppTheme } from '@modules/number-match/constants/palette'
import type { Tile } from '@modules/number-match/engine/types'

type TileViewProps = {
  tile: Tile
  size: number
  theme: AppTheme
  selected: boolean
  onPress: (tileId: string) => void
}

export function TileView({
  tile,
  size,
  theme,
  selected,
  onPress,
}: TileViewProps) {
  if (tile.removed) {
    return <View style={{ width: size, height: size }} />
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(tile.id)}
      style={({ pressed }) => [
        styles.tile,
        {
          width: size,
          height: size,
          backgroundColor: selected ? theme.tileSelected : theme.tile,
          borderColor: theme.border,
        },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.value, { fontSize: getTileFontSize(size), color: theme.text }]}>
        {tile.value}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
  value: {
    fontWeight: '800',
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
})
