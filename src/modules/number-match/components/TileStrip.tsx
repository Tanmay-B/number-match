import { StyleSheet, Text, View } from 'react-native'
import type { AppTheme } from '@modules/number-match/constants/palette'
import { RADIUS, SPACING, TYPE } from '@modules/number-match/constants/tokens'

/** Values chosen to spread across the palette rather than to mean anything. */
const STRIP_VALUES = [2, 8, 3, 7, 1]

type TileStripProps = {
  theme: AppTheme
}

/** Decorative row of board tiles used as a divider under the logo. */
export function TileStrip({ theme }: TileStripProps) {
  return (
    <View accessible={false} style={styles.row}>
      {STRIP_VALUES.map(value => (
        <View
          key={value}
          style={[styles.tile, { backgroundColor: theme.tiles[value] }]}>
          <Text style={[styles.value, { color: theme.tileInk[value] }]}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
  },
  tile: {
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
  },
  value: {
    ...TYPE.label,
    fontSize: 17,
  },
})
