import { useRef } from 'react'
import { cn } from '../../utils/cn'

/**
 * Card with a soft radial highlight that follows the pointer (adapted from the
 * 21st.dev "spotlight card" pattern). Pure CSS variables — no re-renders.
 */
export function SpotlightCard({ as: Component = 'div', className, children, ...props }) {
  const ref = useRef(null)

  const onPointerMove = (event) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    el.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }

  return (
    <Component
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn(
        'group/spot surface relative overflow-hidden rounded-2xl transition-colors duration-300 hover:border-[var(--line-strong)]',
        'before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100',
        'before:bg-[radial-gradient(420px_circle_at_var(--mx,50%)_var(--my,50%),rgba(255,138,104,0.08),transparent_45%)]',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
