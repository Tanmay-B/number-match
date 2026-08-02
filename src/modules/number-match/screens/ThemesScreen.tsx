import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { BackHeader } from '@modules/number-match/components/BackHeader'
import { BottomNav } from '@modules/number-match/components/BottomNav'
import { ConfettiDots } from '@modules/number-match/components/ConfettiDots'
import { CoinAmount } from '@modules/number-match/components/CoinAmount'
import { CoinBadge } from '@modules/number-match/components/CoinBadge'
import { Icon } from '@modules/number-match/components/Icon'
import { MiniBoardPreview } from '@modules/number-match/components/MiniBoardPreview'
import { ModalShell } from '@modules/number-match/components/ModalShell'
import { PrimaryButton } from '@modules/number-match/components/PrimaryButton'
import {
  THEME_UNLOCK_COSTS,
  VISUAL_THEMES,
  type VisualThemeId,
} from '@modules/number-match/constants/storage'
import { getThemePreview } from '@modules/number-match/constants/palette'
import {
  RADIUS,
  SPACING,
  TYPE,
  elevation,
} from '@modules/number-match/constants/tokens'
import { useAppTheme } from '@global/hooks/useAppTheme'
import { useGameStore } from '@store/game.store'
import { useVisualThemeStore } from '@store/visualTheme.store'
import { AppRoutes, AppStackParams } from '@router/routes'

type Props = NativeStackScreenProps<AppStackParams, AppRoutes.THEMES>

export function ThemesScreen({ navigation }: Props) {
  const { theme, isDark } = useAppTheme()
  const currentTheme = useVisualThemeStore(state => state.currentTheme)
  const unlockedThemes = useVisualThemeStore(state => state.unlockedThemes)
  const setCurrentTheme = useVisualThemeStore(state => state.setCurrentTheme)
  const unlockTheme = useVisualThemeStore(state => state.unlockTheme)
  const coins = useGameStore(state => state.coins)
  const spendCoins = useGameStore(state => state.spendCoins)
  const [pendingPurchase, setPendingPurchase] = useState<VisualThemeId | null>(
    null,
  )

  const purchaseCost = pendingPurchase
    ? THEME_UNLOCK_COSTS[pendingPurchase]
    : 0
  const canAfford = coins >= purchaseCost
  const purchasePreview = getThemePreview(pendingPurchase ?? 'classic', isDark)

  function handleCardPress(themeId: VisualThemeId) {
    if (unlockedThemes.includes(themeId)) {
      setCurrentTheme(themeId)
      return
    }

    setPendingPurchase(themeId)
  }

  function confirmPurchase() {
    if (!pendingPurchase || !spendCoins(purchaseCost)) {
      return
    }

    unlockTheme(pendingPurchase)
    setCurrentTheme(pendingPurchase)
    setPendingPurchase(null)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ConfettiDots opacity={0.6} theme={theme} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <BackHeader
          onBack={() => navigation.goBack()}
          rightSlot={<CoinBadge coins={coins} compact theme={theme} />}
          theme={theme}
          title="Themes"
        />

        <Text style={[styles.hint, { color: theme.muted }]}>
          Themes recolour the whole board. Light and dark mode still applies on
          top — switch it in Settings.
        </Text>

        <View style={styles.grid}>
          {VISUAL_THEMES.map(themeId => {
            const unlocked = unlockedThemes.includes(themeId)
            const selected = currentTheme === themeId
            const preview = getThemePreview(themeId, isDark)
            const cost = THEME_UNLOCK_COSTS[themeId]

            return (
              <Pressable
                key={themeId}
                accessibilityLabel={`${preview.label} theme${
                  unlocked ? '' : `, costs ${cost} coins`
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => handleCardPress(themeId)}
                style={({ pressed }) => [
                  styles.card,
                  selected ? elevation(2) : elevation(0),
                  {
                    backgroundColor: theme.surface,
                    borderColor: selected ? theme.primary.bg : theme.border,
                    borderWidth: selected ? 2 : 1,
                  },
                  pressed && styles.pressed,
                ]}>
                <MiniBoardPreview
                  background={preview.background}
                  border={preview.border}
                  tileInk={preview.tileInk}
                  tiles={preview.tiles}
                />

                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    {preview.label.toUpperCase()}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[styles.cardBlurb, { color: theme.muted }]}>
                    {preview.blurb}
                  </Text>
                </View>

                {selected ? (
                  <View
                    style={[styles.stateChip, { backgroundColor: theme.primary.bg }]}>
                    <Text
                      style={[
                        styles.stateChipText,
                        { color: theme.primary.ink },
                      ]}>
                      SELECTED
                    </Text>
                  </View>
                ) : unlocked ? (
                  <View
                    style={[
                      styles.stateChip,
                      { backgroundColor: theme.surfaceElevated },
                    ]}>
                    <Text style={[styles.stateChipText, { color: theme.muted }]}>
                      TAP TO USE
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.stateChip,
                      styles.priceChip,
                      { backgroundColor: theme.statBg },
                    ]}>
                    <Icon color={theme.muted} name="lock" size={12} />
                    <CoinAmount amount={cost} color={theme.text} size="small" />
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>
      </ScrollView>

      <View style={styles.navWrap}>
        <BottomNav
          active="themes"
          onNavigate={route => navigation.navigate(route)}
          theme={theme}
        />
      </View>

      {pendingPurchase ? (
        <ModalShell onDismiss={() => setPendingPurchase(null)} theme={theme}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Unlock {purchasePreview.label}
          </Text>

          <View style={styles.modalPreview}>
            <MiniBoardPreview
              background={purchasePreview.background}
              border={purchasePreview.border}
              cell={30}
              tileInk={purchasePreview.tileInk}
              tiles={purchasePreview.tiles}
            />
          </View>

          <View style={styles.modalCostRow}>
            <Text style={[styles.modalCostLabel, { color: theme.muted }]}>
              Price{' '}
            </Text>
            <CoinAmount amount={purchaseCost} color={theme.text} size="medium" />
            <Text style={[styles.modalCostLabel, { color: theme.muted }]}>
              {'  ·  You have '}
            </Text>
            <CoinAmount amount={coins} color={theme.text} size="medium" />
          </View>

          <PrimaryButton
            disabled={!canAfford}
            label={canAfford ? 'Unlock & Apply' : 'Not enough coins'}
            onPress={confirmPurchase}
            theme={theme}
            variant="primary"
          />
          <PrimaryButton
            label="Cancel"
            onPress={() => setPendingPurchase(null)}
            theme={theme}
            variant="ghost"
          />
        </ModalShell>
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navWrap: {
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xs,
  },
  content: {
    gap: SPACING.md,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  hint: {
    ...TYPE.caption,
    marginTop: -SPACING.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  card: {
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
    padding: SPACING.md,
    width: '47%',
  },
  cardText: {
    alignItems: 'center',
    gap: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cardBlurb: {
    ...TYPE.caption,
    fontSize: 11,
    textAlign: 'center',
  },
  stateChip: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    gap: SPACING.xs,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  priceChip: {
    paddingHorizontal: SPACING.sm,
  },
  stateChipText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  modalTitle: {
    ...TYPE.title,
    fontSize: 22,
    textAlign: 'center',
  },
  modalPreview: {
    alignItems: 'center',
  },
  modalCostRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  modalCostLabel: {
    ...TYPE.caption,
  },
})
