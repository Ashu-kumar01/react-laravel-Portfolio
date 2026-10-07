import { useMemo } from 'react'
import { useMediaQuery, usePrefersReducedMotion } from './useMediaQuery'

let webglSupport
function hasWebGL() {
  if (webglSupport !== undefined) return webglSupport
  try {
    const canvas = document.createElement('canvas')
    webglSupport = Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    webglSupport = false
  }
  return webglSupport
}

/**
 * Decides how much 3D the device should render:
 *  - "static": no WebGL — reduced motion, no WebGL support, phones or data-saver
 *  - "lite":   fewer particles/objects, capped DPR — tablets and low-end machines
 *  - "full":   desktop with a capable GPU/CPU
 * A `?3d=off|lite|full` query param overrides detection (useful for QA).
 */
export function useSceneQuality() {
  const reducedMotion = usePrefersReducedMotion()
  const isPhone = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(max-width: 1100px)')

  return useMemo(() => {
    const override = new URLSearchParams(window.location.search).get('3d')
    if (override === 'off') return 'static'
    if (override === 'lite' || override === 'full') return hasWebGL() ? override : 'static'

    const saveData = navigator.connection?.saveData === true
    if (reducedMotion || isPhone || saveData || !hasWebGL()) return 'static'

    const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 4 || (navigator.deviceMemory ?? 8) <= 4
    if (isTablet || lowEnd) return 'lite'
    return 'full'
  }, [reducedMotion, isPhone, isTablet])
}
