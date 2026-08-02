import { useCallback, useEffect } from 'react'
import { useInterstitialAd } from 'react-native-google-mobile-ads'
import { logAdEvent } from '@infra/ads/adLog'
import { AD_UNITS } from '@infra/ads/adUnits'
import { useAdLoadRetry } from '@infra/ads/useAdLoadRetry'
import { useAdsReady } from '@infra/ads/useAdsReady'

export function useVictoryInterstitial() {
  const adsReady = useAdsReady()
  const { isLoaded, isShowing, error, load, show } = useInterstitialAd(
    adsReady ? AD_UNITS.interstitial : null,
  )

  useAdLoadRetry({
    enabled: adsReady,
    error,
    isLoaded,
    label: 'interstitial',
    load,
  })

  const showAfterVictory = useCallback(() => {
    if (!isLoaded || isShowing) {
      load()
      return false
    }

    logAdEvent('interstitial: showing after victory')
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
