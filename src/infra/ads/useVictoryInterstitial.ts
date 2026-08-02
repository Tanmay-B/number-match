import { useCallback, useEffect } from 'react'
import { useInterstitialAd } from 'react-native-google-mobile-ads'
import { AD_UNITS } from '@infra/ads/adUnits'
import { useAdsReady } from '@infra/ads/useAdsReady'

export function useVictoryInterstitial() {
  const adsReady = useAdsReady()
  const { isLoaded, isShowing, load, show } = useInterstitialAd(
    adsReady ? AD_UNITS.interstitial : null,
  )

  useEffect(() => {
    if (adsReady) {
      load()
    }
  }, [adsReady, load])

  const showAfterVictory = useCallback(() => {
    if (!isLoaded || isShowing) {
      load()
      return false
    }

    show()
    return true
  }, [isLoaded, isShowing, load, show])

  useEffect(() => {
    if (!isShowing && adsReady) {
      load()
    }
  }, [adsReady, isShowing, load])

  return { showAfterVictory, isLoaded }
}
