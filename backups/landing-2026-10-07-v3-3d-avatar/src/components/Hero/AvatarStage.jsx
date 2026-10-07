import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import fallbackPortrait from '../../assets/avatar-fallback.jpg'
import { HERO } from '../../config/hero'
import { useSceneQuality } from '../../hooks/useSceneQuality'
import { cn } from '../../utils/cn'

// three.js, R3F and drei live in their own chunk, fetched only when the 3D hero renders.
const AvatarScene = lazy(() => import('./AvatarScene'))

/** Keeps any 3D failure (chunk, GLB, WebGL) local to the hero. */
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    console.error('[Hero] 3D avatar failed to load; showing the static portrait instead.', error)
    this.props.onError?.(error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const RING_R = 22
const RING_C = 2 * Math.PI * RING_R

function AvatarLoader({ progress }) {
  const dashOffset = useTransform(progress, (v) => RING_C * (1 - v / 100))
  const percent = useTransform(progress, (v) => `${Math.round(v)}%`)
  return (
    <motion.div
      className="avatar-loader"
      role="status"
      aria-label="Loading 3D experience"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.45 } }}
    >
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id="avatar-loader-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7aa2ff" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <circle cx="28" cy="28" r={RING_R} fill="none" strokeWidth="2" className="stroke-white/10" />
          <motion.circle
            cx="28"
            cy="28"
            r={RING_R}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            stroke="url(#avatar-loader-gradient)"
            strokeDasharray={RING_C}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <motion.span className="absolute inset-0 grid place-items-center font-mono text-[12px] tabular-nums text-fg" aria-hidden="true">
          {percent}
        </motion.span>
      </div>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Loading 3D Experience…</span>
    </motion.div>
  )
}

function AvatarFallback() {
  return (
    <div className="avatar-fallback">
      <div className="avatar-fallback__frame">
        <img src={fallbackPortrait} alt={HERO.avatarAlt} width="200" height="200" decoding="async" />
      </div>
    </div>
  )
}

/** Renders only while the stage is on screen and the tab is visible. */
function useActive(ref, enabled) {
  const [inView, setInView] = useState(true)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return undefined
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 })
    observer.observe(el)
    const onVisibility = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [ref, enabled])
  return inView && visible
}

/**
 * The right-hand column of the hero: loader → 3D avatar (or static portrait).
 * Framer Motion owns the DOM (loader, fades) and produces the MotionValues
 * (entrance spring, scroll progress) that Three.js reads every frame.
 */
export function AvatarStage({ scrollProgress, motionEnabled, className }) {
  const quality = useSceneQuality()
  const containerRef = useRef(null)
  const [status, setStatus] = useState('loading') // loading | ready | failed
  const use3d = quality !== 'static' && status !== 'failed'
  const active = useActive(containerRef, use3d)

  const progress = useMotionValue(0)
  const entrance = useSpring(motionEnabled ? 0 : 1, { stiffness: 55, damping: 16, mass: 1 })

  // The JS chunk can't report bytes, so ease toward 70% while it downloads;
  // real GLB progress (when a model is configured) takes over as it arrives.
  useEffect(() => {
    if (!use3d || status !== 'loading') return undefined
    const controls = animate(progress, 70, { duration: 2.4, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [use3d, status, progress])

  const handleProgress = useCallback(
    (value) => {
      if (value > progress.get()) animate(progress, value, { duration: 0.3 })
    },
    [progress],
  )

  const handleReady = useCallback(() => {
    animate(progress, 100, {
      duration: 0.35,
      onComplete: () => {
        setStatus('ready')
        entrance.set(1)
      },
    })
  }, [progress, entrance])

  const handleFailure = useCallback((error) => {
    if (error) console.error('[Hero] 3D avatar disabled:', error)
    setStatus('failed')
  }, [])

  return (
    <div ref={containerRef} className={cn('avatar-stage', className)} data-scene-quality={use3d ? quality : 'static'}>
      <div className="avatar-stage__halo" aria-hidden="true" />

      {use3d ? (
        <SceneBoundary fallback={<AvatarFallback />} onError={handleFailure}>
          <Suspense fallback={null}>
            <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: status === 'ready' ? 1 : 0 }} transition={{ duration: 0.9, ease: 'easeOut' }}>
              <AvatarScene
                quality={quality}
                motionEnabled={motionEnabled}
                active={active}
                scrollProgress={scrollProgress}
                entrance={entrance}
                onProgress={handleProgress}
                onReady={handleReady}
                onFailure={handleFailure}
              />
            </motion.div>
          </Suspense>
        </SceneBoundary>
      ) : (
        <AvatarFallback />
      )}

      <AnimatePresence>{use3d && status === 'loading' && <AvatarLoader key="loader" progress={progress} />}</AnimatePresence>
    </div>
  )
}
