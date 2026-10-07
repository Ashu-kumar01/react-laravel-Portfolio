import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Eye, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { adminApi } from '../../api/admin'
import { queryKeys } from '../../api/queryClient'
import { ProjectCover } from '../../components/common/ProjectCover'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Switch } from '../../components/ui/Field'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/format'
import { DataTable, FilterSelect, SearchInput, Toolbar } from '../components/DataTable'
import { PageHeader } from '../components/PageHeader'
import { PublishBadge } from '../components/StatusBadges'
import { useAdminMutation, useDebouncedValue } from '../hooks'

export default function ProjectsListPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')
  const debounced = useDebouncedValue(search)
  const [toDelete, setToDelete] = useState(null)

  const filters = {
    search: debounced || undefined,
    status: params.get('status') || undefined,
    category: params.get('category') || undefined,
    featured: params.get('featured') || undefined,
    page: params.get('page') || 1,
  }
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  const query = useQuery({
    queryKey: queryKeys.admin.list('projects', filters),
    queryFn: () => adminApi.projects.list(filters),
    placeholderData: keepPreviousData,
  })
  const rows = query.data?.data ?? []
  const categories = query.data?.meta?.categories ?? []

  const patch = useAdminMutation('projects', ({ id, values }) => adminApi.projects.patch(id, values))
  const remove = useAdminMutation('projects', (id) => adminApi.projects.remove(id), { onSuccess: () => setToDelete(null) })

  const columns = [
    {
      key: 'title',
      label: 'Project',
      render: (p) => (
        <div className="flex min-w-[220px] items-center gap-3">
          <span className="hidden h-10 w-16 shrink-0 overflow-hidden rounded-md border border-[var(--line)] sm:block"><ProjectCover project={p} /></span>
          <div className="min-w-0">
            <Link to={`/admin/projects/${p.id}/edit`} className="block truncate font-medium text-fg hover:underline">{p.title}</Link>
            <p className="truncate font-mono text-[11px] text-subtle">/{p.slug}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (p) => <span className="text-muted">{p.category}</span> },
    { key: 'status', label: 'Status', render: (p) => <PublishBadge status={p.status} /> },
    {
      key: 'featured',
      label: 'Featured',
      render: (p) => (
        <Switch
          checked={p.featured}
          label={`Featured: ${p.title}`}
          disabled={patch.isPending}
          onChange={(featured) => patch.mutate({ id: p.id, values: { featured } }, {})}
        />
      ),
    },
    { key: 'sort_order', label: 'Order', render: (p) => <span className="font-mono text-xs text-muted">{p.sort_order}</span> },
    { key: 'updated_at', label: 'Updated', render: (p) => <span className="text-xs text-subtle">{formatDate(p.updated_at)}</span> },
    {
      key: 'actions',
      label: 'Actions',
      className: 'md:text-right',
      render: (p) => (
        <div className="inline-flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => patch.mutate({ id: p.id, values: { status: p.status === 'published' ? 'draft' : 'published' } })}
            title={p.status === 'published' ? 'Unpublish' : 'Publish'}
          >
            {p.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
          {p.status === 'published' && (
            <Button href={`/projects/${p.slug}`} target="_blank" rel="noopener" variant="ghost" size="icon-sm" aria-label={`View ${p.title} on site`}><Eye className="h-4 w-4" /></Button>
          )}
          <Button to={`/admin/projects/${p.id}/edit`} variant="ghost" size="icon-sm" aria-label={`Edit ${p.title}`}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon-sm" className="hover:!text-danger-400" onClick={() => setToDelete(p)} aria-label={`Delete ${p.title}`}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Projects"
        description="Create, publish and feature portfolio projects."
        actions={<Button to="/admin/projects/create" size="sm"><Plus className="h-4 w-4" aria-hidden="true" /> New project</Button>}
      />
      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search title, client…" label="Search projects" />
        <FilterSelect label="Status" value={params.get('status') ?? ''} onChange={(v) => setFilter('status', v)} options={[{ value: '', label: 'All statuses' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]} />
        <FilterSelect label="Category" value={params.get('category') ?? ''} onChange={(v) => setFilter('category', v)} options={[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c, label: c }))]} />
        <button
          type="button"
          onClick={() => setFilter('featured', params.get('featured') ? '' : '1')}
          aria-pressed={Boolean(params.get('featured'))}
          className={cn('inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm transition', params.get('featured') ? 'border-ember-500/40 bg-ember-500/10 text-fg' : 'border-[var(--line-strong)] text-muted hover:text-fg')}
        >
          <Star className="h-4 w-4" aria-hidden="true" /> Featured only
        </button>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={rows}
        query={query}
        onPage={(page) => setFilter('page', String(page))}
        emptyTitle={debounced || params.toString() ? 'No projects match these filters' : 'No projects yet'}
        emptyDescription={debounced || params.toString() ? 'Try adjusting the search or filters.' : 'Create your first project to show it on the portfolio.'}
        emptyAction={!debounced && !params.toString() && <Button to="/admin/projects/create" size="sm">Create project</Button>}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete project?"
        description={`"${toDelete?.title}" will be removed from the portfolio. This cannot be undone from the admin panel.`}
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => remove.mutate(toDelete.id)}
      />
    </>
  )
}
