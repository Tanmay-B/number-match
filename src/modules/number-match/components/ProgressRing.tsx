import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

type ProgressRingProps = {
  /** 0–1. Values outside the range are clamped. */
  progress: number
  size: number
  strokeWidth: number
  color: string
  trackColor: string
  label: string
  labelColor: string
}

export function ProgressRing({
  progress,
  size,
  strokeWidth,
  color,
  trackColor,
  label,
  labelColor,
}: ProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, progress))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <View style={{ width: size, height: size }}>
      <Svg height={size} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          origin={`${size / 2}, ${size / 2}`}
          r={radius}
          rotation={-90}
          stroke={color}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </Svg>
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  labelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
  },
})
