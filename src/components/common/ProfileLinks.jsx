import { Download, FileText } from 'lucide-react'
import { useProfile } from '../../hooks/usePortfolio'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'
import { SvgBrand } from './BrandIcon'

/**
 * GitHub / LinkedIn links from the profile settings. Links that have not been
 * configured in Admin → Settings are simply not rendered.
 */
export function SocialLinks({ className, size = 'icon' }) {
  const { data } = useProfile()
  const profile = data?.data?.profile ?? {}
  const links = [
    profile.github_url && { href: profile.github_url, label: 'GitHub', slug: 'github' },
    profile.linkedin_url && { href: profile.linkedin_url, label: 'LinkedIn', slug: 'linkedin' },
  ].filter(Boolean)

  if (links.length === 0) return null

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {links.map((link) => (
        <Button key={link.slug} href={link.href} target="_blank" rel="noopener noreferrer" variant="secondary" size={size} aria-label={`${link.label} (opens in a new tab)`}>
          <SvgBrand slug={link.slug} className="h-4 w-4" title={link.label} />
        </Button>
      ))}
    </div>
  )
}

/**
 * Download button driven by GET /profile → resume.download_url, so the URL
 * is never hard-coded in React. Hidden until a resume is uploaded.
 */
export function ResumeButton({ variant = 'secondary', size = 'lg', className, label = 'Download Resume', showWhenMissing = false }) {
  const { data, isLoading } = useProfile()
  const resume = data?.data?.resume

  if (isLoading) return null
  if (!resume) {
    return showWhenMissing ? (
      <Button variant={variant} size={size} className={className} disabled>
        <FileText className="h-4 w-4" aria-hidden="true" /> Resume coming soon
      </Button>
    ) : null
  }

  return (
    <Button href={resume.download_url} variant={variant} size={size} className={className} download={resume.file_name}>
      <Download className="h-4 w-4" aria-hidden="true" /> {label}
    </Button>
  )
}
