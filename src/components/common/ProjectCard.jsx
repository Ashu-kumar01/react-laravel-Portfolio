import { memo } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { Tag } from '../ui/Badge'
import { Skeleton } from '../ui/Skeleton'
import { ProjectCover } from './ProjectCover'
import { SpotlightCard } from './SpotlightCard'

export const ProjectCard = memo(function ProjectCard({ project, priority = false }) {
  return (
    <SpotlightCard as="article" className="flex h-full flex-col">
      <Link
        to={`/projects/${project.slug}`}
        className="flex h-full flex-col rounded-2xl focus-visible:outline-offset-[-2px]"
        aria-label={`${project.title} — view case study`}
      >
        <div className="relative aspect-[16/10] overflow-hidden border-b border-[var(--line)]">
          <div className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/spot:scale-[1.03]">
            <ProjectCover project={project} priority={priority} />
          </div>
          {project.featured && (
            <span className="glass absolute left-3 top-3 rounded-full px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wider text-ember-300">
              Featured
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="eyebrow mb-1.5">{project.category}</p>
              <h3 className="text-lg font-semibold leading-snug text-fg">{project.title}</h3>
            </div>
            <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--line)] text-muted transition-all duration-300 group-hover/spot:border-ember-500/40 group-hover/spot:bg-ember-500/10 group-hover/spot:text-ember-300">
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/spot:-translate-y-0.5 group-hover/spot:translate-x-0.5" aria-hidden="true" />
            </span>
          </div>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted">{project.short_description}</p>
          {project.technologies?.length > 0 && (
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="Technologies">
              {project.technologies.slice(0, 4).map((tech) => (
                <li key={tech}><Tag>{tech}</Tag></li>
              ))}
              {project.technologies.length > 4 && <li><Tag>+{project.technologies.length - 4}</Tag></li>}
            </ul>
          )}
        </div>
      </Link>
    </SpotlightCard>
  )
})

export function ProjectCardSkeleton() {
  return (
    <div className="surface overflow-hidden rounded-2xl">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <div className="flex gap-1.5 pt-2">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    </div>
  )
}
