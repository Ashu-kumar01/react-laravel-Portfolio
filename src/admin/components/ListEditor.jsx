import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Edits a list of short strings (technologies, features, responsibilities).
 * Enter or comma adds an item; items can be removed individually.
 */
export function ListEditor({ id, value = [], onChange, placeholder = 'Add item and press Enter', suggestions = [], max = 30, invalid, ...aria }) {
  const [draft, setDraft] = useState('')

  const add = (raw) => {
    const item = raw.trim()
    if (!item || value.includes(item) || value.length >= max) return
    onChange([...value, item])
    setDraft('')
  }

  const remaining = suggestions.filter((s) => !value.includes(s))

  return (
    <div className="space-y-2">
      <div className={cn('flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border bg-ink-900/80 p-1.5 focus-within:border-ember-500/60 focus-within:ring-2 focus-within:ring-ember-500/40', invalid ? 'border-danger-400/60' : 'border-[var(--line-strong)]')}>
        {value.map((item) => (
          <span key={item} className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-white/[0.04] py-1 pl-2.5 pr-1 text-[13px] text-fg">
            {item}
            <button type="button" onClick={() => onChange(value.filter((v) => v !== item))} className="rounded p-0.5 text-subtle hover:bg-white/10 hover:text-fg" aria-label={`Remove ${item}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              add(draft)
            } else if (e.key === 'Backspace' && !draft && value.length) {
              onChange(value.slice(0, -1))
            }
          }}
          onBlur={() => draft && add(draft)}
          placeholder={value.length ? '' : placeholder}
          className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-sm text-fg placeholder:text-subtle focus:outline-none"
          {...aria}
        />
      </div>
      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {remaining.slice(0, 12).map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-subtle transition hover:bg-white/5 hover:text-fg">
              <Plus className="h-3 w-3" aria-hidden="true" /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
