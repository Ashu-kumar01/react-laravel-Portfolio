import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './useMediaQuery'

/** Animates 0 → target once `start` is true. Respects reduced motion. */
export function useCountUp(target, { start = true, duration = 1400, decimals = 0 } = {}) {
  const reducedMotion = usePrefersReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start || !Number.isFinite(target)) return undefined
    if (reducedMotion || target === 0) {
      const id = requestAnimationFrame(() => setValue(target))
      return () => cancelAnimationFrame(id)
    }

    let frame
    const began = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - began) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      const factor = 10 ** decimals
      setValue(Math.round(target * eased * factor) / factor)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, start, duration, decimals, reducedMotion])

  return value
}
