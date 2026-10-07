import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { adminApi } from '../../api/admin'
import { fieldErrors } from '../../api/errors'
import { portfolioApi } from '../../api/portfolio'
import { queryKeys } from '../../api/queryClient'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Switch, Textarea } from '../../components/ui/Field'
import { Skeleton } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/States'
import { GalleryInput, SingleImageInput } from '../components/ImageInput'
import { ListEditor } from '../components/ListEditor'
import { PageHeader } from '../components/PageHeader'
import { useAdminMutation } from '../hooks'

const optionalUrl = (protocols) =>
  z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === '' || protocols.some((p) => v.startsWith(`${p}://`)), `Must start with ${protocols.join(' or ')}://`)
    .refine((v) => v === '' || URL.canParse(v), 'Enter a valid URL.')

const schema = z
  .object({
    title: z.string().trim().min(1, 'Title is required.').max(160),
    slug: z.string().trim().max(180).regex(/^[a-z0-9-_]*$/i, 'Only letters, numbers, dashes and underscores.'),
    short_description: z.string().trim().min(1, 'A short description is required.').max(300),
    description: z.string().max(20000),
    category: z.string().trim().min(1, 'Category is required.').max(80),
    client: z.string().trim().max(160),
    role: z.string().trim().max(160),
    technologies: z.array(z.string()).max(30),
    features: z.array(z.string()).max(30),
    live_url: optionalUrl(['http', 'https']),
    show_demo: z.boolean(),
    github_url: optionalUrl(['https']),
    start_date: z.string(),
    end_date: z.string(),
    status: z.enum(['draft', 'published']),
    featured: z.boolean(),
    sort_order: z.coerce.number().int().min(0, 'Must be 0 or more.').max(100000),
  })
  .refine((v) => !v.start_date || !v.end_date || v.end_date >= v.start_date, { path: ['end_date'], message: 'End date must be on or after the start date.' })
  .refine((v) => !v.show_demo || v.live_url !== '', { path: ['live_url'], message: 'Enter the demo link, or turn off "Show View demo".' })

const EMPTY = {
  title: '', slug: '', short_description: '', description: '', category: '', client: '', role: 'Full-Stack Developer',
  technologies: [], features: [], live_url: '', show_demo: false, github_url: '', start_date: '', end_date: '',
  status: 'draft', featured: false, sort_order: 0,
}

const fromProject = (p) => ({
  ...EMPTY,
  ...Object.fromEntries(Object.entries(p).filter(([k]) => k in EMPTY).map(([k, v]) => [k, v ?? EMPTY[k]])),
})

/** Loads the project (edit mode) and mounts a fresh form for each saved version. */
export default function ProjectFormPage() {
  const { id } = useParams()
  const projectQuery = useQuery({ queryKey: queryKeys.admin.item('projects', id), queryFn: () => adminApi.projects.get(id), enabled: Boolean(id) })

  if (id && projectQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }
  if (id && projectQuery.isError) return <ErrorState error={projectQuery.error} onRetry={projectQuery.refetch} />

  const project = id ? projectQuery.data?.data : null
  return <ProjectForm key={project ? `${project.id}-${project.updated_at}` : 'new'} project={project} />
}

function ProjectForm({ project }) {
  const isEdit = Boolean(project)
  const id = project?.id
  const navigate = useNavigate()

  const techQuery = useQuery({ queryKey: queryKeys.technologies, queryFn: portfolioApi.technologies, staleTime: 5 * 60_000 })
  const categoriesQuery = useQuery({ queryKey: queryKeys.admin.list('projects', { per_page: 1 }), queryFn: () => adminApi.projects.list({ per_page: 1 }) })

  const [image, setImage] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [keepGallery, setKeepGallery] = useState(() => project?.gallery.map((g) => g.path) ?? [])

  const { register, control, handleSubmit, setError, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: project ? fromProject(project) : EMPTY,
  })
  const showDemo = useWatch({ control, name: 'show_demo' })

  const save = useAdminMutation(
    'projects',
    (values) => (isEdit ? adminApi.projects.update(id, values) : adminApi.projects.create(values)),
    {
      success: isEdit ? 'Project updated' : 'Project created',
      onSuccess: (res) => {
        setImage(null)
        setGalleryFiles([])
        if (!isEdit) navigate(`/admin/projects/${res.data.id}/edit`, { replace: true })
      },
      onError: (error) => {
        if (!error.isValidation) return
        const errs = fieldErrors(error)
        Object.entries(errs).forEach(([field, message]) => {
          const key = field.startsWith('gallery') ? 'gallery' : field
          setError(key, { message })
        })
        toast.error('Please fix the highlighted fields.')
      },
    },
  )

  const onSubmit = (values) => {
    const payload = {
      ...values,
      slug: values.slug || undefined,
      featured_image: image ?? undefined,
      gallery: galleryFiles.length ? galleryFiles : undefined,
    }
    if (isEdit) {
      payload.keep_gallery = keepGallery
      if (removeImage && !image) payload.remove_featured_image = true
    }
    save.mutate(payload)
  }

  const techSuggestions = (techQuery.data?.data ?? []).map((t) => t.name)
  const categories = categoriesQuery.data?.meta?.categories ?? []

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <PageHeader
        title={isEdit ? `Edit: ${project?.title ?? ''}` : 'New project'}
        description={isEdit ? 'Update details, media and visibility.' : 'Add a project to your portfolio.'}
        actions={
          <>
            <Button to="/admin/projects" variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back</Button>
            <Button type="submit" size="sm" loading={save.isPending}><Save className="h-4 w-4" aria-hidden="true" /> {isEdit ? 'Save changes' : 'Create project'}</Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="surface space-y-5 rounded-2xl p-5 sm:p-6">
            <h2 className="text-sm font-medium text-fg">Details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Title" required error={errors.title?.message} className="sm:col-span-2">
                {(a) => <Input {...a} error={errors.title} {...register('title')} />}
              </Field>
              <Field label="Slug" hint="Leave empty to generate from the title" error={errors.slug?.message}>
                {(a) => <Input {...a} placeholder="auto" error={errors.slug} {...register('slug')} />}
              </Field>
              <Field label="Category" required error={errors.category?.message}>
                {(a) => (
                  <>
                    <Input {...a} list="project-categories" error={errors.category} {...register('category')} />
                    <datalist id="project-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                  </>
                )}
              </Field>
              <Field label="Client" error={errors.client?.message}>
                {(a) => <Input {...a} error={errors.client} {...register('client')} />}
              </Field>
              <Field label="My role" error={errors.role?.message}>
                {(a) => <Input {...a} error={errors.role} {...register('role')} />}
              </Field>
              <Field label="Short description" required hint="Shown on project cards (max 300 characters)" error={errors.short_description?.message} className="sm:col-span-2">
                {(a) => <Textarea {...a} rows={2} error={errors.short_description} {...register('short_description')} />}
              </Field>
              <Field label="Description" hint="Separate paragraphs with a blank line" error={errors.description?.message} className="sm:col-span-2">
                {(a) => <Textarea {...a} rows={7} error={errors.description} {...register('description')} />}
              </Field>
            </div>
          </section>

          <section className="surface space-y-5 rounded-2xl p-5 sm:p-6">
            <h2 className="text-sm font-medium text-fg">Stack & features</h2>
            <Field label="Technologies" error={errors.technologies?.message}>
              {(a) => <Controller control={control} name="technologies" render={({ field }) => <ListEditor {...a} value={field.value} onChange={field.onChange} suggestions={techSuggestions} invalid={Boolean(errors.technologies)} />} />}
            </Field>
            <Field label="Key features" error={errors.features?.message}>
              {(a) => <Controller control={control} name="features" render={({ field }) => <ListEditor {...a} value={field.value} onChange={field.onChange} placeholder="Describe a feature and press Enter" invalid={Boolean(errors.features)} />} />}
            </Field>
          </section>

          <section className="surface space-y-5 rounded-2xl p-5 sm:p-6">
            <h2 className="text-sm font-medium text-fg">Gallery</h2>
            <Field error={errors.gallery?.message}>
              {(a) => (
                <GalleryInput
                  id={a.id}
                  existing={project?.gallery ?? []}
                  keep={keepGallery}
                  onKeepChange={setKeepGallery}
                  files={galleryFiles}
                  onFilesChange={setGalleryFiles}
                  onInvalid={(m) => toast.error(m)}
                />
              )}
            </Field>
          </section>
        </div>

        <div className="space-y-4">
          <section className="surface space-y-3 rounded-2xl p-5">
            <h2 className="text-sm font-medium text-fg">Project image</h2>
            <p className="text-xs text-subtle">Cover shown on project cards, the project page and link previews.</p>
            <Field error={errors.featured_image?.message} hint="JPG, PNG or WebP · min 400×225 · max 4 MB">
              {(a) => (
                <SingleImageInput
                  id={a.id}
                  currentUrl={project?.featured_image}
                  file={image}
                  removed={removeImage}
                  onFile={(f) => { setImage(f); if (f) setRemoveImage(false) }}
                  onRemove={() => setRemoveImage(true)}
                  onInvalid={(m) => toast.error(m)}
                  hint="Recommended 1600×900"
                />
              )}
            </Field>
          </section>

          <section className="surface space-y-5 rounded-2xl p-5">
            <h2 className="text-sm font-medium text-fg">Visibility</h2>
            <Field label="Status" error={errors.status?.message}>
              {(a) => (
                <Select {...a} error={errors.status} {...register('status')}>
                  <option value="draft">Draft (hidden)</option>
                  <option value="published">Published</option>
                </Select>
              )}
            </Field>
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="featured-switch" className="text-[13px] font-medium text-fg/90">Featured on home page</label>
                  <Switch id="featured-switch" checked={field.value} onChange={field.onChange} label="Featured" />
                </div>
              )}
            />
            <Field label="Sort order" hint="Lower numbers appear first" error={errors.sort_order?.message}>
              {(a) => <Input {...a} type="number" min={0} error={errors.sort_order} {...register('sort_order')} />}
            </Field>
          </section>

          <section className="surface space-y-5 rounded-2xl p-5">
            <h2 className="text-sm font-medium text-fg">View demo</h2>
            <Controller
              control={control}
              name="show_demo"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="show-demo-switch" className="text-[13px] font-medium text-fg/90">Show “View demo” button</label>
                  <Switch id="show-demo-switch" checked={field.value} onChange={field.onChange} label="Show View demo button" />
                </div>
              )}
            />
            {showDemo ? (
              <Field label="Demo link" required hint="Opens in a new tab from the project page" error={errors.live_url?.message}>
                {(a) => <Input {...a} type="url" placeholder="https://" error={errors.live_url} {...register('live_url')} />}
              </Field>
            ) : (
              <p className="text-xs text-subtle">Hidden on the website. Turn it on to add the demo link.</p>
            )}
          </section>

          <section className="surface space-y-5 rounded-2xl p-5">
            <h2 className="text-sm font-medium text-fg">Links & timeline</h2>
            <Field label="GitHub URL" error={errors.github_url?.message}>
              {(a) => <Input {...a} type="url" placeholder="https://github.com/…" error={errors.github_url} {...register('github_url')} />}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date" error={errors.start_date?.message}>
                {(a) => <Input {...a} type="date" error={errors.start_date} {...register('start_date')} />}
              </Field>
              <Field label="End date" error={errors.end_date?.message}>
                {(a) => <Input {...a} type="date" error={errors.end_date} {...register('end_date')} />}
              </Field>
            </div>
          </section>
        </div>
      </div>

      {isDirty && (
        <p className="mt-4 text-right text-xs text-subtle">You have unsaved changes.</p>
      )}
    </form>
  )
}
