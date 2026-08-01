import { NavigationContainer } from '@react-navigation/native'
import { AppNavigator } from '@router/navigators/AppNavigator'

export const Router = () => {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  )
}
