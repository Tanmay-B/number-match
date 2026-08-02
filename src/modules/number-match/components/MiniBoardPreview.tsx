import { StyleSheet, Text, View } from 'react-native'
import { RADIUS, SPACING } from '@modules/number-match/constants/tokens'

/** Tile values laid out 3x3, chosen to show a spread of the palette. */
const PREVIEW_VALUES = [
  [3, 7, 1],
  [5, 2, 8],
  [4, 9, 6],
]

type MiniBoardPreviewProps = {
  tiles: Record<number, string>
  tileInk: Record<number, string>
  background: string
  border: string
  /** Edge length of each tile in the preview. */
  cell?: number
}

/**
 * Renders a real (miniature) board in a theme's own colours, so the theme card
 * shows what the player is actually choosing rather than abstract swatches.
 */
export function MiniBoardPreview({
  tiles,
  tileInk,
  background,
  border,
  cell = 20,
}: MiniBoardPreviewProps) {
  return (
    <View style={[styles.board, { backgroundColor: background, borderColor: border }]}>
      {PREVIEW_VALUES.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map(value => (
            <View
              key={`${rowIndex}-${value}`}
              style={[
                styles.tile,
                {
                  width: cell,
                  height: cell,
                  backgroundColor: tiles[value] ?? tiles[1],
                },
              ]}>
              <Text
                style={[
                  styles.value,
                  {
                    fontSize: Math.round(cell * 0.5),
                    color: tileInk[value] ?? '#FFFFFF',
                  },
                ]}>
                {value}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  board: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 3,
    padding: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    gap: 3,
  },
  tile: {
    alignItems: 'center',
    borderRadius: 4,
    justifyContent: 'center',
  },
  value: {
    fontWeight: '500',
  },
})
