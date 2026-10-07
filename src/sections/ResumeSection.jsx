import { FileText, Mail } from 'lucide-react'
import { Reveal } from '../components/common/Reveal'
import { ResumeButton } from '../components/common/ProfileLinks'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { ErrorState } from '../components/ui/States'
import { useProfile } from '../hooks/usePortfolio'
import { formatBytes, formatDate } from '../utils/format'

/** Resume call-to-action. Metadata comes from GET /api/v1/profile → resume. */
export function ResumeSection({ full = false }) {
  const { data, isLoading, isError, error, refetch } = useProfile()
  const resume = data?.data?.resume
  const profile = data?.data?.profile ?? {}

  return (
    <section id="resume" className="container-page py-16 sm:py-24" aria-labelledby="resume-title">
      <Reveal className="surface relative overflow-hidden rounded-3xl">
        <div className="bg-grid mask-fade-y absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ember-500/10 blur-3xl" aria-hidden="true" />
        <div className="relative grid items-center gap-10 p-7 sm:p-12 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow">resume</p>
            {full ? (
              <h1 id="resume-title" className="mt-4 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">My résumé, always up to date.</h1>
            ) : (
              <h2 id="resume-title" className="mt-4 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">My résumé, always up to date.</h2>
            )}
            <p className="mt-4 max-w-lg leading-relaxed text-muted">
              A one-page summary of my experience with {profile.tagline ?? 'PHP, Laravel, React, REST APIs and MySQL'}. Download the latest PDF version.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {isLoading && <Skeleton className="h-12 w-48 rounded-xl" />}
              {isError && <ErrorState error={error} onRetry={refetch} compact className="w-full" />}
              {!isLoading && !isError && (resume ? (
                <ResumeButton variant="primary" />
              ) : (
                <>
                  <p className="w-full text-sm text-subtle">The latest résumé is available on request.</p>
                  <Button to="/contact" variant="primary" size="lg"><Mail className="h-4 w-4" aria-hidden="true" /> Request résumé</Button>
                </>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[260px]" aria-hidden="true">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-3 rounded-2xl border border-[var(--line)] bg-ink-800/60" />
            <div className="relative space-y-3 rounded-2xl border border-[var(--line-strong)] bg-ink-850 p-6 shadow-2xl">
              <FileText className="h-7 w-7 text-ember-400" />
              <div className="h-2.5 w-3/4 rounded bg-white/15" />
              <div className="h-2 w-1/2 rounded bg-white/10" />
              <div className="space-y-1.5 pt-3">
                {[90, 76, 84, 60, 72, 50].map((w, i) => <div key={i} className="h-1.5 rounded bg-white/[0.07]" style={{ width: `${w}%` }} />)}
              </div>
              {resume && (
                <p className="pt-2 font-mono text-[10.5px] text-subtle">
                  PDF · {formatBytes(resume.size)} · {formatDate(resume.updated_at)}
                </p>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
