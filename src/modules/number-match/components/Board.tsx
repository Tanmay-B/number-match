import { StyleSheet, Text, View } from 'react-native'
import { getTileSize } from '@modules/number-match/constants/layout'
import type { AppTheme } from '@modules/number-match/constants/palette'
import type { GameState } from '@modules/number-match/engine/types'
import { TileView } from './TileView'

type BoardProps = {
  game: GameState
  theme: AppTheme
  hintedTileIds?: string[]
  onTilePress: (tileId: string) => void
}

export function Board({ game, theme, hintedTileIds = [], onTilePress }: BoardProps) {
  const tileSize = getTileSize(game.gridSize)
  const activeCount = game.tiles.filter(tile => !tile.removed).length

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.meta, { color: theme.muted }]}>
        {activeCount} tile{activeCount === 1 ? '' : 's'} remaining
      </Text>
      <View style={styles.board}>
        {Array.from({ length: game.gridSize }).map((_, row) => (
          <View key={`row-${row}`} style={styles.row}>
            {Array.from({ length: game.gridSize }).map((__, col) => {
              const tile = game.tiles.find(
                current => current.row === row && current.col === col,
              )

              if (!tile) {
                return null
              }

              return (
                <TileView
                  key={tile.id}
                  hinted={hintedTileIds.includes(tile.id)}
                  onPress={onTilePress}
                  selected={game.selectedTileIds.includes(tile.id)}
                  size={tileSize}
                  theme={theme}
                  tile={tile}
                />
              )
            })}
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 12,
  },
  meta: {
    fontSize: 13,
    fontWeight: '600',
  },
  board: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
})
