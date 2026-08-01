import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { PrimaryButton } from '@modules/number-match/components/PrimaryButton'
import {
  VISUAL_THEMES,
  type VisualThemeId,
} from '@modules/number-match/constants/storage'
import { useAppTheme } from '@global/hooks/useAppTheme'
import { useVisualThemeStore } from '@store/visualTheme.store'
import { AppRoutes, AppStackParams } from '@router/routes'

type Props = NativeStackScreenProps<AppStackParams, AppRoutes.THEMES>

const THEME_LABELS: Record<VisualThemeId, string> = {
  classic: 'Classic',
  dark: 'Dark',
  ocean: 'Ocean',
  forest: 'Forest',
  candy: 'Candy',
  minimal: 'Minimal',
}

export function ThemesScreen({ navigation }: Props) {
  const { theme } = useAppTheme()
  const currentTheme = useVisualThemeStore(state => state.currentTheme)
  const unlockedThemes = useVisualThemeStore(state => state.unlockedThemes)
  const setCurrentTheme = useVisualThemeStore(state => state.setCurrentTheme)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Themes</Text>

        <View style={styles.grid}>
          {VISUAL_THEMES.map(themeId => {
            const unlocked = unlockedThemes.includes(themeId)
            const selected = currentTheme === themeId

            return (
              <Pressable
                key={themeId}
                disabled={!unlocked}
                onPress={() => setCurrentTheme(themeId)}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.surface,
                    borderColor: selected ? '#4F46E5' : theme.border,
                  },
                  !unlocked && styles.locked,
                ]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {THEME_LABELS[themeId]}
                </Text>
                <Text style={[styles.cardMeta, { color: theme.muted }]}>
                  {unlocked ? (selected ? 'Selected' : 'Unlocked') : 'Locked'}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <PrimaryButton
          label="Back"
          onPress={() => navigation.goBack()}
          theme={theme}
          variant="secondary"
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 96,
    padding: 16,
    width: '47%',
  },
  locked: {
    opacity: 0.55,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardMeta: {
    fontSize: 13,
    marginTop: 8,
  },
})
