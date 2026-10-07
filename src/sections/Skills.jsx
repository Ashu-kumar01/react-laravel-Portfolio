import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Cpu } from 'lucide-react'
import { TechIcon } from '../components/common/BrandIcon'
import { Reveal } from '../components/common/Reveal'
import { SectionHeading } from '../components/common/SectionHeading'
import { LoadingRegion, Skeleton } from '../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../components/ui/States'
import { LEVELS } from '../config/skills'
import { useTechnologies } from '../hooks/usePortfolio'
import { cn } from '../utils/cn'

function LevelMeter({ level }) {
  const info = LEVELS[level] ?? LEVELS.intermediate
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn('font-mono text-[11px]', info.tone)}>{info.label}</span>
      <span className="flex gap-1" aria-hidden="true">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={cn(
              'h-1.5 w-5 rounded-full',
              step <= info.steps ? (level === 'learning' ? 'bg-signal-400/80' : 'bg-ember-500') : 'bg-white/[0.08]',
            )}
          />
        ))}
      </span>
    </div>
  )
}

function TechTile({ tech }) {
  return (
    <div className="surface group relative flex h-full flex-col gap-4 rounded-xl p-4 transition-colors duration-300 hover:border-[var(--line-strong)]">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--line)] bg-ink-900 transition-colors duration-300 group-hover:border-white/15">
          <TechIcon tech={tech} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-medium text-fg">{tech.name}</p>
          <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">{tech.category}</p>
        </div>
      </div>
      <div className="mt-auto">
        <LevelMeter level={tech.proficiency} />
      </div>
    </div>
  )
}

/** Infinite, slow marquee of every technology (paused for reduced motion). */
function TechMarquee({ items }) {
  const reduce = useReducedMotion()
  if (items.length === 0) return null
  const loop = [...items, ...items]
  return (
    <div className="mask-fade-x relative overflow-hidden py-2" aria-hidden="true">
      <motion.div
        className="flex w-max gap-3"
        animate={reduce ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration: items.length * 2.4, ease: 'linear', repeat: Infinity }}
      >
        {loop.map((tech, i) => (
          <span key={`${tech.id}-${i}`} className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/[0.02] px-3.5 py-2 text-[13px] text-muted">
            <TechIcon tech={tech} className="h-4 w-4" />
            {tech.name}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export function Skills({ index = '02', full = false }) {
  const { data, isLoading, isError, error, refetch } = useTechnologies()
  const [active, setActive] = useState('all')
  const technologies = useMemo(() => data?.data ?? [], [data])
  const categories = data?.meta?.categories ?? []

  const visible = useMemo(
    () => (active === 'all' ? technologies : technologies.filter((t) => t.category === active)),
    [technologies, active],
  )

  return (
    <section id="skills" className="relative py-20 sm:py-28" aria-labelledby="skills-title">
      <div className="container-page">
        <SectionHeading
          index={index}
          eyebrow="skills / technologies"
          as={full ? 'h1' : 'h2'}
          title={<span id="skills-title">Strong frontend roots, a PHP & Laravel back end.</span>}
          description="The tools I use day to day — rated honestly as advanced, intermediate or currently learning."
        />
      </div>

      <div className="mt-10">
        {!isLoading && !isError && <TechMarquee items={technologies} />}
      </div>

      <div className="container-page mt-10">
        {isLoading && (
          <LoadingRegion label="Loading technologies" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-[118px] rounded-xl" />)}
          </LoadingRegion>
        )}

        {isError && <ErrorState error={error} onRetry={refetch} />}

        {!isLoading && !isError && technologies.length === 0 && (
          <EmptyState icon={Cpu} title="No technologies listed yet" description="Technologies added in the admin panel will appear here." />
        )}

        {technologies.length > 0 && (
          <>
            <Reveal>
              <div role="tablist" aria-label="Filter technologies by category" className="mb-6 flex gap-1.5 overflow-x-auto pb-1">
                {[{ key: 'all', label: 'All', count: technologies.length }, ...categories].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    role="tab"
                    aria-selected={active === cat.key}
                    onClick={() => setActive(cat.key)}
                    className={cn(
                      'flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition-all',
                      active === cat.key ? 'border-ember-500/40 bg-ember-500/10 text-fg' : 'border-[var(--line)] text-muted hover:border-[var(--line-strong)] hover:text-fg',
                    )}
                  >
                    {cat.label}
                    <span className="font-mono text-[11px] text-subtle">{cat.count}</span>
                  </button>
                ))}
              </div>
            </Reveal>

            <ul className="mb-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="Skill level legend">
              {Object.entries(LEVELS).map(([key, info]) => (
                <li key={key} className="flex items-center gap-2 text-xs text-subtle">
                  <span className="flex gap-0.5" aria-hidden="true">
                    {[1, 2, 3].map((s) => <span key={s} className={cn('h-1 w-3 rounded-full', s <= info.steps ? (key === 'learning' ? 'bg-signal-400/80' : 'bg-ember-500') : 'bg-white/[0.08]')} />)}
                  </span>
                  {info.label}
                </li>
              ))}
            </ul>

            <motion.ul layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="tabpanel" aria-label={`${active} technologies`}>
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map((tech) => (
                  <motion.li
                    key={tech.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                  >
                    <TechTile tech={tech} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </>
        )}
      </div>
    </section>
  )
}
