export enum AppRoutes {
  SPLASH = 'Splash',
  HOME = 'Home',
  GAMEPLAY = 'Gameplay',
  STATISTICS = 'Statistics',
  THEMES = 'Themes',
  SETTINGS = 'Settings',
}

export type AppStackParams = {
  [AppRoutes.SPLASH]: undefined
  [AppRoutes.HOME]: undefined
  [AppRoutes.GAMEPLAY]: { newGame?: boolean } | undefined
  [AppRoutes.STATISTICS]: undefined
  [AppRoutes.THEMES]: undefined
  [AppRoutes.SETTINGS]: undefined
}
