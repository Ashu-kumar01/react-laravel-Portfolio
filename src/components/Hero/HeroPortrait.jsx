import { useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { SvgBrand } from '../common/BrandIcon'
import { BRANDS } from '../common/brands'
import { cn } from '../../utils/cn'
import './Hero.css'

const EASE = [0.16, 1, 0.3, 1]

// Fixed slots so any badge set (max 4 each) is laid out around the portrait without covering the face.
const BADGE_SLOTS = [
  { className: 'left-[-2%] top-[12%] sm:left-[-6%]', depth: 14, float: 6 },
  { className: 'right-[-2%] top-[60%] sm:right-[-6%] sm:top-[38%]', depth: 18, float: 7 },
  { className: 'bottom-[6%] left-[-2%] sm:bottom-[20%] sm:left-[-8%]', depth: 16, float: 6.5 },
  { className: 'bottom-[6%] right-[2%] hidden sm:block', depth: 10, float: 8 },
]
const BUBBLE_SLOTS = [
  { className: 'right-[10%] top-[6%]', depth: 22, float: 5 },
  { className: 'left-[14%] top-[-2%]', depth: 20, float: 5.5 },
  { className: 'right-[2%] top-[62%] hidden sm:block', depth: 24, float: 6 },
  { className: 'left-[4%] top-[44%] hidden sm:block', depth: 18, float: 5.2 },
]

/**
 * A badge floating around the portrait: pops in after `delay`, bobs gently every
 * `float` seconds, and drifts with the pointer by `depth` px (parallax).
 */
function FloatingBadge({ className, pointer, depth = 12, delay = 0, float = 6, reduce, children }) {
  const x = useTransform(pointer.x, (v) => v * depth)
  const y = useTransform(pointer.y, (v) => v * depth)
  return (
    <motion.div className={cn('absolute z-20', className)} style={reduce ? undefined : { x, y }}>
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay, ease: EASE }}
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={reduce ? undefined : { duration: float, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.7 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/** With a value it is a stat card ("3.8+ / Years of experience"); without, a pill with a status dot. */
function InfoBadge({ value, label, first }) {
  if (value) {
    return (
      <div className="portrait-badge portrait-badge--stat">
        <span className="font-mono text-xl font-semibold tabular-nums text-fg">{value}</span>
        <span className="text-[11.5px] leading-tight text-muted">{label}</span>
      </div>
    )
  }
  return (
    <div className="portrait-badge">
      <span className={cn('h-2 w-2 rounded-full', first ? 'animate-pulse-dot bg-mint-400' : 'bg-signal-400')} aria-hidden="true" />
      <span className="text-[12.5px] text-fg">{label}</span>
    </div>
  )
}

function TechBubble({ slug }) {
  const title = BRANDS[slug]?.title ?? slug
  return (
    <div className="portrait-bubble" title={title}>
      <SvgBrand slug={slug} colored className="h-5 w-5" title={title} />
    </div>
  )
}

const STILL = { x: 0, y: 0 }

/**
 * Hero visual: cut-out portrait on a glowing backdrop with floating glass badges.
 * Purely presentational — the hero (and the admin live preview) pass the content in.
 * `image` null renders the backdrop only (e.g. while the profile is loading).
 */
export function HeroPortrait({ image, alt, badges = [], bubbles = [], pointer, reduce }) {
  const stillX = useMotionValue(STILL.x)
  const stillY = useMotionValue(STILL.y)
  const p = pointer ?? { x: stillX, y: stillY }
  const imageX = useTransform(p.x, (v) => v * -6)
  const imageY = useTransform(p.y, (v) => v * -4)
  const [loadedSrc, setLoadedSrc] = useState(null)

  return (
    <div className="hero-portrait">
      <div className="hero-portrait__glow" aria-hidden="true" />
      <div className="hero-portrait__disc" aria-hidden="true">
        <div className="hero-portrait__ring" />
      </div>

      {image && (
        <motion.img
          key={image}
          src={image}
          alt={alt}
          fetchPriority="high"
          decoding="async"
          onLoad={() => setLoadedSrc(image)}
          className="hero-portrait__img"
          initial={{ opacity: 0 }}
          animate={{ opacity: loadedSrc === image ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={reduce ? undefined : { x: imageX, y: imageY }}
        />
      )}

      {badges.slice(0, BADGE_SLOTS.length).map((badge, i) => (
        <FloatingBadge key={`badge-${i}`} pointer={p} reduce={reduce} delay={0.6 + i * 0.15} {...BADGE_SLOTS[i]}>
          <InfoBadge value={badge.value} label={badge.label} first={i === 0} />
        </FloatingBadge>
      ))}

      {bubbles.filter((slug) => BRANDS[slug]).slice(0, BUBBLE_SLOTS.length).map((slug, i) => (
        <FloatingBadge key={`bubble-${slug}`} pointer={p} reduce={reduce} delay={0.7 + i * 0.15} {...BUBBLE_SLOTS[i]}>
          <TechBubble slug={slug} />
        </FloatingBadge>
      ))}
    </div>
  )
}
