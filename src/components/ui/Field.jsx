import { forwardRef, useId } from 'react'
import { cn } from '../../utils/cn'

const control =
  'w-full rounded-xl border bg-ink-900/80 px-3.5 text-sm text-fg placeholder:text-subtle transition-colors duration-150 ' +
  'focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500/60 disabled:opacity-60'

const stateClass = (error) => (error ? 'border-danger-400/60' : 'border-[var(--line-strong)] hover:border-white/20')

/**
 * Label + control + hint/error wrapper. Wires aria-describedby / aria-invalid
 * so screen readers announce validation errors inline.
 */
export function Field({ label, error, hint, required, children, className, id: idProp }) {
  const autoId = useId()
  const id = idProp ?? autoId
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-[13px] font-medium text-fg/90">
          {label}
          {required && <span className="ml-0.5 text-ember-400" aria-hidden="true">*</span>}
        </label>
      )}
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error ? (
        <p id={`${id}-error`} className="text-[12.5px] text-danger-400" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[12.5px] text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return <input ref={ref} className={cn(control, 'h-11', stateClass(error), className)} {...props} />
})

export const Textarea = forwardRef(function Textarea({ className, error, rows = 5, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={cn(control, 'resize-y py-3 leading-relaxed', stateClass(error), className)} {...props} />
})

export const Select = forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(control, 'h-11 appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9', stateClass(error), className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a1a3aa' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...props}>
      {children}
    </select>
  )
})

/** Accessible toggle switch (button with role="switch"). */
export function Switch({ checked, onChange, label, disabled, id }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-200 disabled:opacity-50',
        checked ? 'border-ember-500/60 bg-ember-500/80' : 'border-[var(--line-strong)] bg-white/[0.06]',
      )}
    >
      <span
        className={cn(
          'inline-block h-4.5 w-4.5 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  )
}
