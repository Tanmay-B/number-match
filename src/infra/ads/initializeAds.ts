import { MobileAds } from 'react-native-google-mobile-ads'

let initPromise: Promise<void> | null = null

export function initializeAds(): Promise<void> {
  if (!initPromise) {
    initPromise = MobileAds()
      .initialize()
      .then(() => undefined)
  }

  return initPromise
}

export function isAdsInitialized(): boolean {
  return initPromise !== null
}
