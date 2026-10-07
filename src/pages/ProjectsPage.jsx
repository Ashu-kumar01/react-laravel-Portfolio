import { useDeferredValue } from 'react'
import { useSearchParams } from 'react-router'
import { FolderKanban, Search } from 'lucide-react'
import { ProjectCard, ProjectCardSkeleton } from '../components/common/ProjectCard'
import { RevealGroup, RevealItem } from '../components/common/Reveal'
import { SectionHeading } from '../components/common/SectionHeading'
import { Button } from '../components/ui/Button'
import { LoadingRegion } from '../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../components/ui/States'
import { useProjects } from '../hooks/usePortfolio'
import { useSeo } from '../hooks/useSeo'
import { cn } from '../utils/cn'

export default function ProjectsPage() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? ''
  const search = params.get('q') ?? ''
  const page = Number(params.get('page') ?? 1)
  const deferredSearch = useDeferredValue(search)

  useSeo({ title: 'Projects', description: 'Selected work: an educational ERP, university, college and business websites built with Laravel, PHP and modern front-end tools.' })

  const query = useProjects({ category: category || undefined, search: deferredSearch || undefined, page, per_page: 9 })
  const projects = query.data?.data ?? []
  const categories = query.data?.meta?.categories ?? []
  const pagination = query.data?.meta?.pagination

  const update = (next) => {
    const merged = new URLSearchParams(params)
    Object.entries(next).forEach(([k, v]) => (v ? merged.set(k, v) : merged.delete(k)))
    if (!('page' in next)) merged.delete('page')
    setParams(merged, { replace: true })
  }

  return (
    <div className="container-page pb-10 pt-32 sm:pt-36">
      <SectionHeading
        as="h1"
        eyebrow="projects"
        title="Selected work."
        description="Real client and company projects — what each one was, the stack it used and exactly what I worked on."
      />

      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label="Filter by category" className="flex gap-1.5 overflow-x-auto pb-1">
          {['', ...categories].map((cat) => (
            <button
              key={cat || 'all'}
              type="button"
              role="tab"
              aria-selected={category === cat}
              onClick={() => update({ category: cat })}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition-all',
                category === cat ? 'border-ember-500/40 bg-ember-500/10 text-fg' : 'border-[var(--line)] text-muted hover:border-[var(--line-strong)] hover:text-fg',
              )}
            >
              {cat || 'All'}
            </button>
          ))}
        </div>
        <label className="relative block md:w-72">
          <span className="sr-only">Search projects</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search projects…"
            className="h-10 w-full rounded-xl border border-[var(--line-strong)] bg-ink-900/80 pl-10 pr-3 text-sm text-fg placeholder:text-subtle focus:border-ember-500/60 focus:outline-none focus:ring-2 focus:ring-ember-500/40"
          />
        </label>
      </div>

      <div className={cn('mt-8 transition-opacity', query.isPlaceholderData && 'opacity-60')} aria-busy={query.isFetching}>
        {query.isLoading && (
          <LoadingRegion label="Loading projects" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => <ProjectCardSkeleton key={i} />)}
          </LoadingRegion>
        )}
        {query.isError && <ErrorState error={query.error} onRetry={query.refetch} />}
        {query.isSuccess && projects.length === 0 && (
          <EmptyState
            icon={FolderKanban}
            title={search || category ? 'No projects match your filters' : 'No projects published yet'}
            description={search || category ? 'Try a different search term or category.' : 'Projects published from the admin panel will appear here.'}
            action={(search || category) && <Button variant="secondary" size="sm" onClick={() => setParams({}, { replace: true })}>Clear filters</Button>}
          />
        )}
        {projects.length > 0 && (
          <RevealGroup key={`${category}-${deferredSearch}-${page}`} className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <RevealItem key={project.id}>
                <ProjectCard project={project} priority={i < 3} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>

      {pagination && pagination.last_page > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>Previous</Button>
          <span className="px-3 font-mono text-xs text-muted">{pagination.current_page} / {pagination.last_page}</span>
          <Button variant="secondary" size="sm" disabled={page >= pagination.last_page} onClick={() => update({ page: String(page + 1) })}>Next</Button>
        </nav>
      )}
    </div>
  )
}
