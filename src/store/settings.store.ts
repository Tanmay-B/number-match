import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { STORAGE_KEYS } from '@modules/number-match/constants/storage'

type SettingsStore = {
  soundEnabled: boolean
  musicEnabled: boolean
  hapticsEnabled: boolean
  isHydrated: boolean
  setSoundEnabled: (enabled: boolean) => void
  setMusicEnabled: (enabled: boolean) => void
  setHapticsEnabled: (enabled: boolean) => void
  hydrateSettings: () => Promise<void>
}

type PersistedSettings = {
  soundEnabled: boolean
  musicEnabled: boolean
  hapticsEnabled: boolean
}

export const useSettingsStore = create<SettingsStore>(set => ({
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
  isHydrated: false,
  setSoundEnabled: soundEnabled => {
    set({ soundEnabled })
    persistSettings({ soundEnabled })
  },
  setMusicEnabled: musicEnabled => {
    set({ musicEnabled })
    persistSettings({ musicEnabled })
  },
  setHapticsEnabled: hapticsEnabled => {
    set({ hapticsEnabled })
    persistSettings({ hapticsEnabled })
  },
  hydrateSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (!raw) {
        set({ isHydrated: true })
        return
      }

      const saved = JSON.parse(raw) as Partial<PersistedSettings>
      set({
        soundEnabled: saved.soundEnabled ?? true,
        musicEnabled: saved.musicEnabled ?? true,
        hapticsEnabled: saved.hapticsEnabled ?? true,
        isHydrated: true,
      })
    } catch {
      set({ isHydrated: true })
    }
  },
}))

async function persistSettings(partial: Partial<PersistedSettings>) {
  try {
    const current = useSettingsStore.getState()
    await AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify({
        soundEnabled: partial.soundEnabled ?? current.soundEnabled,
        musicEnabled: partial.musicEnabled ?? current.musicEnabled,
        hapticsEnabled: partial.hapticsEnabled ?? current.hapticsEnabled,
      }),
    )
  } catch {
    // Ignore persistence errors
  }
}
