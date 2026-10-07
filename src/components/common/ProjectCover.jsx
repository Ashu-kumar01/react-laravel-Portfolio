import { memo } from 'react'
import { cn } from '../../utils/cn'
import { initials } from '../../utils/format'

const ACCENTS = [
  { from: 'rgba(255,106,69,0.28)', line: '#ff8a68' },
  { from: 'rgba(143,177,255,0.24)', line: '#8fb1ff' },
  { from: 'rgba(111,227,180,0.2)', line: '#6fe3b4' },
  { from: 'rgba(245,194,107,0.2)', line: '#f5c26b' },
]

const hash = (text = '') => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

/**
 * Project image, or — when no image has been uploaded yet — a branded,
 * code-styled cover generated from the project title. Replace it by uploading
 * a featured image in Admin → Projects.
 */
export const ProjectCover = memo(function ProjectCover({ project, className, priority = false, sizes = '(min-width: 1024px) 33vw, 100vw' }) {
  if (project.featured_image) {
    return (
      <img
        src={project.featured_image}
        alt={`${project.title} preview`}
        className={cn('h-full w-full object-cover', className)}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        sizes={sizes}
        width="1200"
        height="675"
      />
    )
  }

  const seed = hash(project.title)
  const accent = ACCENTS[seed % ACCENTS.length]
  const widths = [72, 48, 84, 60, 38, 66].map((w, i) => (w + ((seed >> i) % 18)) % 92)

  return (
    <div
      role="img"
      aria-label={`${project.title} cover`}
      className={cn('relative h-full w-full overflow-hidden bg-ink-850', className)}
      style={{ backgroundImage: `radial-gradient(120% 90% at 85% 0%, ${accent.from}, transparent 60%)` }}
    >
      <div className="bg-grid absolute inset-0 opacity-60" aria-hidden="true" />
      {/* Faux editor window */}
      <div className="absolute inset-x-[8%] bottom-0 top-[18%] rounded-t-xl border border-b-0 border-white/10 bg-ink-900/90 shadow-2xl" aria-hidden="true">
        <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="ml-2 truncate font-mono text-[10px] text-subtle">{project.slug}.php</span>
        </div>
        <div className="space-y-2 p-3.5">
          {widths.map((w, i) => (
            <div key={i} className="flex items-center gap-2" style={{ paddingLeft: `${(i % 3) * 10}px` }}>
              <span className="w-3 text-right font-mono text-[9px] text-white/20">{i + 1}</span>
              <span className="h-1.5 rounded-full" style={{ width: `${w}%`, background: i % 3 === 0 ? accent.line : 'rgba(255,255,255,0.12)', opacity: i % 3 === 0 ? 0.7 : 1 }} />
            </div>
          ))}
        </div>
      </div>
      <span className="absolute right-[10%] top-[6%] font-mono text-3xl font-semibold tracking-tight text-white/[0.08] sm:text-4xl" aria-hidden="true">
        {initials(project.title)}
      </span>
    </div>
  )
})
