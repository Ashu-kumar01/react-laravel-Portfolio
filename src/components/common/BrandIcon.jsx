import { Braces, CodeXml, LayoutTemplate, MonitorSmartphone, PanelsTopLeft, PenTool, Webhook } from 'lucide-react'
import { cn } from '../../utils/cn'
import { initials } from '../../utils/format'
import { BRANDS } from './brands'

/** Concepts without a brand get a line icon. */
const CONCEPTS = {
  'rest-api': Webhook,
  'vs-code': CodeXml,
  'ui-ux': PenTool,
  'ui-ux-design': PenTool,
  'ui-development': PanelsTopLeft,
  'responsive-design': MonitorSmartphone,
  'web-design': LayoutTemplate,
}

/** Brand colours that are too dark to read on the dark UI are lifted to off-white. */
const readable = (hex) => {
  const n = parseInt(hex, 16)
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum < 0.28 ? '#e8e7e3' : `#${hex}`
}

/** `decorative` hides the icon from assistive tech when visible text already names it. */
export function SvgBrand({ slug, className, colored = false, title, decorative = false }) {
  const icon = BRANDS[slug]
  if (!icon) return null
  const a11y = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': title ?? icon.title }
  return (
    <svg viewBox="0 0 24 24" className={className} {...a11y} fill={colored ? readable(icon.hex) : 'currentColor'}>
      <path d={icon.path} />
    </svg>
  )
}

/**
 * Icon for a technology: uploaded icon (admin) → brand mark → concept icon → monogram.
 */
export function TechIcon({ tech, className, colored = true }) {
  const size = cn('h-5 w-5', className)

  if (tech.icon_url) {
    return <img src={tech.icon_url} alt="" className={cn(size, 'object-contain')} loading="lazy" decoding="async" width="20" height="20" />
  }
  if (BRANDS[tech.slug]) {
    return <SvgBrand slug={tech.slug} className={size} colored={colored} title={tech.name} />
  }
  const Concept = CONCEPTS[tech.slug] ?? (tech.category === 'backend' ? Braces : null)
  if (Concept) return <Concept className={cn(size, 'text-signal-300')} aria-hidden="true" />

  return (
    <span className={cn(size, 'grid place-items-center rounded-md bg-white/[0.06] font-mono text-[10px] font-semibold text-muted')} aria-hidden="true">
      {initials(tech.name) || '?'}
    </span>
  )
}
