import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Calendar, ChevronLeft, ChevronRight, Layers, UserRound, Building2 } from 'lucide-react'
import { EASE_OUT } from '../animations/variants'
import { SvgBrand } from '../components/common/BrandIcon'
import { ProjectCard } from '../components/common/ProjectCard'
import { ProjectCover } from '../components/common/ProjectCover'
import { Reveal, RevealGroup, RevealItem } from '../components/common/Reveal'
import { Tag } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { LoadingRegion, Skeleton, SkeletonText } from '../components/ui/Skeleton'
import { ErrorState } from '../components/ui/States'
import { useProject } from '../hooks/usePortfolio'
import { useSeo } from '../hooks/useSeo'
import { formatPeriod, paragraphs } from '../utils/format'
import NotFoundPage from './NotFoundPage'

function Gallery({ images, title }) {
  const [index, setIndex] = useState(null)
  if (!images?.length) return null
  const open = index !== null
  const step = (dir) => setIndex((i) => (i + dir + images.length) % images.length)

  return (
    <section aria-labelledby="gallery-title" className="mt-16">
      <h2 id="gallery-title" className="eyebrow mb-5">gallery</h2>
      <RevealGroup as="ul" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <RevealItem as="li" key={img.path}>
            <button type="button" onClick={() => setIndex(i)} className="surface group block aspect-[16/10] w-full overflow-hidden rounded-xl" aria-label={`Open screenshot ${i + 1} of ${images.length}`}>
              <img src={img.url} alt={`${title} screenshot ${i + 1}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" width="800" height="500" />
            </button>
          </RevealItem>
        ))}
      </RevealGroup>
      <Modal open={open} onClose={() => setIndex(null)} title={`${title} — ${index !== null ? index + 1 : ''} / ${images.length}`} size="lg"
        footer={images.length > 1 && (
          <>
            <Button variant="secondary" size="sm" onClick={() => step(-1)}><ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous</Button>
            <Button variant="secondary" size="sm" onClick={() => step(1)}>Next <ChevronRight className="h-4 w-4" aria-hidden="true" /></Button>
          </>
        )}
      >
        {open && <img src={images[index].url} alt={`${title} screenshot ${index + 1}`} className="w-full rounded-lg" />}
      </Modal>
    </section>
  )
}

function MetaRow({ icon: Icon, label, children }) {
  if (!children) return null
  return (
    <div className="flex gap-3 py-3.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-subtle" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs text-subtle">{label}</dt>
        <dd className="mt-0.5 text-[14.5px] text-fg">{children}</dd>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <LoadingRegion label="Loading project" className="container-page pt-32">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-6 h-12 w-2/3" />
      <Skeleton className="mt-4 h-5 w-1/2" />
      <Skeleton className="mt-10 aspect-[16/8] w-full rounded-2xl" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <SkeletonText lines={6} />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </LoadingRegion>
  )
}

export default function ProjectDetailPage() {
  const { slug } = useParams()
  const { data, isLoading, isError, error, refetch } = useProject(slug)
  const reduce = useReducedMotion()
  const project = data?.data
  const related = data?.meta?.related ?? []

  const jsonLd = useMemo(
    () =>
      project && {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: project.title,
        description: project.short_description,
        genre: project.category,
        keywords: project.technologies?.join(', '),
        ...(project.live_url && { url: project.live_url }),
        creator: { '@type': 'Person', name: 'Ashwani Kumar Kushwaha' },
      },
    [project],
  )

  useSeo({
    title: project?.title ?? (isError ? 'Project not found' : 'Project'),
    description: project?.short_description,
    image: project?.featured_image ?? undefined,
    type: 'article',
    jsonLd,
    noindex: isError,
  })

  if (isLoading) return <DetailSkeleton />
  if (isError && error?.kind === 'not_found') return <NotFoundPage embedded />
  if (isError) {
    return (
      <div className="container-page pt-36">
        <ErrorState error={error} onRetry={refetch} />
      </div>
    )
  }

  const enter = (delay = 0) => (reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay, ease: EASE_OUT } })
  const period = formatPeriod(project.start_date, project.end_date, Boolean(project.start_date && !project.end_date))

  return (
    <article className="pb-10 pt-28 sm:pt-32">
      <div className="container-page">
        <motion.div {...enter(0)}>
          <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All projects
          </Link>
        </motion.div>

        <motion.header {...enter(0.05)} className="mt-8 max-w-3xl">
          <p className="eyebrow">{project.category}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-5xl md:text-6xl">{project.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">{project.short_description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {/* The API only sends live_url when "Show View demo" is on in the admin. */}
            {project.show_demo && project.live_url && (
              <Button href={project.live_url} target="_blank" rel="noopener noreferrer" size="lg">
                View demo <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
            {project.github_url && (
              <Button href={project.github_url} target="_blank" rel="noopener noreferrer" variant="secondary" size="lg">
                <SvgBrand slug="github" className="h-4 w-4" title="" /> Source on GitHub
              </Button>
            )}
          </div>
        </motion.header>

        <motion.div {...enter(0.15)} className="surface mt-12 aspect-[16/9] overflow-hidden rounded-2xl sm:aspect-[16/8]">
          <ProjectCover project={project} priority sizes="(min-width: 1152px) 1152px, 100vw" />
        </motion.div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <Reveal className="space-y-5 text-[16.5px] leading-[1.8] text-muted">
              <h2 className="eyebrow">overview</h2>
              {paragraphs(project.description || project.short_description).map((p, i) => (
                <p key={i} className={i === 0 ? 'text-fg/90' : undefined}>{p}</p>
              ))}
            </Reveal>

            {project.features?.length > 0 && (
              <Reveal className="mt-12">
                <h2 className="eyebrow mb-5">what I worked on</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {project.features.map((feature, i) => (
                    <li key={feature} className="surface flex gap-3 rounded-xl p-4 text-[14.5px] text-fg/90">
                      <span className="font-mono text-[11px] text-ember-400">{String(i + 1).padStart(2, '0')}</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          <Reveal as="aside" delay={0.05} className="lg:sticky lg:top-28 lg:self-start">
            <div className="surface rounded-2xl p-5">
              <h2 className="eyebrow mb-1">project info</h2>
              <dl className="divide-y divide-[var(--line)]">
                <MetaRow icon={UserRound} label="My role">{project.role}</MetaRow>
                <MetaRow icon={Building2} label="Client">{project.client}</MetaRow>
                <MetaRow icon={Calendar} label="Timeline">{period}</MetaRow>
                <MetaRow icon={Layers} label="Category">{project.category}</MetaRow>
              </dl>
              {project.technologies?.length > 0 && (
                <div className="border-t border-[var(--line)] pt-4">
                  <p className="mb-3 text-xs text-subtle">Technologies</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {project.technologies.map((t) => <li key={t}><Tag>{t}</Tag></li>)}
                  </ul>
                </div>
              )}
            </div>
          </Reveal>
        </div>

        <Gallery images={project.gallery} title={project.title} />

        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-24 border-t border-[var(--line)] pt-14">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 id="related-title" className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">Related projects</h2>
              <Button to="/projects" variant="ghost" size="sm">View all</Button>
            </div>
            <RevealGroup className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <RevealItem key={p.id}><ProjectCard project={p} /></RevealItem>)}
            </RevealGroup>
          </section>
        )}
      </div>
    </article>
  )
}
