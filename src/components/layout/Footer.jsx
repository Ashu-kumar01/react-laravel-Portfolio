import { Link } from 'react-router'
import { MapPin } from 'lucide-react'
import { useProfile } from '../../hooks/usePortfolio'
import { ApiStatus } from '../common/ApiStatus'
import { Logo } from '../common/Logo'
import { SocialLinks } from '../common/ProfileLinks'
import { NAV_LINKS } from '../../config/navigation'

export function Footer() {
  const { data } = useProfile()
  const profile = data?.data?.profile ?? {}
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-24 border-t border-[var(--line)]">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            {profile.summary ?? 'Full-stack developer building Laravel back ends, REST APIs and React interfaces.'}
          </p>
          {profile.location && (
            <p className="flex items-center gap-2 text-sm text-subtle">
              <MapPin className="h-4 w-4" aria-hidden="true" /> {profile.location}
            </p>
          )}
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow mb-4">Navigate</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {[...NAV_LINKS, { to: '/contact', label: 'Contact' }].map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-muted transition-colors hover:text-fg">{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-4">
          <p className="eyebrow">System</p>
          <ApiStatus />
          <SocialLinks />
        </div>
      </div>
      <div className="border-t border-[var(--line)]">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-5 font-mono text-xs text-subtle sm:flex-row sm:items-center">
          <p>© {year} {profile.full_name ?? 'Ashwani Kumar Kushwaha'}</p>
          <p>Built with Laravel · React · Three.js</p>
        </div>
      </div>
    </footer>
  )
}
