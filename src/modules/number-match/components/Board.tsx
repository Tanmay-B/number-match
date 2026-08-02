import { StyleSheet, View } from 'react-native'
import {
  BOARD_GAP,
  getBoardSize,
  getTileSize,
} from '@modules/number-match/constants/layout'
import type { AppTheme } from '@modules/number-match/constants/palette'
import type { GameState } from '@modules/number-match/engine/types'
import { MatchPathOverlay, type MatchPath } from './MatchPathOverlay'
import { TileView } from './TileView'

type BoardProps = {
  game: GameState
  theme: AppTheme
  hintedTileIds?: string[]
  matchPath?: MatchPath | null
  onTilePress: (tileId: string) => void
}

export function Board({
  game,
  theme,
  hintedTileIds = [],
  matchPath = null,
  onTilePress,
}: BoardProps) {
  const tileSize = getTileSize(game.gridSize)
  const boardSize = getBoardSize(game.gridSize)

  return (
    <View style={[styles.board, { width: boardSize, height: boardSize }]}>
      {Array.from({ length: game.gridSize }).map((_, row) => (
        <View key={`row-${row}`} style={styles.row}>
          {Array.from({ length: game.gridSize }).map((__, col) => {
            const tile = game.tiles.find(
              current => current.row === row && current.col === col,
            )

            if (!tile) {
              return (
                <View
                  key={`empty-${row}-${col}`}
                  style={{ width: tileSize, height: tileSize }}
                />
              )
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

      <MatchPathOverlay
        boardSize={boardSize}
        color={theme.path}
        gridSize={game.gridSize}
        match={matchPath}
        tileSize={tileSize}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  board: {
    gap: BOARD_GAP,
  },
  row: {
    flexDirection: 'row',
    gap: BOARD_GAP,
  },
})
