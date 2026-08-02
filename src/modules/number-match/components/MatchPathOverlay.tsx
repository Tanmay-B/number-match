import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'
import Svg, { Circle, Polyline } from 'react-native-svg'
import { getCellCenter } from '@modules/number-match/constants/layout'

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline)

export type MatchCell = { row: number; col: number }

export type MatchPath = {
  a: MatchCell
  b: MatchCell
  /** Bumped on every match so the overlay replays its draw animation. */
  token: number
}

type Point = { x: number; y: number }

/**
 * Builds the polyline(s) connecting two matched tiles.
 *
 * Straight and adjacent matches are one segment. A row-wrap match (last column
 * of one row to the first column of the next) is drawn as two segments running
 * off each side of the board, mirroring how the rule actually reads.
 */
export function buildMatchSegments(
  a: MatchCell,
  b: MatchCell,
  gridSize: number,
  tileSize: number,
  boardSize: number,
): Point[][] {
  const centerA = getCellCenter(a.row, a.col, tileSize)
  const centerB = getCellCenter(b.row, b.col, tileSize)

  const rowDelta = Math.abs(a.row - b.row)
  const colDelta = Math.abs(a.col - b.col)
  const isAdjacent = rowDelta <= 1 && colDelta <= 1
  const isStraight = a.row === b.row || a.col === b.col

  if (isAdjacent || isStraight) {
    return [[centerA, centerB]]
  }

  // Row wrap: whichever tile sits in the last column exits right, the other
  // enters from the left of the row below.
  const aExitsRight = a.col === gridSize - 1
  const exitsRight = aExitsRight ? centerA : centerB
  const entersLeft = aExitsRight ? centerB : centerA

  return [
    [exitsRight, { x: boardSize, y: exitsRight.y }],
    [{ x: 0, y: entersLeft.y }, entersLeft],
  ]
}

function segmentLength(points: Point[]): number {
  let total = 0
  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1]!
    const current = points[i]!
    total += Math.hypot(current.x - previous.x, current.y - previous.y)
  }
  return Math.max(total, 1)
}

function toPointsString(points: Point[]): string {
  return points.map(point => `${point.x},${point.y}`).join(' ')
}

type SegmentProps = {
  points: Point[]
  color: string
  strokeWidth: number
  progress: SharedValue<number>
}

function Segment({ points, color, strokeWidth, progress }: SegmentProps) {
  const length = segmentLength(points)
  const pointsString = toPointsString(points)

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - progress.value),
  }))

  return (
    <>
      <Polyline
        fill="none"
        opacity={0.25}
        points={pointsString}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth * 2.4}
      />
      <AnimatedPolyline
        animatedProps={animatedProps}
        fill="none"
        points={pointsString}
        stroke={color}
        strokeDasharray={`${length} ${length}`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </>
  )
}

type MatchPathOverlayProps = {
  match: MatchPath | null
  gridSize: number
  tileSize: number
  boardSize: number
  color: string
}

export function MatchPathOverlay({
  match,
  gridSize,
  tileSize,
  boardSize,
  color,
}: MatchPathOverlayProps) {
  const progress = useSharedValue(0)
  const opacity = useSharedValue(0)
  const token = match?.token ?? 0

  useEffect(() => {
    if (token === 0) {
      return
    }

    progress.value = 0
    progress.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    })
    opacity.value = withSequence(
      withTiming(1, { duration: 90 }),
      withDelay(180, withTiming(0, { duration: 200 })),
    )
  }, [opacity, progress, token])

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  // The Svg host stays mounted for the whole game rather than appearing with
  // each match: creating a native view on the same frame the matched tiles
  // start animating is exactly when there is no budget for it. Opacity is 0
  // while idle, so nothing is drawn.
  const segments = match
    ? buildMatchSegments(match.a, match.b, gridSize, tileSize, boardSize)
    : []
  const strokeWidth = Math.max(4, Math.round(tileSize * 0.09))
  const endpointRadius = strokeWidth * 0.9

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, containerStyle]}>
      <Svg height={boardSize} width={boardSize}>
        {segments.map((points, index) => (
          <Segment
            // Segment count and order are stable for a given token.
            key={`${token}-${index}`}
            color={color}
            points={points}
            progress={progress}
            strokeWidth={strokeWidth}
          />
        ))}
        {(match ? [match.a, match.b] : []).map(cell => {
          const center = getCellCenter(cell.row, cell.col, tileSize)
          return (
            <Circle
              key={`${token}-dot-${cell.row}-${cell.col}`}
              cx={center.x}
              cy={center.y}
              fill={color}
              r={endpointRadius}
            />
          )
        })}
      </Svg>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
})
