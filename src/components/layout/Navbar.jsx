import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS } from '../../config/navigation'
import { cn } from '../../utils/cn'
import { Logo } from '../common/Logo'
import { Button } from '../ui/Button'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const { pathname } = useLocation()

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 12))

  // Close the mobile menu on navigation.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <nav
        aria-label="Primary"
        className={cn(
          'mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl px-3 transition-all duration-300 sm:px-4',
          scrolled || open ? 'glass shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)]' : 'border border-transparent',
        )}
      >
        <Logo />

        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-lg px-3 py-2 text-[13.5px] transition-colors',
                    isActive ? 'text-fg' : 'text-muted hover:text-fg',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-px h-px bg-ember-500" transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button to="/contact" size="sm" className="hidden sm:inline-flex">
            Contact me
          </Button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl text-fg transition hover:bg-white/5 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass mx-auto mt-2 max-w-6xl rounded-2xl p-2 lg:hidden"
          >
            <ul className="grid gap-0.5">
              {[...NAV_LINKS, { to: '/contact', label: 'Contact' }].map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      cn('flex items-center justify-between rounded-xl px-4 py-3 text-[15px] transition', isActive ? 'bg-white/[0.06] text-fg' : 'text-muted hover:bg-white/[0.04] hover:text-fg')
                    }
                  >
                    {link.label}
                    <span className="font-mono text-[11px] text-subtle">{link.to}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
