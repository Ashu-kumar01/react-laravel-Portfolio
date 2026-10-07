import { useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Briefcase, Cpu, ExternalLink, FileText, FolderKanban, LayoutDashboard, LogOut, Menu, MessageSquare, PanelsTopLeft, Search, Settings, Sparkles, UserRound, X } from 'lucide-react'
import { adminApi } from '../../api/admin'
import { queryKeys } from '../../api/queryClient'
import { Logo } from '../../components/common/Logo'
import { useAuth } from '../../store/auth'
import { cn } from '../../utils/cn'
import { initials } from '../../utils/format'

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/landing', label: 'Landing section', icon: PanelsTopLeft },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/technologies', label: 'Technologies', icon: Cpu },
  { to: '/admin/experience', label: 'Experience', icon: Briefcase },
  { to: '/admin/services', label: 'Services', icon: Sparkles },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare, badge: 'unread' },
  { to: '/admin/resume', label: 'Resume', icon: FileText },
]
const ACCOUNT = [
  { to: '/admin/profile', label: 'Profile', icon: UserRound },
  { to: '/admin/seo', label: 'SEO', icon: Search },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

function NavItems({ unread, onNavigate }) {
  const link = ({ to, label, icon: Icon, badge }) => (
    <li key={to}>
      <NavLink
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
            isActive ? 'bg-white/[0.07] text-fg' : 'text-muted hover:bg-white/[0.04] hover:text-fg',
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon className={cn('h-4 w-4', isActive ? 'text-ember-400' : 'text-subtle group-hover:text-muted')} aria-hidden="true" />
            <span className="flex-1">{label}</span>
            {badge === 'unread' && unread > 0 && (
              <span className="rounded-full bg-ember-500/15 px-2 py-0.5 font-mono text-[11px] text-ember-300" aria-label={`${unread} unread`}>{unread}</span>
            )}
          </>
        )}
      </NavLink>
    </li>
  )

  return (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-6 overflow-y-auto">
      <div>
        <p className="eyebrow mb-2 px-3">Content</p>
        <ul className="space-y-0.5">{NAV.map(link)}</ul>
      </div>
      <div>
        <p className="eyebrow mb-2 px-3">Account</p>
        <ul className="space-y-0.5">{ACCOUNT.map(link)}</ul>
      </div>
    </nav>
  )
}

export default function AdminLayout() {
  const { isAuthenticated, user, logout, expired } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const dashboard = useQuery({ queryKey: queryKeys.admin.dashboard, queryFn: adminApi.dashboard, enabled: isAuthenticated })
  const unread = dashboard.data?.data?.stats?.unread_messages ?? 0

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname, expired }} />
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between px-1">
        <Logo to="/admin/dashboard" />
        <span className="rounded-md border border-[var(--line)] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-subtle">admin</span>
      </div>
      <NavItems unread={unread} onNavigate={() => setMobileOpen(false)} />
      <div className="space-y-1 border-t border-[var(--line)] pt-4">
        <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-white/[0.04] hover:text-fg">
          <ExternalLink className="h-4 w-4 text-subtle" aria-hidden="true" /> View website
        </a>
        <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-danger-400/10 hover:text-danger-400">
          <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-ink-950 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r border-[var(--line)] bg-ink-900/60 lg:block">{sidebar}</aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[280px] border-r border-[var(--line)] bg-ink-900"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              aria-label="Admin navigation"
            >
              <button type="button" onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-lg p-2 text-muted hover:bg-white/5 hover:text-fg" aria-label="Close navigation">
                <X className="h-4 w-4" />
              </button>
              {sidebar}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--line)] bg-ink-950/80 px-4 backdrop-blur-md sm:px-6">
          <button type="button" className="rounded-lg p-2 text-fg hover:bg-white/5 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </button>
          <p className="hidden font-mono text-xs text-subtle sm:block">{location.pathname}</p>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium text-fg">{user?.name}</p>
              <p className="font-mono text-[11px] text-subtle">@{user?.username}</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line-strong)] bg-ink-800 text-xs font-semibold text-fg" aria-hidden="true">
              {initials(user?.name)}
            </span>
          </div>
        </header>
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
