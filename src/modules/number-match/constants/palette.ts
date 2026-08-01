export const PALETTE = {
  primary: '#4F46E5',
  primaryLight: '#6366F1',
  accent: '#F59E0B',
  success: '#10B981',
  danger: '#EF4444',
  tileBg: '#FFFFFF',
  tileBgDark: '#2A2A3C',
  tileSelected: '#E0E7FF',
  tileSelectedDark: '#3730A3',
  tileMatched: '#D1FAE5',
  bgDark: '#0F0F14',
  bgLight: '#F8FAFC',
  surfaceDark: '#1A1A24',
  surfaceLight: '#FFFFFF',
  textDark: '#F8FAFC',
  textLight: '#0F172A',
  mutedDark: '#94A3B8',
  mutedLight: '#64748B',
  borderDark: '#334155',
  borderLight: '#E2E8F0',
  coin: '#FBBF24',
} as const

export const darkTheme = {
  background: PALETTE.bgDark,
  surface: PALETTE.surfaceDark,
  text: PALETTE.textDark,
  muted: PALETTE.mutedDark,
  border: PALETTE.borderDark,
  tile: PALETTE.tileBgDark,
  tileSelected: PALETTE.tileSelectedDark,
} as const

export const lightTheme = {
  background: PALETTE.bgLight,
  surface: PALETTE.surfaceLight,
  text: PALETTE.textLight,
  muted: PALETTE.mutedLight,
  border: PALETTE.borderLight,
  tile: PALETTE.tileBg,
  tileSelected: PALETTE.tileSelected,
} as const

export type AppTheme = typeof lightTheme | typeof darkTheme
