import { useState } from 'react'

/*
 * Lightweight SVG charts for the dashboard — no chart library in the bundle.
 * Single-series, one hue (#e9502c, validated against the dark surface), thin
 * marks with 4px rounded data-ends, recessive grid, per-bar hover tooltip and
 * an equivalent visually-hidden table for screen readers.
 */
const BAR = '#e9502c'
const BAR_HOVER = '#ff6a45'

function A11yTable({ caption, rows, valueLabel }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead><tr><th scope="col">Label</th><th scope="col">{valueLabel}</th></tr></thead>
      <tbody>{rows.map((r) => <tr key={r.label}><td>{r.label}</td><td>{r.value}</td></tr>)}</tbody>
    </table>
  )
}

/** Vertical bars, e.g. messages per month. */
export function ColumnChart({ data, caption, valueLabel = 'Count', height = 180 }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(1, ...data.map((d) => d.value))
  const ticks = [0, Math.ceil(max / 2), max]
  const width = 100 / data.length

  return (
    <figure className="relative">
      <div className="relative" style={{ height }} aria-hidden="true">
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${(t / max) * 100}%` }}>
            <span className="w-6 text-right font-mono text-[10px] text-subtle">{t}</span>
            <span className="h-px flex-1 bg-white/[0.06]" />
          </div>
        ))}
        <div className="absolute inset-y-0 left-8 right-0 flex items-end">
          {data.map((d, i) => (
            <div
              key={d.label}
              className="relative flex h-full flex-col items-center justify-end"
              style={{ width: `${width}%` }}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
            >
              <div
                className="w-[38%] max-w-7 rounded-t-[4px] transition-colors"
                style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 3 : 0, background: hover === i ? BAR_HOVER : BAR }}
              />
              {hover === i && (
                <div className="pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap rounded-lg border border-[var(--line-strong)] bg-ink-800 px-2.5 py-1.5 text-xs text-fg shadow-xl" style={{ bottom: `${(d.value / max) * 100}%` }}>
                  <span className="text-muted">{d.label}</span> · <span className="font-mono">{d.value}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="ml-8 mt-2 flex" aria-hidden="true">
        {data.map((d) => (
          <span key={d.label} className="text-center font-mono text-[10.5px] text-subtle" style={{ width: `${width}%` }}>{d.label}</span>
        ))}
      </div>
      <A11yTable caption={caption} rows={data} valueLabel={valueLabel} />
    </figure>
  )
}

/** Horizontal bars with direct value labels, e.g. technologies per category. */
export function BarList({ data, caption, valueLabel = 'Count' }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <figure>
      <ul className="space-y-3" aria-hidden="true">
        {data.map((d) => (
          <li key={d.label} className="group grid grid-cols-[110px_1fr_32px] items-center gap-3 text-sm" title={`${d.label}: ${d.value}`}>
            <span className="truncate capitalize text-muted">{d.label}</span>
            <span className="h-2 rounded-r-[4px] bg-white/[0.04]">
              <span className="block h-full rounded-r-[4px] transition-colors group-hover:!bg-[#ff6a45]" style={{ width: `${(d.value / max) * 100}%`, background: BAR }} />
            </span>
            <span className="text-right font-mono text-xs text-fg">{d.value}</span>
          </li>
        ))}
      </ul>
      <A11yTable caption={caption} rows={data} valueLabel={valueLabel} />
    </figure>
  )
}
