import { View } from 'react-native'
import Svg, { Circle, Polygon, Polyline } from 'react-native-svg'

type SparklineProps = {
  values: number[]
  color: string
  width: number
  height: number
  /** Highlights the most recent point with a dot. */
  showLast?: boolean
}

/**
 * Minimal trend line for recent scores. Renders nothing below two points, since
 * a single value has no trend to show.
 */
export function Sparkline({
  values,
  color,
  width,
  height,
  showLast = true,
}: SparklineProps) {
  if (values.length < 2) {
    return <View style={{ width, height }} />
  }

  const padding = 3
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = (width - padding * 2) / (values.length - 1)

  const points = values.map((value, index) => ({
    x: padding + index * stepX,
    y: padding + (1 - (value - min) / range) * (height - padding * 2),
  }))

  const linePoints = points.map(point => `${point.x},${point.y}`).join(' ')
  const areaPoints = `${padding},${height} ${linePoints} ${
    width - padding
  },${height}`
  const last = points[points.length - 1]!

  return (
    <Svg height={height} width={width}>
      <Polygon fill={color} opacity={0.14} points={areaPoints} />
      <Polyline
        fill="none"
        points={linePoints}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      {showLast ? <Circle cx={last.x} cy={last.y} fill={color} r={3.5} /> : null}
    </Svg>
  )
}
