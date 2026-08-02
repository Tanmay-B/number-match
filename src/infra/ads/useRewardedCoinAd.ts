import { useCallback, useEffect, useRef } from 'react'
import { useRewardedAd } from 'react-native-google-mobile-ads'
import { AD_REWARDS } from '@modules/number-match/constants/storage'
import { describeAdError, logAdEvent } from '@infra/ads/adLog'
import { AD_UNITS } from '@infra/ads/adUnits'
import { useAdLoadRetry } from '@infra/ads/useAdLoadRetry'
import { useAdsReady } from '@infra/ads/useAdsReady'
import { useAdRewardStore } from '@store/adReward.store'
import { useGameStore } from '@store/game.store'
import { useStatsStore } from '@store/stats.store'

export type WatchAdOptions = {
  grantCoins?: boolean
  onReward?: () => void
}

export function useRewardedCoinAd() {
  const adsReady = useAdsReady()
  const addCoins = useGameStore(state => state.addCoins)
  const recordAdWatched = useStatsStore(state => state.recordAdWatched)
  const watchesToday = useAdRewardStore(state => state.watchesToday)
  const canWatchToday = useAdRewardStore(state => state.canWatchToday)
  const remainingToday = useAdRewardStore(state => state.remainingToday)
  const recordWatch = useAdRewardStore(state => state.recordWatch)

  const { isLoaded, isEarnedReward, isClosed, isShowing, error, load, show } =
    useRewardedAd(adsReady ? AD_UNITS.rewarded : null)

  const grantedRef = useRef(false)
  const rewardOptionsRef = useRef<WatchAdOptions>({ grantCoins: true })

  useEffect(() => {
    if (adsReady && canWatchToday()) {
      load()
    }
  }, [adsReady, canWatchToday, load, watchesToday])

  useEffect(() => {
    if (!isEarnedReward || grantedRef.current) {
      return
    }

    grantedRef.current = true
    const options = rewardOptionsRef.current

    if (options.grantCoins !== false) {
      addCoins(AD_REWARDS.rewardedCoins)
    }

    recordAdWatched()
    void recordWatch()
    options.onReward?.()
  }, [addCoins, isEarnedReward, recordAdWatched, recordWatch])

  useEffect(() => {
    if (!isClosed) {
      return
    }

    grantedRef.current = false
    rewardOptionsRef.current = { grantCoins: true }
    if (canWatchToday()) {
      load()
    }
  }, [canWatchToday, isClosed, load])

  useAdLoadRetry({
    enabled: adsReady && canWatchToday(),
    error,
    isLoaded,
    label: 'rewarded',
    load,
  })

  const watchAd = useCallback(
    (options?: WatchAdOptions) => {
      if (!canWatchToday() || isShowing) {
        return false
      }

      // Nothing ready yet: kick off a load so tapping again can work, rather
      // than having the button do nothing at all.
      if (!isLoaded) {
        logAdEvent('rewarded: tapped with no ad ready, loading')
        load()
        return false
      }

      rewardOptionsRef.current = {
        grantCoins: options?.grantCoins ?? true,
        onReward: options?.onReward,
      }
      show()
      return true
    },
    [canWatchToday, isLoaded, isShowing, load, show],
  )

  return {
    canWatch: canWatchToday() && adsReady,
    remainingToday: remainingToday(),
    dailyCap: AD_REWARDS.dailyCap,
    rewardAmount: AD_REWARDS.rewardedCoins,
    isLoaded: isLoaded && canWatchToday(),
    isShowing,
    isLoading: adsReady && canWatchToday() && !isLoaded && !error,
    error,
    /** Short reason for the last failure, for display. */
    errorMessage: error ? describeAdError(error) : undefined,
    watchAd,
  }
}
