import { useMemo } from 'react'
import { useMediaQuery } from './useMediaQuery'

let webglSupport
export function hasWebGL() {
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
 * Decides how much 3D the device should render (see QUALITY in three/scene.js):
 *  - "static": no WebGL or data-saver → static avatar image
 *  - "mobile": phones — reduced DPR, particles, shadows and lighting
 *  - "lite":   tablets and low-end machines
 *  - "full":   desktop with a capable GPU/CPU
 * Reduced motion is handled separately (the scene renders, but holds still).
 * A `?3d=off|mobile|lite|full` query param overrides detection (useful for QA).
 */
export function useSceneQuality() {
  const isPhone = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(max-width: 1100px)')

  return useMemo(() => {
    const override = new URLSearchParams(window.location.search).get('3d')
    if (override === 'off') return 'static'
    if (['mobile', 'lite', 'full'].includes(override)) return hasWebGL() ? override : 'static'

    const saveData = navigator.connection?.saveData === true
    if (saveData || !hasWebGL()) return 'static'
    if (isPhone) return 'mobile'

    const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 4 || (navigator.deviceMemory ?? 8) <= 4
    if (isTablet || lowEnd) return 'lite'
    return 'full'
  }, [isPhone, isTablet])
}
