import { useEffect, useState } from 'react'
import { logAdError, logAdEvent } from '@infra/ads/adLog'
import { initializeAds } from '@infra/ads/initializeAds'

export function useAdsReady(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    initializeAds()
      .then(() => {
        if (!cancelled) {
          logAdEvent('SDK initialised')
          setReady(true)
        }
      })
      .catch(error => {
        if (!cancelled) {
          // Previously swallowed. When initialisation fails every ad unit id
          // stays null, so nothing ever loads and nothing says why.
          logAdError('SDK initialisation failed — no ads will load', error)
          setReady(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return ready
}
