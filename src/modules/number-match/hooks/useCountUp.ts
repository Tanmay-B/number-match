import { useEffect, useRef, useState } from 'react'

/**
 * Tweens a displayed integer toward `value` so counters roll rather than jump.
 * Returns the current displayed value and the direction of the last change.
 */
export function useCountUp(value: number, durationMs = 420) {
  const [displayed, setDisplayed] = useState(value)
  const [direction, setDirection] = useState<'up' | 'down' | 'none'>('none')
  const fromRef = useRef(value)
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const from = fromRef.current

    if (from === value) {
      return
    }

    setDirection(value > from ? 'up' : 'down')

    const startedAt = Date.now()
    const step = () => {
      const progress = Math.min(1, (Date.now() - startedAt) / durationMs)
      // Ease-out so the roll decelerates into the final number.
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = Math.round(from + (value - from) * eased)
      setDisplayed(next)

      if (progress >= 1) {
        fromRef.current = value
        // Drop back to neutral so callers stop tinting the value.
        setDirection('none')
        if (frameRef.current) {
          clearInterval(frameRef.current)
          frameRef.current = null
        }
      }
    }

    if (frameRef.current) {
      clearInterval(frameRef.current)
    }
    frameRef.current = setInterval(step, 16)

    return () => {
      if (frameRef.current) {
        clearInterval(frameRef.current)
        frameRef.current = null
      }
      fromRef.current = value
      setDisplayed(value)
    }
  }, [durationMs, value])

  return { displayed, direction }
}
