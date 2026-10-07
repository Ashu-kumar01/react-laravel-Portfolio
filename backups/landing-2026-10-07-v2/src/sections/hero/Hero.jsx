import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import { EASE_OUT } from '../../animations/variants'
import { ApiStatus } from '../../components/common/ApiStatus'
import { ResumeButton, SocialLinks } from '../../components/common/ProfileLinks'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { useCountUp } from '../../hooks/useCountUp'
import { useProfile } from '../../hooks/usePortfolio'
import { HeroVisual } from './HeroVisual'

function Counter({ value, suffix = '', label, start }) {
  const decimals = Number.isInteger(value ?? 0) ? 0 : 1
  const current = useCountUp(value ?? 0, { start: start && value != null, decimals })
  return (
    <div className="flex flex-col-reverse gap-1">
      <dt className="text-[13px] text-subtle">{label}</dt>
      <dd className="font-mono text-2xl font-medium tabular-nums text-fg sm:text-3xl">
        {value == null ? <Skeleton className="h-8 w-12" /> : `${current.toFixed(decimals)}${suffix}`}
      </dd>
    </div>
  )
}

const intro = (i, reduce) =>
  reduce ? {} : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: 0.1 + i * 0.09, ease: EASE_OUT } }

/** Name line whose letters rise in one by one out of a clipped baseline. */
function LetterReveal({ text, className, delay = 0, reduce }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]" aria-hidden="true">
      {[...text].map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className={`inline-block ${className ?? ''}`}
          style={{ '--i': i }}
          initial={reduce ? false : { y: '105%', rotateX: -70, opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: '0%', rotateX: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: delay + i * 0.045, ease: EASE_OUT }}
        >
          {char === ' ' ? ' ' : char}
        </motion.span>
      ))}
    </span>
  )
}

/** Highlights each stack item in turn so the line never sits still. */
function useCycle(length, ms, enabled) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    if (!enabled || length < 2) return undefined
    const id = setInterval(() => setActive((i) => (i + 1) % length), ms)
    return () => clearInterval(id)
  }, [length, ms, enabled])
  return active
}

export function Hero() {
  const { data, isLoading } = useProfile()
  const reduce = useReducedMotion()
  const statsRef = useRef(null)
  const sectionRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-40px' })

  const profile = data?.data?.profile ?? {}
  const stats = data?.data?.stats
  const name = profile.display_name ?? 'Ashwani Kushwaha'
  const [first, ...rest] = name.split(' ')
  const tagline = (profile.tagline ?? 'PHP • Laravel • React • REST APIs • MySQL').split('•').map((s) => s.trim())
  const activeTag = useCycle(tagline.length, 1600, !reduce)

  // Cursor spotlight: CSS variables updated per animation frame, no React re-renders.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || reduce) return undefined
    let frame = 0
    const onMove = (e) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
        el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
        el.style.setProperty('--spot-o', '1')
      })
    }
    const onLeave = () => el.style.setProperty('--spot-o', '0')
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce])

  return (
    <section ref={sectionRef} className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28 sm:pt-32" aria-labelledby="hero-title">
      <HeroVisual />
      <div className="hero-spotlight pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="container-page relative">
        <div className="max-w-2xl">
          <motion.div {...intro(0, reduce)} className="mb-7 flex flex-wrap items-center gap-3">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-mint-400 animate-pulse-dot" aria-hidden="true" />
              {profile.availability ?? 'Open to new opportunities'}
            </span>
            {profile.location && (
              <span className="inline-flex items-center gap-1.5 text-[12.5px] text-subtle">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {profile.location}
              </span>
            )}
          </motion.div>

          <h1 id="hero-title" aria-label={name} className="font-semibold uppercase leading-[0.88] tracking-[-0.045em] text-fg [perspective:600px]" style={{ fontSize: 'clamp(3rem, 9.5vw, 7.25rem)' }}>
            <LetterReveal text={first} delay={0.15} reduce={reduce} />
            <LetterReveal text={rest.join(' ')} className="hero-name-sheen" delay={0.15 + first.length * 0.045} reduce={reduce} />
          </h1>

          <motion.p {...intro(2, reduce)} className="mt-6 flex items-center gap-3 text-lg font-medium text-fg sm:text-xl">
            <span className="h-px w-8 bg-ember-500" aria-hidden="true" />
            {profile.title ?? 'Full-Stack Developer'}
          </motion.p>

          <motion.ul {...intro(3, reduce)} className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[13px] text-muted" aria-label="Core stack">
            {tagline.map((item, i) => (
              <li key={item} className="flex items-center gap-3">
                {i > 0 && <span className="text-ember-500/70" aria-hidden="true">•</span>}
                <span className={`transition-colors duration-500 ${i === activeTag ? 'text-ember-300 [text-shadow:0_0_14px_rgb(255_106_69/0.55)]' : ''}`}>{item}</span>
              </li>
            ))}
          </motion.ul>

          {isLoading ? (
            <Skeleton className="mt-7 h-12 w-full max-w-xl" />
          ) : (
            <motion.p {...intro(4, reduce)} className="mt-7 max-w-xl text-[17px] leading-relaxed text-muted sm:text-lg">
              {profile.headline}
            </motion.p>
          )}

          <motion.div {...intro(5, reduce)} className="mt-9 flex flex-wrap items-center gap-3">
            <Button to="/projects" size="lg">
              View My Work <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button to="/contact" variant="secondary" size="lg">
              Let&apos;s Talk
            </Button>
            <ResumeButton variant="ghost" />
            <SocialLinks className="ml-1" />
          </motion.div>
        </div>

        <motion.div {...intro(6, reduce)} ref={statsRef} className="mt-16 max-w-3xl border-t border-[var(--line)] pt-7">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Counter value={stats?.years_experience} suffix="+" label="Years of experience" start={statsInView} />
            {stats?.websites > 0 ? (
              <Counter value={stats.websites} suffix="+" label="Websites & projects" start={statsInView} />
            ) : (
              <Counter value={stats?.projects} label="Projects" start={statsInView} />
            )}
            <Counter value={stats?.technologies} label="Technologies & tools" start={statsInView} />
            <div className="flex flex-col-reverse gap-2">
              <dt className="text-[13px] text-subtle">Live Laravel API</dt>
              <dd className="flex h-8 items-center sm:h-9"><ApiStatus /></dd>
            </div>
          </dl>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#about"
        {...intro(8, reduce)}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-subtle transition-colors hover:text-fg md:[@media(min-height:960px)]:flex"
      >
        Scroll
        <span className="relative h-9 w-[1px] overflow-hidden bg-white/10" aria-hidden="true">
          <span className="hero-scroll-dot absolute left-0 top-0 h-3 w-full bg-ember-400" />
        </span>
      </motion.a>
    </section>
  )
}
