import { CircleAlert, Inbox, RefreshCw, WifiOff } from 'lucide-react'
import { MESSAGES } from '../../api/errors'
import { cn } from '../../utils/cn'
import { Button } from './Button'

/** Consistent error UI for failed queries. Network errors get their own copy. */
export function ErrorState({ error, onRetry, title, className, compact = false }) {
  const isNetwork = error?.isNetwork || error?.kind === 'network'
  const Icon = isNetwork ? WifiOff : CircleAlert
  const heading = title ?? (isNetwork ? MESSAGES.network : MESSAGES.loadFailed)
  const detail = isNetwork ? MESSAGES.networkDetail : error?.kind === 'server' ? MESSAGES.serverDetail : null

  return (
    <div
      role="alert"
      className={cn(
        'surface flex flex-col items-center justify-center rounded-2xl text-center',
        compact ? 'gap-2 px-4 py-6' : 'gap-3 px-6 py-12',
        className,
      )}
    >
      <span className="grid h-10 w-10 place-items-center rounded-full border border-danger-400/25 bg-danger-400/10 text-danger-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="font-medium text-fg">{heading}</p>
        {detail && <p className="text-sm text-muted">{detail}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={() => onRetry()} className="mt-1">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Try again
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-12 text-center', className)}>
      <span className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-white/[0.03] text-muted">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="font-medium text-fg">{title}</p>
        {description && <p className="mx-auto max-w-sm text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
