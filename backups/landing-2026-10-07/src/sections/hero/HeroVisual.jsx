import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { useSceneQuality } from '../../hooks/useSceneQuality'
import { fontsReady } from '../../three/fonts'
import { HeroFallback } from './HeroFallback'

// three.js + R3F live in their own chunk and are only fetched on capable devices.
const HeroScene = lazy(() => import('../../three/HeroScene'))

class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    if (import.meta.env.DEV) console.warn('3D scene disabled:', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** Starts work after the browser is idle so the 3D chunk never competes with first paint. */
function useIdleReady(enabled) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 250))
    const cancel = window.cancelIdleCallback ?? clearTimeout
    const id = idle(() => fontsReady().then(() => !cancelled && setReady(true)), { timeout: 1500 })
    return () => {
      cancelled = true
      cancel(id)
    }
  }, [enabled])
  return ready
}

export function HeroVisual() {
  const quality = useSceneQuality()
  const reducedMotion = usePrefersReducedMotion()
  const containerRef = useRef(null)
  const [inView, setInView] = useState(true)
  const [pageVisible, setPageVisible] = useState(true)
  const [failed, setFailed] = useState(false)
  const use3d = quality !== 'static' && !failed
  const ready = useIdleReady(use3d)

  // Pause the render loop when the hero is off-screen or the tab is hidden.
  useEffect(() => {
    const el = containerRef.current
    if (!el || !use3d) return undefined
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 })
    observer.observe(el)
    const onVisibility = () => setPageVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [use3d])

  const fallback = <HeroFallback animate={!reducedMotion} />

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0" data-scene-quality={use3d ? quality : 'static'}>
      {/* Soft glows sit behind the canvas in every mode */}
      <div className="absolute right-[-8%] top-[8%] h-[560px] w-[560px] rounded-full bg-ember-500/[0.07] blur-[120px]" aria-hidden="true" />
      <div className="absolute right-[30%] top-[50%] h-[420px] w-[420px] rounded-full bg-signal-400/[0.06] blur-[120px]" aria-hidden="true" />

      {!use3d || !ready ? (
        fallback
      ) : (
        <SceneBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
              <HeroScene quality={quality} active={inView && pageVisible} onFailure={() => setFailed(true)} />
            </motion.div>
          </Suspense>
        </SceneBoundary>
      )}

      {/* Left-to-right veil keeps the hero copy readable over the scene */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/75 to-transparent md:via-ink-950/40" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" aria-hidden="true" />
    </div>
  )
}
