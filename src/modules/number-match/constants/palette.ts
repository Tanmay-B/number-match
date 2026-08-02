import {
  VISUAL_THEMES,
  type VisualThemeId,
} from '@modules/number-match/constants/storage'

/**
 * A filled surface plus the ink that belongs on it. Every candy-styled chip,
 * button and badge is a role, so a caller never has to guess a text colour.
 */
export type ColorRole = { bg: string; ink: string }

/** Colours that never change between themes or modes. */
export const PALETTE = {
  coin: '#FAC775',
  coinDark: '#D9A344',
  coinLight: '#FDE6B8',
  danger: '#E5484D',
  success: '#3DBE7C',
  overlay: 'rgba(12, 6, 38, 0.76)',
} as const

export const DANGER_ROLE: ColorRole = { bg: '#E5484D', ink: '#FFF1F1' }

function hexToRgb(hex: string) {
  const value = hex.replace('#', '')
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const channel = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase()
}

/** Blends a colour toward white. `amount` of 1 returns pure white. */
export function tint(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  )
}

/**
 * Near-white, tinted toward the source hue. Used for numerals sitting on a
 * coloured tile so the text belongs to the tile instead of floating on it.
 */
export function softInk(hex: string): string {
  return tint(hex, 0.88)
}

/** Colour slots that differ between light and dark mode. */
type ThemeSurfaces = {
  background: string
  surface: string
  surfaceElevated: string
  statBg: string
  border: string
  text: string
  muted: string
  /** Background of an empty board cell. */
  tile: string
  /** Outline of the currently selected tile. */
  tileSelected: string
  /** Outline of a hinted tile. */
  tileHint: string
  /** Stroke of the connect-the-match path drawn over the board. */
  path: string
}

/**
 * The six candy roles. Shared across light and dark mode, because a saturated
 * chip and its ink stay legible on either page background.
 */
type ThemeRoles = {
  /** Main call to action. */
  primary: ColorRole
  /** Secondary call to action. */
  secondary: ColorRole
  /** Currency, ads, attention. */
  accent: ColorRole
  /** Rewards and playful highlights. */
  accentAlt: ColorRole
  /** Helper and informational surfaces. */
  support: ColorRole
  /** Streaks and energy. */
  warm: ColorRole
}

export type AppTheme = ThemeSurfaces &
  ThemeRoles & {
    id: VisualThemeId
    isDark: boolean
    danger: ColorRole
    success: string
    /** Tile face colour per number 1-9. */
    tiles: Record<number, string>
    /** Matching numeral colour per number 1-9. */
    tileInk: Record<number, string>
  }

type ThemeDefinition = {
  id: VisualThemeId
  label: string
  /** Short line shown on the theme card. */
  blurb: string
  tiles: Record<number, string>
  roles: ThemeRoles
  light: ThemeSurfaces
  dark: ThemeSurfaces
}

const CANDY: ThemeDefinition = {
  id: 'candy',
  label: 'Candy',
  blurb: 'Sweet chips on deep indigo',
  tiles: {
    1: '#D4537E',
    2: '#7F77DD',
    3: '#378ADD',
    4: '#E0A32E',
    5: '#5DCAA5',
    6: '#B45BD1',
    7: '#1D9E75',
    8: '#D85A30',
    9: '#C23B52',
  },
  roles: {
    primary: { bg: '#639922', ink: '#EAF3DE' },
    secondary: { bg: '#378ADD', ink: '#E6F1FB' },
    accent: { bg: '#FAC775', ink: '#412402' },
    accentAlt: { bg: '#ED93B1', ink: '#4B1528' },
    support: { bg: '#5DCAA5', ink: '#04342C' },
    warm: { bg: '#F0997B', ink: '#4A1B0C' },
  },
  dark: {
    background: '#1B1050',
    surface: '#241663',
    surfaceElevated: '#2E1D7A',
    statBg: '#241663',
    border: '#3A2790',
    text: '#EEEDFE',
    muted: '#CECBF6',
    tile: '#2E1D7A',
    tileSelected: '#FFFFFF',
    tileHint: '#FAC775',
    path: '#FAC775',
  },
  light: {
    background: '#F6F2FF',
    surface: '#FFFFFF',
    surfaceElevated: '#F0EBFF',
    statBg: '#F3EFFE',
    border: '#E2D9F7',
    text: '#241350',
    muted: '#6B5B9E',
    tile: '#FFFFFF',
    tileSelected: '#241350',
    tileHint: '#D8892B',
    path: '#D4537E',
  },
}

const CLASSIC: ThemeDefinition = {
  id: 'classic',
  label: 'Classic',
  blurb: 'The original violet board',
  tiles: {
    1: '#8B5CF6',
    2: '#22C55E',
    3: '#3B82F6',
    4: '#F97316',
    5: '#EC4899',
    6: '#14B8A6',
    7: '#FBBF24',
    8: '#6366F1',
    9: '#EF4444',
  },
  roles: {
    primary: { bg: '#22C55E', ink: '#052E14' },
    secondary: { bg: '#7C3AED', ink: '#F2EAFE' },
    accent: { bg: '#F59E0B', ink: '#3A2200' },
    accentAlt: { bg: '#EC4899', ink: '#4A0B26' },
    support: { bg: '#14B8A6', ink: '#022F2A' },
    warm: { bg: '#F97316', ink: '#431203' },
  },
  dark: {
    background: '#14102A',
    surface: '#1E1638',
    surfaceElevated: '#2A2050',
    statBg: '#251D45',
    border: '#3D3266',
    text: '#FFFFFF',
    muted: '#A89CC8',
    tile: '#2A2050',
    tileSelected: '#FFFFFF',
    tileHint: '#F59E0B',
    path: '#FDE047',
  },
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#F1F5F9',
    statBg: '#EEF2FF',
    border: '#E2E8F0',
    text: '#0F172A',
    muted: '#64748B',
    tile: '#FFFFFF',
    tileSelected: '#0F172A',
    tileHint: '#D97706',
    path: '#7C3AED',
  },
}

const OCEAN: ThemeDefinition = {
  id: 'ocean',
  label: 'Ocean',
  blurb: 'Deep water blues and teals',
  tiles: {
    1: '#0EA5E9',
    2: '#14B8A6',
    3: '#3B82F6',
    4: '#F59E0B',
    5: '#06B6D4',
    6: '#6366F1',
    7: '#2DD4BF',
    8: '#1D4ED8',
    9: '#F472B6',
  },
  roles: {
    primary: { bg: '#0EA5E9', ink: '#04283A' },
    secondary: { bg: '#0891B2', ink: '#E0F7FE' },
    accent: { bg: '#38BDF8', ink: '#04283A' },
    accentAlt: { bg: '#F472B6', ink: '#4A0B26' },
    support: { bg: '#2DD4BF', ink: '#02332E' },
    warm: { bg: '#F59E0B', ink: '#3A2200' },
  },
  dark: {
    background: '#071A2B',
    surface: '#0E2739',
    surfaceElevated: '#143449',
    statBg: '#102E42',
    border: '#1E4A63',
    text: '#F0F9FF',
    muted: '#8FB6CE',
    tile: '#143449',
    tileSelected: '#FFFFFF',
    tileHint: '#38BDF8',
    path: '#7DD3FC',
  },
  light: {
    background: '#F2F9FD',
    surface: '#FFFFFF',
    surfaceElevated: '#E6F3FA',
    statBg: '#E0F2FE',
    border: '#CFE4F0',
    text: '#0C2A3E',
    muted: '#52788F',
    tile: '#FFFFFF',
    tileSelected: '#0C2A3E',
    tileHint: '#0369A1',
    path: '#0284C7',
  },
}

const FOREST: ThemeDefinition = {
  id: 'forest',
  label: 'Forest',
  blurb: 'Mossy greens and warm bark',
  tiles: {
    1: '#16A34A',
    2: '#84CC16',
    3: '#0D9488',
    4: '#CA8A04',
    5: '#4D7C0F',
    6: '#34D399',
    7: '#A16207',
    8: '#059669',
    9: '#DC2626',
  },
  roles: {
    primary: { bg: '#22C55E', ink: '#052E14' },
    secondary: { bg: '#4D7C0F', ink: '#F0F7E2' },
    accent: { bg: '#FACC15', ink: '#3A2E00' },
    accentAlt: { bg: '#A16207', ink: '#FBF3E2' },
    support: { bg: '#34D399', ink: '#023323' },
    warm: { bg: '#EA580C', ink: '#3D1103' },
  },
  dark: {
    background: '#0C1A10',
    surface: '#142718',
    surfaceElevated: '#1C3522',
    statBg: '#172E1C',
    border: '#2A4A31',
    text: '#F0FDF4',
    muted: '#9DBFA5',
    tile: '#1C3522',
    tileSelected: '#FFFFFF',
    tileHint: '#FACC15',
    path: '#BEF264',
  },
  light: {
    background: '#F4FAF5',
    surface: '#FFFFFF',
    surfaceElevated: '#E8F5EA',
    statBg: '#DCFCE7',
    border: '#D2E7D6',
    text: '#14311C',
    muted: '#5A7A61',
    tile: '#FFFFFF',
    tileSelected: '#14311C',
    tileHint: '#A16207',
    path: '#15803D',
  },
}

const MINIMAL: ThemeDefinition = {
  id: 'minimal',
  label: 'Minimal',
  blurb: 'Quiet, desaturated, focused',
  tiles: {
    1: '#7C8AA5',
    2: '#6B9080',
    3: '#8B8FA8',
    4: '#B08968',
    5: '#A67B8A',
    6: '#6E9BA8',
    7: '#A8956B',
    8: '#8A7CA8',
    9: '#B07A7A',
  },
  roles: {
    primary: { bg: '#52525B', ink: '#FAFAFA' },
    secondary: { bg: '#3F3F46', ink: '#FAFAFA' },
    accent: { bg: '#D4D4D8', ink: '#18181B' },
    accentAlt: { bg: '#A1A1AA', ink: '#18181B' },
    support: { bg: '#71717A', ink: '#FAFAFA' },
    warm: { bg: '#B0A8A0', ink: '#1C1917' },
  },
  dark: {
    background: '#0B0B0C',
    surface: '#161618',
    surfaceElevated: '#202024',
    statBg: '#1A1A1D',
    border: '#303036',
    text: '#FAFAFA',
    muted: '#9A9AA3',
    tile: '#202024',
    tileSelected: '#FFFFFF',
    tileHint: '#D4D4D8',
    path: '#E4E4E7',
  },
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceElevated: '#F4F4F5',
    statBg: '#F4F4F5',
    border: '#E4E4E7',
    text: '#18181B',
    muted: '#71717A',
    tile: '#FFFFFF',
    tileSelected: '#18181B',
    tileHint: '#3F3F46',
    path: '#27272A',
  },
}

export const THEME_DEFINITIONS: Record<VisualThemeId, ThemeDefinition> = {
  candy: CANDY,
  classic: CLASSIC,
  ocean: OCEAN,
  forest: FOREST,
  minimal: MINIMAL,
}

export const THEME_LABELS: Record<VisualThemeId, string> = VISUAL_THEMES.reduce(
  (labels, id) => {
    labels[id] = THEME_DEFINITIONS[id].label
    return labels
  },
  {} as Record<VisualThemeId, string>,
)

const TILE_INK_CACHE = new Map<VisualThemeId, Record<number, string>>()

function getTileInk(definition: ThemeDefinition): Record<number, string> {
  const cached = TILE_INK_CACHE.get(definition.id)
  if (cached) {
    return cached
  }

  const ink: Record<number, string> = {}
  for (const [value, color] of Object.entries(definition.tiles)) {
    ink[Number(value)] = softInk(color)
  }
  TILE_INK_CACHE.set(definition.id, ink)
  return ink
}

/**
 * Resolves the active theme from the two independent axes: which visual theme
 * the player picked, and whether the app is in dark mode.
 */
export function resolveAppTheme(
  visualThemeId: VisualThemeId,
  isDark: boolean,
): AppTheme {
  const definition = THEME_DEFINITIONS[visualThemeId] ?? CANDY
  const surfaces = isDark ? definition.dark : definition.light

  return {
    ...surfaces,
    ...definition.roles,
    id: definition.id,
    isDark,
    danger: DANGER_ROLE,
    success: PALETTE.success,
    tiles: definition.tiles,
    tileInk: getTileInk(definition),
  }
}

/** Preview swatches for a theme card, in the mode currently on screen. */
export function getThemePreview(id: VisualThemeId, isDark: boolean) {
  const definition = THEME_DEFINITIONS[id] ?? CANDY
  const surfaces = isDark ? definition.dark : definition.light

  return {
    label: definition.label,
    blurb: definition.blurb,
    background: surfaces.background,
    border: surfaces.border,
    tiles: definition.tiles,
    tileInk: getTileInk(definition),
  }
}

/** Default themes, used before the visual theme store hydrates. */
export const darkTheme = resolveAppTheme('candy', true)
export const lightTheme = resolveAppTheme('candy', false)
