import { useState } from 'react'
import { Linking, ScrollView, Share, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { BackHeader } from '@modules/number-match/components/BackHeader'
import { BottomNav } from '@modules/number-match/components/BottomNav'
import { FloatingNumbers } from '@modules/number-match/components/FloatingNumbers'
import { Icon } from '@modules/number-match/components/Icon'
import { ModalShell } from '@modules/number-match/components/ModalShell'
import { PrimaryButton } from '@modules/number-match/components/PrimaryButton'
import {
  SettingLinkRow,
  SettingToggleRow,
} from '@modules/number-match/components/SettingRow'
import { THEME_LABELS } from '@modules/number-match/constants/palette'
import { APP_VERSION } from '@modules/number-match/constants/storage'
import {
  RADIUS,
  SPACING,
  TYPE,
} from '@modules/number-match/constants/tokens'
import { useAppTheme } from '@global/hooks/useAppTheme'
import { getPrimaryShareUrl } from '@infra/share/appLinks'
import { useGameStore } from '@store/game.store'
import { useSettingsStore } from '@store/settings.store'
import { useStatsStore } from '@store/stats.store'
import { AppRoutes, AppStackParams } from '@router/routes'

type Props = NativeStackScreenProps<AppStackParams, AppRoutes.SETTINGS>

function Section({
  title,
  theme,
  children,
}: {
  title: string
  theme: ReturnType<typeof useAppTheme>['theme']
  children: React.ReactNode
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.muted }]}>
        {title.toUpperCase()}
      </Text>
      <View
        style={[
          styles.sectionBody,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}>
        {children}
      </View>
    </View>
  )
}

export function SettingsScreen({ navigation }: Props) {
  const { theme, isDark, toggleThemeMode, visualThemeId } = useAppTheme()
  const soundEnabled = useSettingsStore(state => state.soundEnabled)
  const musicEnabled = useSettingsStore(state => state.musicEnabled)
  const hapticsEnabled = useSettingsStore(state => state.hapticsEnabled)
  const setSoundEnabled = useSettingsStore(state => state.setSoundEnabled)
  const setMusicEnabled = useSettingsStore(state => state.setMusicEnabled)
  const setHapticsEnabled = useSettingsStore(state => state.setHapticsEnabled)
  const resetStats = useStatsStore(state => state.resetStats)
  const clearSavedGame = useGameStore(state => state.clearSavedGame)
  const [confirmingReset, setConfirmingReset] = useState(false)

  const shareUrl = getPrimaryShareUrl()

  async function handleShare() {
    try {
      await Share.share({
        message: `Play Number Match — ${shareUrl}`,
        url: shareUrl,
      })
    } catch {
      // The user dismissed the share sheet.
    }
  }

  function handleResetProgress() {
    resetStats()
    clearSavedGame()
    setConfirmingReset(false)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FloatingNumbers opacity={0.6} theme={theme} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <BackHeader
          onBack={() => navigation.goBack()}
          theme={theme}
          title="Settings"
        />

        <Section theme={theme} title="Audio & Feedback">
          <SettingToggleRow
            icon="volume"
            label="Sound"
            onValueChange={setSoundEnabled}
            subtitle="Match and button effects"
            theme={theme}
            value={soundEnabled}
          />
          <SettingToggleRow
            icon="music"
            label="Music"
            onValueChange={setMusicEnabled}
            subtitle="Background soundtrack"
            theme={theme}
            value={musicEnabled}
          />
          <SettingToggleRow
            icon="vibrate"
            label="Haptics"
            last
            onValueChange={setHapticsEnabled}
            subtitle="Vibrate on match"
            theme={theme}
            value={hapticsEnabled}
          />
        </Section>

        <Section theme={theme} title="Appearance">
          <SettingToggleRow
            icon={isDark ? 'moon' : 'sun'}
            label="Dark Mode"
            onValueChange={() => toggleThemeMode()}
            subtitle="Applies on top of your theme"
            theme={theme}
            value={isDark}
          />
          <SettingLinkRow
            icon="palette"
            label="Board Theme"
            last
            onPress={() => navigation.navigate(AppRoutes.THEMES)}
            theme={theme}
            value={THEME_LABELS[visualThemeId]}
          />
        </Section>

        <Section theme={theme} title="About">
          <SettingLinkRow
            icon="file"
            label="Privacy Policy"
            onPress={() => Linking.openURL(`${shareUrl}/privacy`)}
            theme={theme}
          />
          <SettingLinkRow
            icon="star"
            label="Rate App"
            onPress={() => Linking.openURL(shareUrl)}
            theme={theme}
          />
          <SettingLinkRow
            icon="share"
            label="Share with friends"
            last
            onPress={handleShare}
            subtitle={shareUrl}
            theme={theme}
          />
        </Section>

        <Section theme={theme} title="Danger Zone">
          <SettingLinkRow
            icon="alert"
            label="Reset Progress"
            last
            onPress={() => setConfirmingReset(true)}
            subtitle="Clears stats and your saved board"
            theme={theme}
            tone="danger"
          />
        </Section>

        <Text style={[styles.version, { color: theme.muted }]}>
          Number Match v{APP_VERSION}
        </Text>
      </ScrollView>

      <View style={styles.navWrap}>
        <BottomNav
          active="settings"
          onNavigate={route => navigation.navigate(route)}
          theme={theme}
        />
      </View>

      {confirmingReset ? (
        <ModalShell onDismiss={() => setConfirmingReset(false)} theme={theme}>
          <View style={styles.warningIcon}>
            <Icon color={theme.danger.bg} name="alert" size={44} strokeWidth={1.6} />
          </View>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Reset Progress?
          </Text>
          <Text style={[styles.modalBody, { color: theme.muted }]}>
            This permanently clears your statistics and saved board. Coins and
            unlocked themes are kept. This cannot be undone.
          </Text>
          <PrimaryButton
            label="Reset Everything"
            onPress={handleResetProgress}
            theme={theme}
            variant="danger"
          />
          <PrimaryButton
            label="Cancel"
            onPress={() => setConfirmingReset(false)}
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
    gap: SPACING.lg,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    ...TYPE.overline,
    paddingHorizontal: SPACING.xs,
  },
  sectionBody: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  version: {
    ...TYPE.caption,
    textAlign: 'center',
  },
  warningIcon: {
    alignItems: 'center',
  },
  modalTitle: {
    ...TYPE.title,
    fontSize: 22,
    textAlign: 'center',
  },
  modalBody: {
    ...TYPE.body,
    textAlign: 'center',
  },
})
