import { useEffect, useState } from 'react'
import { initializeAds } from '@infra/ads/initializeAds'

export function useAdsReady(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    initializeAds()
      .then(() => {
        if (!cancelled) {
          setReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReady(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return ready
}
