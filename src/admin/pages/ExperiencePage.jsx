import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { adminApi } from '../../api/admin'
import { fieldErrors } from '../../api/errors'
import { queryKeys } from '../../api/queryClient'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Field, Input, Select, Switch, Textarea } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { cn } from '../../utils/cn'
import { formatPeriod } from '../../utils/format'
import { DataTable, SearchInput, Toolbar } from '../components/DataTable'
import { ListEditor } from '../components/ListEditor'
import { PageHeader } from '../components/PageHeader'
import { useAdminMutation, useDebouncedValue } from '../hooks'

const schema = z
  .object({
    type: z.enum(['work', 'education']),
    company: z.string().trim().min(1, 'Company is required.').max(160),
    position: z.string().trim().min(1, 'Position is required.').max(160),
    location: z.string().trim().max(160),
    employment_type: z.string().trim().max(40),
    start_date: z.string().min(1, 'Start date is required.'),
    end_date: z.string(),
    is_current: z.boolean(),
    description: z.string().max(3000),
    responsibilities: z.array(z.string()).max(20),
    technologies: z.array(z.string()).max(30),
    sort_order: z.coerce.number().int().min(0).max(100000),
  })
  .refine((v) => v.is_current || !v.end_date || v.end_date >= v.start_date, { path: ['end_date'], message: 'End date must be on or after the start date.' })

const EMPTY = { type: 'work', company: '', position: '', location: '', employment_type: '', start_date: '', end_date: '', is_current: false, description: '', responsibilities: [], technologies: [], sort_order: 0 }

function ExperienceForm({ experience, defaultType = 'work', onDone }) {
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: experience ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, experience[k] ?? EMPTY[k]])) : { ...EMPTY, type: defaultType },
  })
  const isCurrent = useWatch({ control, name: 'is_current' })
  const isEducation = useWatch({ control, name: 'type' }) === 'education'

  const save = useAdminMutation(
    'experiences',
    (values) => (experience ? adminApi.experiences.update(experience.id, values) : adminApi.experiences.create(values)),
    {
      success: experience ? 'Experience updated' : 'Experience added',
      onSuccess: onDone,
      onError: (e) => e.isValidation && Object.entries(fieldErrors(e)).forEach(([k, m]) => setError(k, { message: m })),
    },
  )

  const submit = (v) => save.mutate({ ...v, end_date: v.is_current || !v.end_date ? null : v.end_date, location: v.location || null, employment_type: v.employment_type || null, description: v.description || null })

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type" className="sm:col-span-2">
          {(a) => (
            <Select {...a} {...register('type')}>
              <option value="work">Work experience (timeline)</option>
              <option value="education">Education</option>
            </Select>
          )}
        </Field>
        <Field label={isEducation ? 'Institution' : 'Company'} required error={errors.company?.message}>{(a) => <Input {...a} data-autofocus error={errors.company} {...register('company')} />}</Field>
        <Field label={isEducation ? 'Degree / class' : 'Position'} required error={errors.position?.message}>{(a) => <Input {...a} error={errors.position} {...register('position')} />}</Field>
        <Field label="Location" error={errors.location?.message}>{(a) => <Input {...a} error={errors.location} {...register('location')} />}</Field>
        <Field label="Employment type" hint="e.g. Full-time, Freelance" error={errors.employment_type?.message}>{(a) => <Input {...a} error={errors.employment_type} {...register('employment_type')} />}</Field>
        <Field label="Start date" required error={errors.start_date?.message}>{(a) => <Input {...a} type="date" error={errors.start_date} {...register('start_date')} />}</Field>
        <Field label="End date" error={errors.end_date?.message}>{(a) => <Input {...a} type="date" disabled={isCurrent} error={errors.end_date} {...register('end_date')} />}</Field>
      </div>
      <Controller
        control={control}
        name="is_current"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3">
            <label htmlFor="exp-current" className="text-sm font-medium text-fg">I currently work here</label>
            <Switch id="exp-current" checked={field.value} onChange={field.onChange} label="Current role" />
          </div>
        )}
      />
      <Field label={isEducation ? 'Result / notes' : 'Description'} hint={isEducation ? 'e.g. CGPA: 7.4 / 10' : undefined} error={errors.description?.message}>{(a) => <Textarea {...a} rows={3} error={errors.description} {...register('description')} />}</Field>
      <Field label="Responsibilities" error={errors.responsibilities?.message}>
        {(a) => <Controller control={control} name="responsibilities" render={({ field }) => <ListEditor {...a} value={field.value} onChange={field.onChange} placeholder="Add a responsibility and press Enter" />} />}
      </Field>
      <Field label="Technologies" error={errors.technologies?.message}>
        {(a) => <Controller control={control} name="technologies" render={({ field }) => <ListEditor {...a} value={field.value} onChange={field.onChange} />} />}
      </Field>
      <Field label="Sort order" hint="Lower numbers appear first" error={errors.sort_order?.message} className="max-w-[160px]">
        {(a) => <Input {...a} type="number" min={0} error={errors.sort_order} {...register('sort_order')} />}
      </Field>
      <div className="flex justify-end gap-2 border-t border-[var(--line)] pt-4">
        <Button variant="ghost" onClick={onDone} disabled={save.isPending}>Cancel</Button>
        <Button type="submit" loading={save.isPending}>{experience ? 'Save changes' : 'Add experience'}</Button>
      </div>
    </form>
  )
}

export default function ExperiencePage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('work')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const debounced = useDebouncedValue(search)
  const params = { search: debounced || undefined, type, page }
  const query = useQuery({ queryKey: queryKeys.admin.list('experiences', params), queryFn: () => adminApi.experiences.list(params), placeholderData: keepPreviousData })
  const remove = useAdminMutation('experiences', (id) => adminApi.experiences.remove(id), { onSuccess: () => setToDelete(null) })

  const columns = [
    { key: 'position', label: type === 'education' ? 'Qualification' : 'Role', render: (e) => <div><p className="font-medium text-fg">{e.position}</p><p className="text-xs text-muted">{e.company}</p></div> },
    { key: 'period', label: 'Period', render: (e) => <span className="font-mono text-xs text-muted">{formatPeriod(e.start_date, e.end_date, e.is_current)}</span> },
    { key: 'status', label: 'Status', render: (e) => (e.type === 'education' ? <Badge tone="signal">Education</Badge> : e.is_current ? <Badge tone="mint">Current</Badge> : <Badge>Past</Badge>) },
    { key: 'sort_order', label: 'Order', render: (e) => <span className="font-mono text-xs text-muted">{e.sort_order}</span> },
    {
      key: 'actions',
      label: 'Actions',
      className: 'md:text-right',
      render: (e) => (
        <div className="inline-flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setEditing(e)} aria-label={`Edit ${e.position}`}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon-sm" className="hover:!text-danger-400" onClick={() => setToDelete(e)} aria-label={`Delete ${e.position}`}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Experience & education" description="Work entries build the experience timeline; education entries appear in the education section." actions={<Button size="sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4" aria-hidden="true" /> {type === 'education' ? 'Add education' : 'Add experience'}</Button>} />
      <div role="tablist" aria-label="Entry type" className="mb-4 flex gap-1 border-b border-[var(--line)]">
        {[['work', 'Work experience'], ['education', 'Education']].map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={type === key} onClick={() => { setType(key); setPage(1) }} className={cn('-mb-px border-b-2 px-3 py-2.5 text-sm transition', type === key ? 'border-ember-500 text-fg' : 'border-transparent text-muted hover:text-fg')}>{label}</button>
        ))}
      </div>
      <Toolbar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search company or role…" label="Search experience" />
      </Toolbar>
      <DataTable columns={columns} rows={query.data?.data ?? []} query={query} onPage={setPage} emptyTitle="No experience entries" emptyDescription="Add roles to build your timeline." />
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? (type === 'education' ? 'Add education' : 'Add experience') : 'Edit entry'} size="lg">
        {editing && <ExperienceForm key={editing === 'new' ? 'new' : editing.id} experience={editing === 'new' ? null : editing} defaultType={type} onDone={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog open={Boolean(toDelete)} title="Delete experience?" description={`"${toDelete?.position} at ${toDelete?.company}" will be removed from the timeline.`} loading={remove.isPending} onCancel={() => setToDelete(null)} onConfirm={() => remove.mutate(toDelete.id)} />
    </>
  )
}
