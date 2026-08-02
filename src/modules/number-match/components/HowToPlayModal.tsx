import { StyleSheet, Text, View } from 'react-native'
import type { AppTheme } from '@modules/number-match/constants/palette'
import { GAME_RULES } from '@modules/number-match/constants/gameCopy'
import { RADIUS, SPACING, TYPE } from '@modules/number-match/constants/tokens'
import { ModalShell } from './ModalShell'
import { PrimaryButton } from './PrimaryButton'

/** Sample tiles illustrating the two ways a pair can match. */
const EXAMPLE_PAIRS: { left: number; right: number; caption: string }[] = [
  { left: 4, right: 4, caption: 'same' },
  { left: 3, right: 7, caption: 'sum 10' },
]

type HowToPlayModalProps = {
  theme: AppTheme
  onClose: () => void
}

export function HowToPlayModal({ theme, onClose }: HowToPlayModalProps) {
  return (
    <ModalShell onDismiss={onClose} theme={theme}>
      <Text style={[styles.title, { color: theme.text }]}>How to play</Text>

      <View style={styles.exampleRow}>
        {EXAMPLE_PAIRS.map(pair => (
          <View key={pair.caption} style={styles.example}>
            <MiniTile theme={theme} value={pair.left} />
            <Text style={[styles.operator, { color: theme.muted }]}>+</Text>
            <MiniTile theme={theme} value={pair.right} />
            <Text style={[styles.exampleLabel, { color: theme.muted }]}>
              {pair.caption}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.rules}>
        {GAME_RULES.map((rule, index) => (
          <View key={rule} style={styles.ruleRow}>
            <View style={[styles.ruleIndex, { backgroundColor: theme.statBg }]}>
              <Text style={[styles.ruleIndexText, { color: theme.muted }]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[styles.ruleText, { color: theme.text }]}>{rule}</Text>
          </View>
        ))}
      </View>

      <PrimaryButton
        label="Got it"
        onPress={onClose}
        theme={theme}
        variant="primary"
      />
    </ModalShell>
  )
}

function MiniTile({ value, theme }: { value: number; theme: AppTheme }) {
  return (
    <View style={[styles.miniTile, { backgroundColor: theme.tiles[value] }]}>
      <Text style={[styles.miniTileText, { color: theme.tileInk[value] }]}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    ...TYPE.title,
    textAlign: 'center',
  },
  exampleRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    justifyContent: 'center',
  },
  example: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  operator: {
    fontSize: 14,
    fontWeight: '500',
  },
  exampleLabel: {
    ...TYPE.caption,
    fontSize: 11,
    marginLeft: SPACING.xs,
  },
  miniTile: {
    alignItems: 'center',
    borderRadius: RADIUS.xs,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  miniTileText: {
    fontSize: 13,
    fontWeight: '500',
  },
  rules: {
    gap: SPACING.sm,
  },
  ruleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
  },
  ruleIndex: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  ruleIndexText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ruleText: {
    ...TYPE.caption,
    flex: 1,
    fontSize: 13,
  },
})
