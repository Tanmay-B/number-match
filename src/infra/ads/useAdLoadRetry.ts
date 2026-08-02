import { useEffect, useRef } from 'react'
import { logAdError, logAdEvent } from '@infra/ads/adLog'

/** Backoff between retries. Length also caps the number of attempts. */
const RETRY_DELAYS_MS = [2000, 6000, 15000]

type AdLoadRetryOptions = {
  /** Name used in logs, e.g. 'rewarded'. */
  label: string
  /** The SDK's last load error, or undefined once a load succeeds. */
  error: unknown
  isLoaded: boolean
  /** False while ads are not initialised or the ad is not wanted. */
  enabled: boolean
  load: () => void
}

/**
 * Retries a failed ad load with backoff.
 *
 * The SDK reports a load failure once and never tries again on its own. The
 * only other reload triggers are closing an ad and the daily counter changing,
 * so a single transient failure — a slow network on launch, a momentary
 * no-fill — left the ad unavailable for the rest of the session.
 */
export function useAdLoadRetry({
  label,
  error,
  isLoaded,
  enabled,
  load,
}: AdLoadRetryOptions): void {
  const attemptRef = useRef(0)

  useEffect(() => {
    if (isLoaded) {
      attemptRef.current = 0
      return
    }

    if (!enabled || !error) {
      return
    }

    const attempt = attemptRef.current
    const delay = RETRY_DELAYS_MS[attempt]

    if (delay === undefined) {
      logAdError(
        `${label}: load failed and retries are exhausted after ${attempt} attempts`,
        error,
      )
      return
    }

    attemptRef.current = attempt + 1
    logAdError(
      `${label}: load failed, retry ${attempt + 1}/${RETRY_DELAYS_MS.length} in ${delay}ms`,
      error,
    )

    const timer = setTimeout(() => {
      logAdEvent(`${label}: retrying load`)
      load()
    }, delay)

    return () => clearTimeout(timer)
  }, [enabled, error, isLoaded, label, load])
}
