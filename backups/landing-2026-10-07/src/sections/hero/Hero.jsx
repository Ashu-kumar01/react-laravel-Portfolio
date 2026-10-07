import { useRef } from 'react'
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

export function Hero() {
  const { data, isLoading } = useProfile()
  const reduce = useReducedMotion()
  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-40px' })

  const profile = data?.data?.profile ?? {}
  const stats = data?.data?.stats
  const name = profile.display_name ?? 'Ashwani Kushwaha'
  const [first, ...rest] = name.split(' ')
  const tagline = (profile.tagline ?? 'PHP • Laravel • React • REST APIs • MySQL').split('•').map((s) => s.trim())

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28 sm:pt-32" aria-labelledby="hero-title">
      <HeroVisual />

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

          <motion.h1 {...intro(1, reduce)} id="hero-title" className="font-semibold uppercase leading-[0.88] tracking-[-0.045em] text-fg" style={{ fontSize: 'clamp(3rem, 9.5vw, 7.25rem)' }}>
            <span className="block">{first}</span>
            <span className="text-gradient block">{rest.join(' ')}</span>
          </motion.h1>

          <motion.p {...intro(2, reduce)} className="mt-6 flex items-center gap-3 text-lg font-medium text-fg sm:text-xl">
            <span className="h-px w-8 bg-ember-500" aria-hidden="true" />
            {profile.title ?? 'Full-Stack Developer'}
          </motion.p>

          <motion.ul {...intro(3, reduce)} className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[13px] text-muted" aria-label="Core stack">
            {tagline.map((item, i) => (
              <li key={item} className="flex items-center gap-3">
                {i > 0 && <span className="text-ember-500/70" aria-hidden="true">•</span>}
                {item}
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
    </section>
  )
}
