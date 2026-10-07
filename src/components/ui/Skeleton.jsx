import { cn } from '../../utils/cn'

export function Skeleton({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative overflow-hidden rounded-lg bg-white/[0.04]',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.6s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/[0.05] after:to-transparent',
        className,
      )}
    />
  )
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2.5', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

/** Wraps skeleton groups so assistive tech announces loading once. */
export function LoadingRegion({ label = 'Loading', className, children }) {
  return (
    <div role="status" aria-live="polite" aria-label={label} className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  )
}
