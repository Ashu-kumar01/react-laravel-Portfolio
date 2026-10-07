/** Shown while a lazily-loaded route chunk downloads on first load. */
export function RouteFallback() {
  return <div className="min-h-dvh bg-ink-950" role="status" aria-label="Loading" />
}
