import { useApiHealth } from '../../hooks/usePortfolio'
import { cn } from '../../utils/cn'

/**
 * Live backend indicator: pings GET /api/v1/health and shows real latency.
 */
export function ApiStatus({ className }) {
  const { data, isLoading, isError } = useApiHealth()
  const ok = data?.status === 'operational'

  const label = isLoading ? 'Connecting…' : isError || !ok ? 'API unreachable' : 'API operational'

  return (
    <div className={cn('flex items-center gap-2.5', className)} role="status" aria-live="polite">
      <span
        className={cn(
          'relative inline-flex h-2 w-2 rounded-full',
          isLoading ? 'bg-amber-400' : ok ? 'bg-mint-400 animate-pulse-dot' : 'bg-danger-400',
        )}
        aria-hidden="true"
      />
      <span className="font-mono text-xs text-muted">
        {label}
        {ok && data?.latency != null && <span className="text-subtle"> · {data.latency}ms</span>}
      </span>
    </div>
  )
}
