import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { initializeAds } from '@infra/ads/initializeAds'
import { Router } from '@router/index'

function App() {
  useEffect(() => {
    initializeAds().catch(() => {
      // Ads are optional; the game still works if initialization fails.
    })
  }, [])

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <Router />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default App
