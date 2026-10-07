import { ArrowRight, FolderKanban } from 'lucide-react'
import { ProjectCard, ProjectCardSkeleton } from '../components/common/ProjectCard'
import { RevealGroup, RevealItem } from '../components/common/Reveal'
import { SectionHeading } from '../components/common/SectionHeading'
import { Button } from '../components/ui/Button'
import { LoadingRegion } from '../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../components/ui/States'
import { useProfile, useProjects } from '../hooks/usePortfolio'

export function FeaturedProjects({ index = '03' }) {
  // Featured first; if none are flagged featured, fall back to the latest published.
  const featured = useProjects({ featured: 1, per_page: 6 })
  const usingFallback = featured.isSuccess && (featured.data?.data?.length ?? 0) === 0
  const fallback = useProjects({ per_page: 6 }, { enabled: usingFallback })
  const query = usingFallback ? fallback : featured
  const projects = query.data?.data ?? []
  const websites = useProfile().data?.data?.stats?.websites

  return (
    <section id="projects" className="container-page py-20 sm:py-28" aria-labelledby="projects-title">
      <SectionHeading
        index={index}
        eyebrow="selected work"
        title={<span id="projects-title">Projects that shipped.</span>}
        description={`An educational ERP, university, college and business websites${websites ? ` — highlights from ${websites}+ websites I have contributed to` : ''}.`}
        action={
          <Button to="/projects" variant="secondary">
            All projects <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        }
      />

      <div className="mt-12">
        {query.isLoading && (
          <LoadingRegion label="Loading projects" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => <ProjectCardSkeleton key={i} />)}
          </LoadingRegion>
        )}
        {query.isError && <ErrorState error={query.error} onRetry={query.refetch} />}
        {query.isSuccess && projects.length === 0 && (
          <EmptyState icon={FolderKanban} title="No projects published yet" description="Published projects from the admin panel will appear here." />
        )}
        {projects.length > 0 && (
          <RevealGroup className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <RevealItem key={project.id}>
                <ProjectCard project={project} priority={i < 2} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}
