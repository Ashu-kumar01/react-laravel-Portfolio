import { Link } from 'react-router'
import { cn } from '../../utils/cn'

export function Logo({ className, to = '/' }) {
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)} aria-label="Ashwani Kushwaha — home">
      <span className="relative grid h-8 w-8 place-items-center rounded-lg border border-[var(--line-strong)] bg-ink-850 font-mono text-[11px] font-semibold text-fg transition-colors group-hover:border-ember-500/50">
        AK
        <span className="absolute -bottom-px left-1.5 right-1.5 h-px bg-gradient-to-r from-transparent via-ember-500 to-transparent" aria-hidden="true" />
      </span>
      <span className="hidden text-[14px] font-medium tracking-tight text-fg/85 transition-colors group-hover:text-fg sm:inline">
        Ashwani Kushwaha
      </span>
    </Link>
  )
}
