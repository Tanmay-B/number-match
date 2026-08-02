import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { AppTheme } from '@modules/number-match/constants/palette'
import {
  RADIUS,
  SPACING,
  TYPE,
  HIT_SLOP,
} from '@modules/number-match/constants/tokens'
import { Icon } from './Icon'

type BackHeaderProps = {
  title: string
  theme: AppTheme
  onBack: () => void
  /** Optional trailing content, e.g. a coin badge. */
  rightSlot?: ReactNode
}

export function BackHeader({
  title,
  theme,
  onBack,
  rightSlot,
}: BackHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        hitSlop={HIT_SLOP}
        onPress={onBack}
        style={({ pressed }) => [
          styles.back,
          { backgroundColor: theme.surface, borderColor: theme.border },
          pressed && styles.pressed,
        ]}>
        <Icon color={theme.text} name="chevronLeft" size={20} />
      </Pressable>

      <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
        {title.toUpperCase()}
      </Text>

      <View style={styles.rightSlot}>{rightSlot}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
    minHeight: 40,
  },
  back: {
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    ...TYPE.heading,
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.7,
  },
})
