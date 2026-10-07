import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Archive, Mail, MailOpen, Phone, Reply, Trash2 } from 'lucide-react'
import { adminApi } from '../../api/admin'
import { queryKeys } from '../../api/queryClient'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Modal } from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/States'
import { cn } from '../../utils/cn'
import { formatDateTime, relativeTime } from '../../utils/format'
import { DataTable, SearchInput, Toolbar } from '../components/DataTable'
import { PageHeader } from '../components/PageHeader'
import { MessageStatusBadge } from '../components/StatusBadges'
import { useAdminMutation, useDebouncedValue } from '../hooks'

const TABS = [
  { key: '', label: 'All', count: 'all' },
  { key: 'new', label: 'New', count: 'new' },
  { key: 'read', label: 'Read', count: 'read' },
  { key: 'replied', label: 'Replied', count: 'replied' },
  { key: 'archived', label: 'Archived', count: 'archived' },
]

function MessageDetail({ id, onClose, onDelete }) {
  const query = useQuery({ queryKey: queryKeys.admin.item('messages', id), queryFn: () => adminApi.messages.get(id) })
  const setStatus = useAdminMutation('messages', ({ status }) => adminApi.messages.setStatus(id, status))
  const m = query.data?.data

  if (query.isLoading) return <div className="space-y-3"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-32" /></div>
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} compact />

  const replyHref = `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-fg">{m.name}</p>
          <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 text-sm text-muted hover:text-fg"><Mail className="h-3.5 w-3.5" aria-hidden="true" /> {m.email}</a>
          {m.phone && <a href={`tel:${m.phone}`} className="mt-0.5 flex items-center gap-1.5 text-sm text-muted hover:text-fg"><Phone className="h-3.5 w-3.5" aria-hidden="true" /> {m.phone}</a>}
        </div>
        <div className="text-right">
          <MessageStatusBadge status={m.status} />
          <p className="mt-1.5 text-xs text-subtle">{formatDateTime(m.created_at)}</p>
        </div>
      </div>
      <div className="rounded-xl border border-[var(--line)] bg-ink-900/60 p-4">
        <p className="mb-2 text-sm font-medium text-fg">{m.subject}</p>
        {/* Rendered as plain text — never as HTML */}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">{m.message}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button href={replyHref} size="sm" onClick={() => setStatus.mutate({ status: 'replied' })}><Reply className="h-4 w-4" aria-hidden="true" /> Reply by email</Button>
        {m.status !== 'replied' && <Button variant="secondary" size="sm" loading={setStatus.isPending} onClick={() => setStatus.mutate({ status: 'replied' })}>Mark replied</Button>}
        {m.status !== 'new' && <Button variant="secondary" size="sm" onClick={() => setStatus.mutate({ status: 'new' }, { onSuccess: onClose })}><MailOpen className="h-4 w-4" aria-hidden="true" /> Mark unread</Button>}
        {m.status !== 'archived' && <Button variant="secondary" size="sm" onClick={() => setStatus.mutate({ status: 'archived' }, { onSuccess: onClose })}><Archive className="h-4 w-4" aria-hidden="true" /> Archive</Button>}
        <Button variant="danger" size="sm" onClick={() => onDelete(m)}><Trash2 className="h-4 w-4" aria-hidden="true" /> Delete</Button>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const debounced = useDebouncedValue(search)
  const status = params.get('status') ?? ''
  const page = Number(params.get('page') ?? 1)
  const openId = params.get('open')

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key === 'status') next.delete('page')
    setParams(next, { replace: true })
  }

  const filters = { status: status || undefined, search: debounced || undefined, page }
  const query = useQuery({ queryKey: queryKeys.admin.list('messages', filters), queryFn: () => adminApi.messages.list(filters), placeholderData: keepPreviousData })
  const counts = query.data?.meta?.counts ?? {}

  const setStatus = useAdminMutation('messages', ({ id, status: s }) => adminApi.messages.setStatus(id, s))
  const remove = useAdminMutation('messages', (id) => adminApi.messages.remove(id), {
    onSuccess: () => {
      setToDelete(null)
      setParam('open', '')
    },
  })

  const columns = [
    {
      key: 'from',
      label: 'From',
      render: (m) => (
        <button type="button" onClick={() => setParam('open', String(m.id))} className="block min-w-[180px] text-left">
          <span className={cn('block text-sm', m.status === 'new' ? 'font-semibold text-fg' : 'text-fg/85')}>{m.name}</span>
          <span className="block text-xs text-subtle">{m.email}</span>
        </button>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (m) => (
        <button type="button" onClick={() => setParam('open', String(m.id))} className="block max-w-md text-left">
          <span className={cn('block truncate text-sm', m.status === 'new' ? 'font-medium text-fg' : 'text-muted')}>{m.subject}</span>
          <span className="block truncate text-xs text-subtle">{m.message}</span>
        </button>
      ),
    },
    { key: 'status', label: 'Status', render: (m) => <MessageStatusBadge status={m.status} /> },
    { key: 'created_at', label: 'Received', render: (m) => <span className="text-xs text-subtle" title={formatDateTime(m.created_at)}>{relativeTime(m.created_at)}</span> },
    {
      key: 'actions',
      label: 'Actions',
      className: 'md:text-right',
      render: (m) => (
        <div className="inline-flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setStatus.mutate({ id: m.id, status: m.status === 'new' ? 'read' : 'new' })}>
            {m.status === 'new' ? 'Mark read' : 'Mark unread'}
          </Button>
          {m.status !== 'archived' && (
            <Button variant="ghost" size="icon-sm" onClick={() => setStatus.mutate({ id: m.id, status: 'archived' })} aria-label={`Archive message from ${m.name}`}><Archive className="h-4 w-4" /></Button>
          )}
          <Button variant="ghost" size="icon-sm" className="hover:!text-danger-400" onClick={() => setToDelete(m)} aria-label={`Delete message from ${m.name}`}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Messages" description="Enquiries submitted through the contact form." />
      <div role="tablist" aria-label="Filter by status" className="mb-4 flex gap-1 overflow-x-auto border-b border-[var(--line)]">
        {TABS.map((tab) => (
          <button
            key={tab.key || 'all'}
            role="tab"
            type="button"
            aria-selected={status === tab.key}
            onClick={() => setParam('status', tab.key)}
            className={cn('-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition', status === tab.key ? 'border-ember-500 text-fg' : 'border-transparent text-muted hover:text-fg')}
          >
            {tab.label}
            <span className="rounded-full bg-white/[0.06] px-1.5 font-mono text-[11px] text-subtle">{counts[tab.count] ?? 0}</span>
          </button>
        ))}
      </div>
      <Toolbar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setParam('page', '') }} placeholder="Search name, email, subject…" label="Search messages" />
      </Toolbar>
      <DataTable
        columns={columns}
        rows={query.data?.data ?? []}
        query={query}
        onPage={(p) => setParam('page', String(p))}
        emptyTitle={status || debounced ? 'No messages match' : 'No messages yet'}
        emptyDescription={status || debounced ? 'Try another filter.' : 'Messages from the contact form will appear here.'}
      />

      <Modal open={Boolean(openId)} onClose={() => setParam('open', '')} title="Message" size="lg">
        {openId && <MessageDetail key={openId} id={openId} onClose={() => setParam('open', '')} onDelete={setToDelete} />}
      </Modal>
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete message?"
        description={`The message from ${toDelete?.name} will be deleted.`}
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => remove.mutate(toDelete.id)}
      />
    </>
  )
}
