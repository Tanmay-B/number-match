import { useEffect, useRef, useState } from 'react'

/**
 * Tweens a displayed integer toward `value` so counters roll rather than jump.
 * Returns the current displayed value and the direction of the last change.
 *
 * Driven by requestAnimationFrame and de-duplicated: it only calls setState
 * when the rounded number actually changes. A timer-driven version re-rendered
 * on every tick, which stuttered the board animations running alongside it.
 */
export function useCountUp(value: number, durationMs = 420) {
  const [displayed, setDisplayed] = useState(value)
  const [direction, setDirection] = useState<'up' | 'down' | 'none'>('none')
  const fromRef = useRef(value)

  useEffect(() => {
    const from = fromRef.current

    if (from === value) {
      return
    }

    setDirection(value > from ? 'up' : 'down')

    const startedAt = Date.now()
    let frame = 0
    let lastShown = from

    const step = () => {
      const progress = Math.min(1, (Date.now() - startedAt) / durationMs)
      // Ease-out so the roll decelerates into the final number.
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = Math.round(from + (value - from) * eased)

      if (next !== lastShown) {
        lastShown = next
        setDisplayed(next)
      }

      if (progress < 1) {
        frame = requestAnimationFrame(step)
        return
      }

      fromRef.current = value
      // Back to neutral so callers stop tinting the value.
      setDirection('none')
    }

    frame = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frame)
      fromRef.current = value
      setDisplayed(value)
    }
  }, [durationMs, value])

  return { displayed, direction }
}
