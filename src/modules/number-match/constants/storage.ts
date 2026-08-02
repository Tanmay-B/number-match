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
  AD_REWARDS: 'number_match_ad_rewards_v1',
} as const

export const APP_VERSION = '0.0.1'

export const COIN_COSTS = {
  hint: 3,
  undo: 3,
  shuffle: 3,
  addLines: 5,
} as const

export const COIN_REWARDS = {
  boardComplete: 20,
  dailyReward: 50,
} as const

export const STARTING_COINS = 30

export const AD_REWARDS = {
  rewardedCoins: 18,
  dailyCap: 6,
} as const

/**
 * Visual themes recolour the whole app (board, surfaces, accents). Light vs
 * dark is a separate axis handled by the theme-mode toggle, so there is
 * deliberately no `dark` entry here — see `resolveAppTheme` in palette.ts.
 */
export const VISUAL_THEMES = [
  'candy',
  'classic',
  'ocean',
  'forest',
  'minimal',
] as const

export type VisualThemeId = (typeof VISUAL_THEMES)[number]

export const DEFAULT_VISUAL_THEME: VisualThemeId = 'candy'

export const DEFAULT_UNLOCKED_THEMES: VisualThemeId[] = ['candy']

/** Coin price to unlock a theme. `0` means unlocked from the start. */
export const THEME_UNLOCK_COSTS: Record<VisualThemeId, number> = {
  candy: 0,
  classic: 400,
  ocean: 600,
  forest: 800,
  minimal: 1000,
}
