import { useEffect } from 'react'
import { StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { PALETTE } from '@modules/number-match/constants/palette'

type CoinIconProps = {
  size?: number
  style?: ViewStyle
}

export function CoinIcon({ size = 14, style }: CoinIconProps) {
  const inner = Math.max(4, Math.round(size * 0.55))

  return (
    <View
      style={[
        styles.icon,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}>
      <View
        style={{
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          backgroundColor: PALETTE.coinLight,
        }}
      />
    </View>
  )
}

type AnimatedCoinIconProps = {
  size?: number
  spinKey?: number
  style?: ViewStyle
}

export function AnimatedCoinIcon({
  size = 14,
  spinKey = 0,
  style,
}: AnimatedCoinIconProps) {
  const rotateY = useSharedValue(0)
  const scale = useSharedValue(1)

  useEffect(() => {
    if (spinKey === 0) {
      return
    }

    rotateY.value = 0
    scale.value = 1
    rotateY.value = withTiming(720, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    })
    scale.value = withSequence(
      withTiming(1.25, { duration: 180 }),
      withTiming(1, { duration: 470 }),
    )
  }, [rotateY, scale, spinKey])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 600 }, { rotateY: `${rotateY.value}deg` }, { scale: scale.value }],
  }))

  return (
    <Animated.View style={[animatedStyle, style]}>
      <CoinIcon size={size} />
    </Animated.View>
  )
}

type CoinAmountProps = {
  amount: number
  size?: 'small' | 'medium'
  prefix?: string
  color?: string
  style?: ViewStyle
  textStyle?: TextStyle
  spinKey?: number
}

export function CoinAmount({
  amount,
  size = 'small',
  prefix,
  color,
  style,
  textStyle,
  spinKey = 0,
}: CoinAmountProps) {
  const iconSize = size === 'small' ? 12 : 16
  const fontSize = size === 'small' ? 11 : 14

  return (
    <View style={[styles.amountRow, style]}>
      {prefix ? (
        <Text style={[styles.amountText, { color, fontSize }, textStyle]}>{prefix}</Text>
      ) : null}
      <Text style={[styles.amountText, { color, fontSize }, textStyle]}>{amount}</Text>
      {spinKey > 0 ? (
        <AnimatedCoinIcon size={iconSize} spinKey={spinKey} />
      ) : (
        <CoinIcon size={iconSize} />
      )}
    </View>
  )
}

type CoinCostProps = {
  cost: number | 'free'
  color?: string
  style?: ViewStyle
  spinKey?: number
}

export function CoinCost({ cost, color, style, spinKey = 0 }: CoinCostProps) {
  if (cost === 'free') {
    return (
      <Text style={[styles.freeText, { color }, style]}>Free</Text>
    )
  }

  return (
    <CoinAmount
      amount={cost}
      color={color}
      spinKey={spinKey}
      style={StyleSheet.flatten([styles.centered, style])}
    />
  )
}

type NeedCoinsReasonProps = {
  amount: number
  color?: string
}

export function NeedCoinsReason({ amount, color }: NeedCoinsReasonProps) {
  return (
    <View style={styles.needRow}>
      <Text style={[styles.needText, { color }]}>Need </Text>
      <CoinAmount amount={amount} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    backgroundColor: PALETTE.coin,
    borderColor: PALETTE.coinDark,
    borderWidth: 1,
    justifyContent: 'center',
  },
  amountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  amountText: {
    fontWeight: '700',
  },
  freeText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  centered: {
    justifyContent: 'center',
  },
  needRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  needText: {
    fontSize: 10,
    lineHeight: 13,
  },
})
