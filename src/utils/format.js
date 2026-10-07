const monthYear = new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' })
const fullDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const dateTime = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })

const parse = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatMonthYear = (value) => (parse(value) ? monthYear.format(parse(value)) : '')
export const formatDate = (value) => (parse(value) ? fullDate.format(parse(value)) : '')
export const formatDateTime = (value) => (parse(value) ? dateTime.format(parse(value)) : '')

/** "Jan 2022 — Present" */
export function formatPeriod(start, end, isCurrent = false) {
  const from = formatMonthYear(start)
  const to = isCurrent || !end ? 'Present' : formatMonthYear(end)
  if (!from) return to === 'Present' ? '' : to
  return `${from} — ${to}`
}

/** Human readable duration between two dates, e.g. "4 yrs 9 mos". */
export function formatDuration(start, end) {
  const from = parse(start)
  if (!from) return ''
  const to = parse(end) ?? new Date()
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1
  months = Math.max(months, 1)
  const years = Math.floor(months / 12)
  const rest = months % 12
  return [years && `${years} yr${years > 1 ? 's' : ''}`, rest && `${rest} mo${rest > 1 ? 's' : ''}`].filter(Boolean).join(' ')
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function relativeTime(value) {
  const date = parse(value)
  if (!date) return ''
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

/** Splits multi-paragraph text into paragraphs (content is always rendered as text, never HTML). */
export const paragraphs = (text = '') => text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
