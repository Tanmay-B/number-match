import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { GameplayScreen } from '@modules/number-match/screens/GameplayScreen'
import { HomeScreen } from '@modules/number-match/screens/HomeScreen'
import { SettingsScreen } from '@modules/number-match/screens/SettingsScreen'
import { SplashScreen } from '@modules/number-match/screens/SplashScreen'
import { StatisticsScreen } from '@modules/number-match/screens/StatisticsScreen'
import { ThemesScreen } from '@modules/number-match/screens/ThemesScreen'
import { AppRoutes, AppStackParams } from '@router/routes'

const AppStack = createNativeStackNavigator<AppStackParams>()

export const AppNavigator = () => {
  return (
    <AppStack.Navigator
      initialRouteName={AppRoutes.SPLASH}
      screenOptions={{ headerShown: false, animation: 'fade' }}>
      <AppStack.Screen name={AppRoutes.SPLASH} component={SplashScreen} />
      <AppStack.Screen name={AppRoutes.HOME} component={HomeScreen} />
      <AppStack.Screen name={AppRoutes.GAMEPLAY} component={GameplayScreen} />
      <AppStack.Screen
        name={AppRoutes.STATISTICS}
        component={StatisticsScreen}
      />
      <AppStack.Screen name={AppRoutes.THEMES} component={ThemesScreen} />
      <AppStack.Screen name={AppRoutes.SETTINGS} component={SettingsScreen} />
    </AppStack.Navigator>
  )
}
