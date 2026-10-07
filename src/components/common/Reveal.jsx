import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, stagger } from '../../animations/variants'

/** Fades content up once when it scrolls into view. */
export function Reveal({ as = 'div', variants = fadeUp, delay = 0, className, children, ...props }) {
  const reduce = useReducedMotion()
  const Component = motion[as] ?? motion.div

  if (reduce) {
    const Static = as
    return <Static className={className} {...props}>{children}</Static>
  }

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={variants}
      transition={{ delay }}
      {...props}
    >
      {children}
    </Component>
  )
}

/** Parent that staggers child <Reveal variants={fadeUp}> items. */
export function RevealGroup({ as = 'div', className, children, gap = 0.07, ...props }) {
  const reduce = useReducedMotion()
  const Component = motion[as] ?? motion.div

  if (reduce) {
    const Static = as
    return <Static className={className} {...props}>{children}</Static>
  }

  return (
    <Component className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger(gap)} {...props}>
      {children}
    </Component>
  )
}

/** Child item for RevealGroup (inherits the parent's animation state). */
export function RevealItem({ as = 'div', className, children, ...props }) {
  const reduce = useReducedMotion()
  const Component = motion[as] ?? motion.div
  if (reduce) {
    const Static = as
    return <Static className={className} {...props}>{children}</Static>
  }
  return (
    <Component className={className} variants={fadeUp} {...props}>
      {children}
    </Component>
  )
}
