import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
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

export type RewardedCoinAd = {
  canWatch: boolean
  remainingToday: number
  dailyCap: number
  rewardAmount: number
  isLoaded: boolean
  isShowing: boolean
  isLoading: boolean
  error: unknown
  /** Short reason for the last failure, for display. */
  errorMessage?: string
  watchAd: (options?: WatchAdOptions) => boolean
}

const RewardedAdContext = createContext<RewardedCoinAd | null>(null)

/**
 * Owns the single rewarded ad for the whole app.
 *
 * This used to be a plain hook, so every screen that wanted the ad built its
 * own `RewardedAd` for the same unit. A native stack keeps pushed screens
 * mounted, so Home and Gameplay would both hold one and both call `load()`.
 * Overlapping loads against one ad unit made the SDK answer
 * `googleMobileAds/internal-error`, and the rewarded ad never became
 * available. One instance, one load at a time.
 */
export function RewardedAdProvider({ children }: { children: ReactNode }) {
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
  // The SDK rejects a load issued while one is already in flight, so only ever
  // ask for the next ad once the previous request has settled.
  const loadInFlightRef = useRef(false)

  const requestLoad = useCallback(
    (force = false) => {
      // `force` is for the retry path. Without it a request that never
      // resolves — no load, no error — would leave the guard set and block
      // every subsequent attempt for the rest of the session.
      if (loadInFlightRef.current && !force) {
        return
      }

      loadInFlightRef.current = true
      load()
    },
    [load],
  )

  const forceLoad = useCallback(() => requestLoad(true), [requestLoad])

  useEffect(() => {
    if (isLoaded || error) {
      loadInFlightRef.current = false
    }
  }, [error, isLoaded])

  useEffect(() => {
    if (adsReady && canWatchToday() && !isLoaded) {
      requestLoad()
    }
    // `watchesToday` re-arms the load once the daily counter moves.
  }, [adsReady, canWatchToday, isLoaded, requestLoad, watchesToday])

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
    loadInFlightRef.current = false

    if (canWatchToday()) {
      requestLoad()
    }
  }, [canWatchToday, isClosed, requestLoad])

  useAdLoadRetry({
    enabled: adsReady && canWatchToday(),
    error,
    isLoaded,
    label: 'rewarded',
    load: forceLoad,
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
        forceLoad()
        return false
      }

      rewardOptionsRef.current = {
        grantCoins: options?.grantCoins ?? true,
        onReward: options?.onReward,
      }
      logAdEvent('rewarded: showing')
      show()
      return true
    },
    [canWatchToday, forceLoad, isLoaded, isShowing, show],
  )

  const value = useMemo<RewardedCoinAd>(
    () => ({
      canWatch: canWatchToday() && adsReady,
      remainingToday: remainingToday(),
      dailyCap: AD_REWARDS.dailyCap,
      rewardAmount: AD_REWARDS.rewardedCoins,
      isLoaded: isLoaded && canWatchToday(),
      isShowing,
      isLoading: adsReady && canWatchToday() && !isLoaded && !error,
      error,
      errorMessage: error ? describeAdError(error) : undefined,
      watchAd,
    }),
    [
      adsReady,
      canWatchToday,
      error,
      isLoaded,
      isShowing,
      remainingToday,
      watchAd,
      // `watchesToday` is not read directly here, but both counters above are
      // store getters whose results change with it.
      watchesToday,
    ],
  )

  return (
    <RewardedAdContext.Provider value={value}>
      {children}
    </RewardedAdContext.Provider>
  )
}

export function useRewardedCoinAd(): RewardedCoinAd {
  const value = useContext(RewardedAdContext)

  if (!value) {
    throw new Error('useRewardedCoinAd must be used inside a RewardedAdProvider')
  }

  return value
}
