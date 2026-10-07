import { useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { pageTransition } from '../animations/variants'
import { Footer } from '../components/layout/Footer'
import { Navbar } from '../components/layout/Navbar'

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })
  return <motion.div className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-gradient-to-r from-ember-600 via-ember-400 to-signal-400" style={{ scaleX }} aria-hidden="true" />
}

export default function PublicLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const reduce = useReducedMotion()

  // Scroll to top on route change (hash links scroll to their target instead).
  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.pathname, location.hash])

  return (
    <div className="relative flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-fg focus:px-4 focus:py-2 focus:text-ink-950">
        Skip to content
      </a>
      <ScrollProgress />
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main"
          key={location.pathname}
          className="flex-1"
          {...(reduce ? {} : pageTransition)}
        >
          {outlet}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
