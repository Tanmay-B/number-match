import { useEffect, type ReactNode } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { PALETTE } from '@modules/number-match/constants/palette'
import type { AppTheme } from '@modules/number-match/constants/palette'
import {
  RADIUS,
  SPACING,
  elevation,
} from '@modules/number-match/constants/tokens'

type ModalShellProps = {
  theme: AppTheme
  children: ReactNode
  /** Called when the scrim is tapped. Omit to make the modal non-dismissible. */
  onDismiss?: () => void
  zIndex?: number
}

/**
 * Scrim + spring-in sheet shared by every modal, so they all enter the same way.
 */
export function ModalShell({
  theme,
  children,
  onDismiss,
  zIndex = 20,
}: ModalShellProps) {
  const scale = useSharedValue(0.88)
  const translateY = useSharedValue(24)

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 220, mass: 0.7 })
    translateY.value = withSpring(0, { damping: 16, stiffness: 200 })
  }, [scale, translateY])

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }))

  return (
    <Animated.View
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(120)}
      style={[styles.overlay, { zIndex }]}>
      <Pressable
        accessibilityLabel="Close"
        accessibilityRole="button"
        disabled={!onDismiss}
        onPress={onDismiss}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.sheet,
          elevation(3),
          { backgroundColor: theme.surface, borderColor: theme.border },
          sheetStyle,
        ]}>
        {children}
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: PALETTE.overlay,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  sheet: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    gap: SPACING.md,
    padding: SPACING.xl,
    width: '100%',
  },
})
