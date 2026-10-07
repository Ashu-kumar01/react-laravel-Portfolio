import { GraduationCap, MapPin } from 'lucide-react'
import { RevealGroup, RevealItem } from '../components/common/Reveal'
import { SectionHeading } from '../components/common/SectionHeading'
import { LoadingRegion, Skeleton } from '../components/ui/Skeleton'
import { ErrorState } from '../components/ui/States'
import { useExperience } from '../hooks/usePortfolio'

/** Education year label: "2018 — 2022", or a single year when start and end match. */
function years(start, end) {
  const from = start?.slice(0, 4)
  const to = end?.slice(0, 4)
  if (!to || to === from) return from ?? ''
  return `${from} — ${to}`
}

/** Education entries come from the experience API (type = "education"). */
export function Education({ index = '05' }) {
  const { data, isLoading, isError, error, refetch } = useExperience()
  const items = (data?.data ?? []).filter((item) => item.type === 'education')

  if (!isLoading && !isError && items.length === 0) return null

  return (
    <section id="education" className="container-page py-20 sm:py-24" aria-labelledby="education-title">
      <SectionHeading index={index} eyebrow="education" title={<span id="education-title">Computer science foundations.</span>} />

      <div className="mt-10">
        {isLoading && (
          <LoadingRegion label="Loading education" className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </LoadingRegion>
        )}
        {isError && <ErrorState error={error} onRetry={refetch} />}
        {items.length > 0 && (
          <RevealGroup as="ol" className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <RevealItem as="li" key={item.id} className="surface flex gap-4 rounded-2xl p-5 sm:p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-ink-900 text-ember-400">
                  <GraduationCap className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[12px] text-ember-300">{years(item.start_date, item.end_date)}</p>
                  <h3 className="mt-1 text-lg font-semibold text-fg">{item.position}</h3>
                  <p className="mt-0.5 text-[15px] text-muted">{item.company}</p>
                  {item.description && <p className="mt-3 inline-flex rounded-md border border-[var(--line)] bg-white/[0.03] px-2 py-0.5 font-mono text-xs text-fg/85">{item.description}</p>}
                  {item.location && (
                    <p className="mt-3 flex items-center gap-1.5 text-[13px] text-subtle">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {item.location}
                    </p>
                  )}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}
