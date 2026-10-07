import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../../components/ui/States'
import { cn } from '../../utils/cn'

export function SearchInput({ value, onChange, placeholder = 'Search…', label = 'Search' }) {
  return (
    <label className="relative block w-full sm:w-64">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-[var(--line-strong)] bg-ink-900 pl-9 pr-3 text-sm text-fg placeholder:text-subtle focus:border-ember-500/60 focus:outline-none focus:ring-2 focus:ring-ember-500/40"
      />
    </label>
  )
}

export function FilterSelect({ value, onChange, options, label }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border border-[var(--line-strong)] bg-ink-900 px-3 pr-8 text-sm text-fg focus:border-ember-500/60 focus:outline-none focus:ring-2 focus:ring-ember-500/40"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}

export function Toolbar({ children }) {
  return <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>
}

export function Pagination({ meta, onPage }) {
  if (!meta || meta.total === 0) return null
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--line)] px-4 py-3 text-sm text-muted sm:flex-row">
      <p>
        Showing <span className="text-fg">{meta.from}</span>–<span className="text-fg">{meta.to}</span> of <span className="text-fg">{meta.total}</span>
      </p>
      <nav className="flex items-center gap-2" aria-label="Pagination">
        <Button variant="secondary" size="sm" disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-mono text-xs">{meta.current_page} / {meta.last_page}</span>
        <Button variant="secondary" size="sm" disabled={meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  )
}

/**
 * Generic table with loading / error / empty states. On small screens rows
 * collapse into stacked cards (each cell shows its column label).
 */
export function DataTable({ columns, rows, query, emptyTitle, emptyDescription, emptyAction, rowKey = (r) => r.id, onPage }) {
  const meta = query.data?.meta?.pagination

  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />

  return (
    <div className={cn('surface overflow-hidden rounded-2xl transition-opacity', query.isFetching && !query.isLoading && 'opacity-70')}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="hidden border-b border-[var(--line)] bg-white/[0.02] md:table-header-group">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className={cn('px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-subtle', col.className)}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {query.isLoading &&
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4"><Skeleton className="h-4 w-full max-w-[160px]" /></td>
                  ))}
                </tr>
              ))}
            {!query.isLoading &&
              rows.map((row) => (
                <tr key={rowKey(row)} className="grid grid-cols-1 gap-1 px-4 py-3 transition-colors hover:bg-white/[0.02] md:table-row md:p-0">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('align-middle md:px-4 md:py-3.5', col.className)}>
                      <span className="mr-2 font-mono text-[10.5px] uppercase tracking-wider text-subtle md:hidden">{col.label}</span>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {!query.isLoading && rows.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} className="m-4 border-0" />
      )}
      {onPage && <Pagination meta={meta} onPage={onPage} />}
    </div>
  )
}
