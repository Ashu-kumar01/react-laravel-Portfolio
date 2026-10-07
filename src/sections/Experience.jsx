import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { Briefcase, MapPin } from 'lucide-react'
import { Reveal } from '../components/common/Reveal'
import { SectionHeading } from '../components/common/SectionHeading'
import { Badge, Tag } from '../components/ui/Badge'
import { LoadingRegion, Skeleton } from '../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../components/ui/States'
import { useExperience, useProfile } from '../hooks/usePortfolio'
import { formatDuration, formatPeriod } from '../utils/format'

function TimelineItem({ item }) {
  return (
    <li className="relative pl-10 sm:pl-14">
      <span className="absolute left-[7px] top-2 grid h-3 w-3 place-items-center sm:left-[15px]" aria-hidden="true">
        <span className="h-3 w-3 rounded-full border-2 border-ember-500 bg-ink-950" />
        {item.is_current && <span className="absolute h-3 w-3 animate-ping rounded-full bg-ember-500/40" />}
      </span>
      <Reveal className="surface rounded-2xl p-5 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[12px] text-ember-300">{formatPeriod(item.start_date, item.end_date, item.is_current)}</p>
            <h3 className="mt-1.5 text-xl font-semibold text-fg">{item.position}</h3>
            <p className="mt-0.5 text-[15px] text-muted">{item.company}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {item.is_current && <Badge tone="mint">Current</Badge>}
            {item.employment_type && <Badge>{item.employment_type}</Badge>}
            <Badge className="font-mono">{formatDuration(item.start_date, item.is_current ? null : item.end_date)}</Badge>
          </div>
        </div>
        {item.location && (
          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-subtle">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {item.location}
          </p>
        )}
        {item.description && <p className="mt-4 leading-relaxed text-muted">{item.description}</p>}
        {item.responsibilities?.length > 0 && (
          <ul className="mt-4 space-y-2">
            {item.responsibilities.map((r) => (
              <li key={r} className="flex gap-3 text-[14.5px] text-fg/85">
                <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-ember-400" aria-hidden="true" />
                {r}
              </li>
            ))}
          </ul>
        )}
        {item.technologies?.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies used">
            {item.technologies.map((t) => <li key={t}><Tag>{t}</Tag></li>)}
          </ul>
        )}
      </Reveal>
    </li>
  )
}

export function Experience({ index = '04', full = false }) {
  const { data, isLoading, isError, error, refetch } = useExperience()
  const items = (data?.data ?? []).filter((item) => (item.type ?? 'work') === 'work')
  const stats = useProfile().data?.data?.stats
  const listRef = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 60%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <section id="experience" className="container-page py-20 sm:py-28" aria-labelledby="experience-title">
      <SectionHeading
        index={index}
        eyebrow="experience"
        as={full ? 'h1' : 'h2'}
        title={<span id="experience-title">Where I&apos;ve been building.</span>}
        description={
          stats?.years_experience
            ? `${stats.years_experience}+ years of professional web development${stats.websites ? ` — ${stats.websites}+ websites across education, business, organisational and service domains` : ''}.`
            : 'The roles behind the work.'
        }
      />

      <div className="mt-12">
        {isLoading && (
          <LoadingRegion label="Loading experience" className="space-y-4">
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
          </LoadingRegion>
        )}
        {isError && <ErrorState error={error} onRetry={refetch} />}
        {!isLoading && !isError && items.length === 0 && (
          <EmptyState icon={Briefcase} title="No experience added yet" description="Roles added in the admin panel will appear on this timeline." />
        )}
        {items.length > 0 && (
          <div ref={listRef} className="relative">
            <div className="absolute bottom-2 left-[12px] top-2 w-px bg-[var(--line-strong)] sm:left-[20px]" aria-hidden="true" />
            <motion.div
              className="absolute bottom-2 left-[12px] top-2 w-px origin-top bg-gradient-to-b from-ember-500 via-ember-400 to-signal-400 sm:left-[20px]"
              style={{ scaleY: reduce ? 1 : progress }}
              aria-hidden="true"
            />
            <ol className="space-y-6">
              {items.map((item) => <TimelineItem key={item.id} item={item} />)}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}
