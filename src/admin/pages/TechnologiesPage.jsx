import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { adminApi } from '../../api/admin'
import { fieldErrors } from '../../api/errors'
import { queryKeys } from '../../api/queryClient'
import { TechIcon } from '../../components/common/BrandIcon'
import { LEVELS, LEVEL_OPTIONS } from '../../config/skills'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Field, Input, Select, Switch } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { DataTable, FilterSelect, SearchInput, Toolbar } from '../components/DataTable'
import { SingleImageInput } from '../components/ImageInput'
import { PageHeader } from '../components/PageHeader'
import { ActiveBadge } from '../components/StatusBadges'
import { useAdminMutation, useDebouncedValue } from '../hooks'

const CATEGORIES = ['frontend', 'backend', 'database', 'mobile', 'tools', 'design']

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(80),
  category: z.enum(CATEGORIES, { message: 'Choose a category.' }),
  proficiency: z.enum(['advanced', 'intermediate', 'learning'], { message: 'Choose a level.' }),
  sort_order: z.coerce.number().int().min(0).max(100000),
  is_active: z.boolean(),
})

const EMPTY = { name: '', category: 'backend', proficiency: 'intermediate', sort_order: 0, is_active: true }

function TechnologyForm({ technology, onDone }) {
  const [icon, setIcon] = useState(null)
  const [removeIcon, setRemoveIcon] = useState(false)
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: technology ? { name: technology.name, category: technology.category, proficiency: technology.proficiency, sort_order: technology.sort_order, is_active: technology.is_active } : EMPTY,
  })

  const save = useAdminMutation(
    'technologies',
    (values) => (technology ? adminApi.technologies.update(technology.id, values) : adminApi.technologies.create(values)),
    {
      success: technology ? 'Technology updated' : 'Technology added',
      onSuccess: onDone,
      onError: (e) => e.isValidation && Object.entries(fieldErrors(e)).forEach(([k, m]) => setError(k, { message: m })),
    },
  )

  return (
    <form
      id="technology-form"
      noValidate
      onSubmit={handleSubmit((values) => save.mutate({ ...values, icon: icon ?? undefined, ...(removeIcon && !icon ? { remove_icon: true } : {}) }))}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" required error={errors.name?.message}>
          {(a) => <Input {...a} data-autofocus error={errors.name} {...register('name')} />}
        </Field>
        <Field label="Category" required error={errors.category?.message}>
          {(a) => (
            <Select {...a} error={errors.category} {...register('category')}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Skill level" required hint="Shown as a 3-step meter — no percentages" error={errors.proficiency?.message}>
          {(a) => (
            <Select {...a} error={errors.proficiency} {...register('proficiency')}>
              {LEVEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Sort order" error={errors.sort_order?.message}>
          {(a) => <Input {...a} type="number" min={0} error={errors.sort_order} {...register('sort_order')} />}
        </Field>
      </div>
      <Field label="Icon" hint="Optional · PNG, JPG or WebP up to 512 KB. Known technologies show their brand mark automatically." error={errors.icon?.message}>
        {(a) => (
          <div className="max-w-[160px]">
            <SingleImageInput id={a.id} aspect="aspect-square" maxKb={512} currentUrl={technology?.icon_url} file={icon} removed={removeIcon} onFile={(f) => { setIcon(f); if (f) setRemoveIcon(false) }} onRemove={() => setRemoveIcon(true)} onInvalid={(m) => toast.error(m)} />
          </div>
        )}
      </Field>
      <Controller
        control={control}
        name="is_active"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3">
            <div>
              <label htmlFor="tech-active" className="text-sm font-medium text-fg">Visible on website</label>
              <p className="text-xs text-subtle">Hidden technologies stay in the admin only.</p>
            </div>
            <Switch id="tech-active" checked={field.value} onChange={field.onChange} label="Visible on website" />
          </div>
        )}
      />
      <div className="flex justify-end gap-2 border-t border-[var(--line)] pt-4">
        <Button variant="ghost" onClick={onDone} disabled={save.isPending}>Cancel</Button>
        <Button type="submit" loading={save.isPending}>{technology ? 'Save changes' : 'Add technology'}</Button>
      </div>
    </form>
  )
}

export default function TechnologiesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [active, setActive] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null) // null | 'new' | technology
  const [toDelete, setToDelete] = useState(null)
  const debounced = useDebouncedValue(search)

  // Any filter change returns to the first page.
  const withReset = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const params = { search: debounced || undefined, category: category || undefined, active: active || undefined, page, per_page: 15 }
  const query = useQuery({ queryKey: queryKeys.admin.list('technologies', params), queryFn: () => adminApi.technologies.list(params), placeholderData: keepPreviousData })

  const patch = useAdminMutation('technologies', ({ id, values }) => adminApi.technologies.update(id, values))
  const remove = useAdminMutation('technologies', (id) => adminApi.technologies.remove(id), { onSuccess: () => setToDelete(null) })

  const columns = [
    {
      key: 'name',
      label: 'Technology',
      render: (t) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--line)] bg-ink-900"><TechIcon tech={t} className="h-4.5 w-4.5" /></span>
          <span className="font-medium text-fg">{t.name}</span>
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (t) => <span className="capitalize text-muted">{t.category}</span> },
    {
      key: 'proficiency',
      label: 'Level',
      render: (t) => <Badge tone={t.proficiency === 'advanced' ? 'ember' : t.proficiency === 'learning' ? 'signal' : 'neutral'}>{LEVELS[t.proficiency]?.label ?? t.proficiency}</Badge>,
    },
    { key: 'sort_order', label: 'Order', render: (t) => <span className="font-mono text-xs text-muted">{t.sort_order}</span> },
    {
      key: 'is_active',
      label: 'Visible',
      render: (t) => (
        <div className="flex items-center gap-2">
          <Switch checked={t.is_active} label={`Visible: ${t.name}`} disabled={patch.isPending} onChange={(v) => patch.mutate({ id: t.id, values: { is_active: v } })} />
          <span className="hidden xl:inline"><ActiveBadge active={t.is_active} /></span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'md:text-right',
      render: (t) => (
        <div className="inline-flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setEditing(t)} aria-label={`Edit ${t.name}`}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon-sm" className="hover:!text-danger-400" onClick={() => setToDelete(t)} aria-label={`Delete ${t.name}`}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Technologies"
        description="Skills shown in the technology ecosystem on the website."
        actions={<Button size="sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4" aria-hidden="true" /> Add technology</Button>}
      />
      <Toolbar>
        <SearchInput value={search} onChange={withReset(setSearch)} placeholder="Search technologies…" label="Search technologies" />
        <FilterSelect label="Category" value={category} onChange={withReset(setCategory)} options={[{ value: '', label: 'All categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))]} />
        <FilterSelect label="Visibility" value={active} onChange={withReset(setActive)} options={[{ value: '', label: 'Any visibility' }, { value: '1', label: 'Visible' }, { value: '0', label: 'Hidden' }]} />
      </Toolbar>
      <DataTable
        columns={columns}
        rows={query.data?.data ?? []}
        query={query}
        onPage={setPage}
        emptyTitle={debounced || category || active ? 'No technologies match these filters' : 'No technologies yet'}
        emptyDescription="Add the languages, frameworks and tools you work with."
      />

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add technology' : `Edit ${editing?.name ?? ''}`}>
        {editing && <TechnologyForm key={editing === 'new' ? 'new' : editing.id} technology={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete technology?"
        description={`"${toDelete?.name}" will be removed from the website.`}
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => remove.mutate(toDelete.id)}
      />
    </>
  )
}
