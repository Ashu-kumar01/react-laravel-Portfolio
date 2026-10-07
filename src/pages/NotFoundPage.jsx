import { ArrowLeft, House } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useSeo } from '../hooks/useSeo'

export default function NotFoundPage({ embedded = false }) {
  useSeo({ title: 'Page not found', noindex: true })

  return (
    <section className="container-page grid min-h-[78vh] place-items-center pt-24 text-center" aria-labelledby="nf-title">
      <div className="max-w-lg">
        <div className="surface mx-auto mb-10 w-fit rounded-xl px-5 py-4 text-left font-mono text-[13px] leading-relaxed">
          <p><span className="text-ember-400">GET</span> <span className="text-fg/90">{typeof window !== 'undefined' ? window.location.pathname : '/'}</span></p>
          <p className="text-subtle">→ <span className="text-danger-400">404</span> Not Found</p>
        </div>
        <h1 id="nf-title" className="text-4xl font-semibold tracking-tight text-fg sm:text-5xl">Lost in the code?</h1>
        <p className="mt-4 text-muted">
          {embedded ? "This project doesn't exist or is no longer published." : "The page you're looking for doesn't exist or has moved."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/"><House className="h-4 w-4" aria-hidden="true" /> Back home</Button>
          <Button to="/projects" variant="secondary"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Browse projects</Button>
        </div>
      </div>
    </section>
  )
}
