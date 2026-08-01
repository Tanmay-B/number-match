export const STORAGE_KEYS = {
  THEME_MODE: 'number_match_theme_mode_v1',
  SETTINGS: 'number_match_settings_v1',
  STATS: 'number_match_stats_v1',
  GAME: 'number_match_game_v1',
  COINS: 'number_match_coins_v1',
  DAILY_REWARD: 'number_match_daily_reward_v1',
  STREAK: 'number_match_streak_v1',
  VISUAL_THEME: 'number_match_visual_theme_v1',
  UNLOCKED_THEMES: 'number_match_unlocked_themes_v1',
} as const

export const APP_VERSION = '0.0.1'

export const COIN_COSTS = {
  hint: 10,
  undo: 5,
  shuffle: 15,
  addLines: 20,
} as const

export const COIN_REWARDS = {
  boardComplete: 20,
  dailyReward: 50,
} as const

export const VISUAL_THEMES = [
  'classic',
  'dark',
  'ocean',
  'forest',
  'candy',
  'minimal',
] as const

export type VisualThemeId = (typeof VISUAL_THEMES)[number]

export const DEFAULT_UNLOCKED_THEMES: VisualThemeId[] = ['classic', 'dark']
