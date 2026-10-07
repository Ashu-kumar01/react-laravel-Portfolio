import { useEffect } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { RefreshCw, House } from 'lucide-react'
import { Button } from '../components/ui/Button'
import NotFoundPage from './NotFoundPage'

const isChunkLoadError = (error) => /dynamically imported module|Loading chunk|Importing a module script failed/i.test(String(error?.message ?? ''))

/**
 * Route-level error boundary ("500" page). Never shows raw error details to
 * visitors; logs them to the console in development only.
 */
export default function ErrorPage() {
  const error = useRouteError()

  useEffect(() => {
    if (import.meta.env.DEV) console.error(error)
  }, [error])

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />

  const chunk = isChunkLoadError(error)

  return (
    <main className="grid min-h-dvh place-items-center bg-ink-950 px-4 text-center">
      <div className="max-w-md">
        <p className="font-mono text-sm text-danger-400">500</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-fg">Something went wrong.</h1>
        <p className="mt-4 text-muted">
          {chunk
            ? 'A new version of the site may have been deployed. Reloading should fix it.'
            : 'An unexpected error occurred. Please try again, or head back to the home page.'}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={() => window.location.reload()}><RefreshCw className="h-4 w-4" aria-hidden="true" /> Reload</Button>
          <Button href="/" variant="secondary"><House className="h-4 w-4" aria-hidden="true" /> Home</Button>
        </div>
      </div>
    </main>
  )
}
