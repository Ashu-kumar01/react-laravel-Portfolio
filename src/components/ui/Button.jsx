import { forwardRef } from 'react'
import { Link } from 'react-router'
import { LoaderCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

const variants = {
  primary:
    'bg-fg text-ink-950 hover:bg-white shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset,0_8px_24px_-12px_rgba(255,255,255,0.35)]',
  accent: 'bg-ember-500 text-white hover:bg-ember-400 shadow-[0_8px_24px_-12px_rgba(255,106,69,0.7)]',
  secondary: 'surface text-fg hover:border-[var(--line-strong)] hover:bg-white/[0.05]',
  ghost: 'text-muted hover:text-fg hover:bg-white/[0.05]',
  danger: 'bg-danger-400/12 text-danger-400 border border-danger-400/25 hover:bg-danger-400/20',
}

const sizes = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[15px] gap-2.5 rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
  'icon-sm': 'h-8 w-8 rounded-lg',
}

/**
 * Polymorphic button: renders a router <Link> when `to` is set, an <a> when
 * `href` is set, otherwise a <button>.
 */
export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, className, children, to, href, disabled, type, ...props },
  ref,
) {
  const classes = cn(
    'relative inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-all duration-200 ease-out',
    'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
    variants[variant],
    sizes[size],
    className,
  )

  const content = (
    <>
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  )

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button ref={ref} type={type ?? 'button'} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  )
})
