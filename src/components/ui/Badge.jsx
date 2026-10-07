import { cn } from '../../utils/cn'

const tones = {
  neutral: 'text-muted border-[var(--line)] bg-white/[0.03]',
  ember: 'text-ember-300 border-ember-500/25 bg-ember-500/10',
  signal: 'text-signal-300 border-signal-400/25 bg-signal-400/10',
  mint: 'text-mint-400 border-mint-400/25 bg-mint-400/10',
  amber: 'text-amber-400 border-amber-400/25 bg-amber-400/10',
  danger: 'text-danger-400 border-danger-400/25 bg-danger-400/10',
}

export function Badge({ tone = 'neutral', className, children, ...props }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', tones[tone], className)}
      {...props}
    >
      {children}
    </span>
  )
}

/** Monospace chip used for technologies / tags. */
export function Tag({ className, children }) {
  return (
    <span className={cn('inline-flex items-center rounded-md border border-[var(--line)] bg-white/[0.025] px-2 py-0.5 font-mono text-[11.5px] text-muted', className)}>
      {children}
    </span>
  )
}
