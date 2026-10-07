import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Code, Pencil, Plus, Trash2 } from 'lucide-react'
import { adminApi } from '../../api/admin'
import { fieldErrors } from '../../api/errors'
import { queryKeys } from '../../api/queryClient'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Field, Input, Switch, Textarea } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { SERVICE_ICONS } from '../../sections/Services'
import { cn } from '../../utils/cn'
import { DataTable, FilterSelect, SearchInput, Toolbar } from '../components/DataTable'
import { ListEditor } from '../components/ListEditor'
import { PageHeader } from '../components/PageHeader'
import { useAdminMutation, useDebouncedValue } from '../hooks'

const ICON_KEYS = Object.keys(SERVICE_ICONS)

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(120),
  short_description: z.string().trim().min(1, 'A short description is required.').max(300),
  description: z.string().max(5000),
  icon: z.enum(ICON_KEYS),
  features: z.array(z.string()).max(20),
  sort_order: z.coerce.number().int().min(0).max(100000),
  is_active: z.boolean(),
})

const EMPTY = { title: '', short_description: '', description: '', icon: 'code', features: [], sort_order: 0, is_active: true }

function ServiceForm({ service, onDone }) {
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: service ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, service[k] ?? EMPTY[k]])) : EMPTY,
  })
  const save = useAdminMutation(
    'services',
    (values) => (service ? adminApi.services.update(service.id, values) : adminApi.services.create(values)),
    {
      success: service ? 'Service updated' : 'Service added',
      onSuccess: onDone,
      onError: (e) => e.isValidation && Object.entries(fieldErrors(e)).forEach(([k, m]) => setError(k, { message: m })),
    },
  )

  return (
    <form noValidate onSubmit={handleSubmit((v) => save.mutate({ ...v, description: v.description || null }))} className="space-y-5">
      <Field label="Title" required error={errors.title?.message}>{(a) => <Input {...a} data-autofocus error={errors.title} {...register('title')} />}</Field>
      <Field label="Short description" required error={errors.short_description?.message}>{(a) => <Textarea {...a} rows={2} error={errors.short_description} {...register('short_description')} />}</Field>
      <Field label="Details" hint="Optional longer description" error={errors.description?.message}>{(a) => <Textarea {...a} rows={3} error={errors.description} {...register('description')} />}</Field>
      <Controller
        control={control}
        name="icon"
        render={({ field }) => (
          <fieldset>
            <legend className="mb-2 text-[13px] font-medium text-fg/90">Icon</legend>
            <div className="flex flex-wrap gap-2">
              {ICON_KEYS.map((key) => {
                const Icon = SERVICE_ICONS[key]
                return (
                  <label key={key} className={cn('grid h-10 w-10 cursor-pointer place-items-center rounded-xl border transition', field.value === key ? 'border-ember-500/60 bg-ember-500/10 text-ember-300' : 'border-[var(--line)] text-muted hover:text-fg')} title={key}>
                    <input type="radio" name="icon" value={key} checked={field.value === key} onChange={() => field.onChange(key)} className="sr-only" />
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                    <span className="sr-only">{key}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )}
      />
      <Field label="Features" error={errors.features?.message}>
        {(a) => <Controller control={control} name="features" render={({ field }) => <ListEditor {...a} value={field.value} onChange={field.onChange} placeholder="Add a feature and press Enter" />} />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Sort order" error={errors.sort_order?.message}>{(a) => <Input {...a} type="number" min={0} error={errors.sort_order} {...register('sort_order')} />}</Field>
        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3 sm:mt-6">
              <label htmlFor="svc-active" className="text-sm font-medium text-fg">Active</label>
              <Switch id="svc-active" checked={field.value} onChange={field.onChange} label="Active" />
            </div>
          )}
        />
      </div>
      <div className="flex justify-end gap-2 border-t border-[var(--line)] pt-4">
        <Button variant="ghost" onClick={onDone} disabled={save.isPending}>Cancel</Button>
        <Button type="submit" loading={save.isPending}>{service ? 'Save changes' : 'Add service'}</Button>
      </div>
    </form>
  )
}

export default function ServicesPage() {
  const [search, setSearch] = useState('')
  const [active, setActive] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const debounced = useDebouncedValue(search)
  const params = { search: debounced || undefined, active: active || undefined, page }
  const query = useQuery({ queryKey: queryKeys.admin.list('services', params), queryFn: () => adminApi.services.list(params), placeholderData: keepPreviousData })
  const patch = useAdminMutation('services', ({ id, values }) => adminApi.services.patch(id, values))
  const remove = useAdminMutation('services', (id) => adminApi.services.remove(id), { onSuccess: () => setToDelete(null) })

  const columns = [
    {
      key: 'title',
      label: 'Service',
      render: (s) => {
        const Icon = SERVICE_ICONS[s.icon] ?? Code
        return (
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--line)] bg-ink-900 text-ember-400"><Icon className="h-4 w-4" aria-hidden="true" /></span>
            <div className="min-w-0"><p className="font-medium text-fg">{s.title}</p><p className="line-clamp-1 max-w-md text-xs text-muted">{s.short_description}</p></div>
          </div>
        )
      },
    },
    { key: 'sort_order', label: 'Order', render: (s) => <span className="font-mono text-xs text-muted">{s.sort_order}</span> },
    { key: 'is_active', label: 'Active', render: (s) => <Switch checked={s.is_active} label={`Active: ${s.title}`} disabled={patch.isPending} onChange={(v) => patch.mutate({ id: s.id, values: { is_active: v } })} /> },
    {
      key: 'actions',
      label: 'Actions',
      className: 'md:text-right',
      render: (s) => (
        <div className="inline-flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setEditing(s)} aria-label={`Edit ${s.title}`}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon-sm" className="hover:!text-danger-400" onClick={() => setToDelete(s)} aria-label={`Delete ${s.title}`}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Services" description="What you offer, shown in the services section." actions={<Button size="sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4" aria-hidden="true" /> Add service</Button>} />
      <Toolbar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search services…" label="Search services" />
        <FilterSelect label="Status" value={active} onChange={(v) => { setActive(v); setPage(1) }} options={[{ value: '', label: 'All' }, { value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }]} />
      </Toolbar>
      <DataTable columns={columns} rows={query.data?.data ?? []} query={query} onPage={setPage} emptyTitle="No services" emptyDescription="Add the services you offer." />
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add service' : 'Edit service'} size="lg">
        {editing && <ServiceForm key={editing === 'new' ? 'new' : editing.id} service={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog open={Boolean(toDelete)} title="Delete service?" description={`"${toDelete?.title}" will be removed from the website.`} loading={remove.isPending} onCancel={() => setToDelete(null)} onConfirm={() => remove.mutate(toDelete.id)} />
    </>
  )
}
