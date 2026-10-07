import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { SvgBrand } from '../common/BrandIcon'
import { ResumeButton } from '../common/ProfileLinks'
import { Button } from '../ui/Button'
import { HERO } from '../../config/hero'
import { useHeroContent } from '../../hooks/useHeroContent'
import { HeroPortrait } from './HeroPortrait'
import './Hero.css'

const spring = { type: 'spring', stiffness: 70, damping: 18, mass: 0.9 }

// Text column enters from the left, one line after another.
const column = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }
const fromLeft = { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0, transition: spring } }
const badgeList = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const badgeItem = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: spring } }
const fadeOnly = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } }

/** Normalised pointer (-1…1) as springy MotionValues for background parallax — no re-renders. */
function usePointerParallax(enabled) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  useEffect(() => {
    if (!enabled) return undefined
    const onMove = (e) => {
      x.set((e.clientX / window.innerWidth) * 2 - 1)
      y.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [enabled, x, y])
  return { x: useSpring(x, { stiffness: 40, damping: 20 }), y: useSpring(y, { stiffness: 40, damping: 20 }) }
}

function HeroBackground({ pointer, scrollYProgress }) {
  const near = { x: useTransform(pointer.x, (v) => v * -26), y: useTransform(pointer.y, (v) => v * -18) }
  const far = { x: useTransform(pointer.x, (v) => v * -10), y: useTransform(pointer.y, (v) => v * -8) }
  const sink = useTransform(scrollYProgress, [0, 1], [0, 120])
  return (
    <div className="hero-bg" aria-hidden="true">
      <motion.div className="hero-bg__layer" style={{ x: far.x, y: far.y }}>
        <div className="hero-bg__grid" />
      </motion.div>
      <motion.div className="hero-bg__layer" style={{ y: sink }}>
        <motion.div className="hero-bg__layer" style={{ x: near.x, y: near.y }}>
          <div className="hero-bg__blob hero-bg__blob--blue" />
          <div className="hero-bg__blob hero-bg__blob--purple" />
          <div className="hero-bg__blob hero-bg__blob--navy" />
        </motion.div>
      </motion.div>
      <div className="hero-bg__fade" />
    </div>
  )
}

/** CTA wrapper: lifts, scales to 1.03 and glows on hover. */
function Lift({ children, reduce, tone = 'blue' }) {
  return (
    <motion.div
      className={`cta-lift cta-lift--${tone}`}
      whileHover={reduce ? undefined : { y: -2, scale: 1.03 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
    >
      {children}
    </motion.div>
  )
}

export function Hero() {
  const reduce = useReducedMotion()
  const sectionRef = useRef(null)
  const avatarRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  // Tracked on the portrait itself: 0 while it sits at/below mid-screen, 1 once it has scrolled out the top.
  // Works for both the desktop two-column layout and the stacked mobile layout (portrait below the copy).
  const { scrollYProgress: portraitProgress } = useScroll({ target: avatarRef, offset: ['center center', 'end start'] })
  const pointer = usePointerParallax(!reduce)
  const portraitOpacity = useTransform(portraitProgress, [0.25, 0.85], [1, 0])
  const portraitY = useTransform(portraitProgress, [0, 1], [0, reduce ? 0 : -60])
  const item = reduce ? fadeOnly : fromLeft
  const content = useHeroContent()

  return (
    <section ref={sectionRef} className="hero relative isolate overflow-hidden" aria-labelledby="hero-title">
      <HeroBackground pointer={pointer} scrollYProgress={scrollYProgress} />

      <div className="container-page relative grid min-h-[100svh] items-center gap-6 pb-14 pt-28 sm:pt-32 lg:grid-cols-[45fr_55fr] lg:gap-4 lg:pb-8 lg:pt-24">
        <motion.div variants={column} initial="hidden" animate="show" className="relative z-10 max-w-xl">
          <motion.p variants={item} className="hero-eyebrow">
            <span className="hero-eyebrow__line" aria-hidden="true" />
            {content.eyebrow}
          </motion.p>

          <motion.h1 variants={item} id="hero-title" className="hero-title">
            <span className="block">{content.name}</span>
            <span className="hero-title__role">{content.role}</span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-lg text-[17px] leading-relaxed text-muted sm:text-lg">
            {content.summary}
          </motion.p>

          <motion.ul variants={badgeList} className="mt-8 flex flex-wrap gap-2.5" aria-label="Core technologies">
            {content.badges.map((badge, i) => (
              <motion.li key={`${badge.label}-${i}`} variants={reduce ? fadeOnly : badgeItem} whileHover={reduce ? undefined : { y: -3 }} className="tech-badge">
                {badge.icon && <SvgBrand slug={badge.icon} colored decorative className="h-4 w-4" />}
                <span>{badge.label}</span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-3">
            <Lift reduce={reduce}>
              <Button to={HERO.primaryCta.to} size="lg">
                {HERO.primaryCta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Lift>
            <Lift reduce={reduce} tone="purple">
              <ResumeButton variant="secondary" size="lg" label={HERO.resumeLabel} showWhenMissing />
            </Lift>
          </motion.div>
        </motion.div>

        {/* Right column: portrait with floating badges; enters from the right, drifts up and fades on scroll. */}
        <motion.div ref={avatarRef} style={{ opacity: portraitOpacity, y: portraitY }} className="hero-avatar">
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 60, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            transition={reduce ? { duration: 0.5 } : { ...spring, delay: 0.3 }}
          >
            <HeroPortrait
              image={content.image}
              alt={content.imageAlt}
              badges={content.floatingBadges}
              bubbles={content.bubbles}
              pointer={pointer}
              reduce={reduce}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
