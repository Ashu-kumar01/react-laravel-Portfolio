import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { adminApi } from '../../api/admin'
import { fieldErrors } from '../../api/errors'
import { queryKeys } from '../../api/queryClient'
import { Button } from '../../components/ui/Button'
import { Field, Input, Textarea } from '../../components/ui/Field'
import { Skeleton } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/States'
import { env } from '../../config/env'
import { cn } from '../../utils/cn'
import { SingleImageInput } from '../components/ImageInput'
import { PageHeader } from '../components/PageHeader'
import { useAdminMutation } from '../hooks'

const LIMITS = { meta_title: 70, meta_description: 170, meta_keywords: 300 }

const schema = z.object({
  meta_title: z.string().trim().max(LIMITS.meta_title, `Max ${LIMITS.meta_title} characters.`),
  meta_description: z.string().trim().max(LIMITS.meta_description, `Max ${LIMITS.meta_description} characters.`),
  meta_keywords: z.string().trim().max(LIMITS.meta_keywords, `Max ${LIMITS.meta_keywords} characters.`),
  twitter_handle: z.string().trim().refine((v) => v === '' || /^@?[A-Za-z0-9_]{1,15}$/.test(v), 'Like @username (letters, numbers, _; max 15).'),
})

const toForm = (s = {}) => ({
  meta_title: s.meta_title ?? '',
  meta_description: s.meta_description ?? '',
  meta_keywords: s.meta_keywords ?? '',
  twitter_handle: s.twitter_handle ?? '',
})

function useObjectUrl(file) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => url && URL.revokeObjectURL(url), [url])
  return url
}

/** "42 / 70" counter that turns amber close to the limit. */
function Counter({ value = '', max }) {
  const n = value.length
  return <span className={cn('font-mono text-[11px]', n > max ? 'text-danger-400' : n > max * 0.9 ? 'text-amber-400' : 'text-subtle')}>{n} / {max}</span>
}

export default function SeoPage() {
  const query = useQuery({ queryKey: queryKeys.admin.settings, queryFn: adminApi.settings.get })

  if (query.isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-40" /><Skeleton className="h-96 rounded-2xl" /></div>
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />

  const settings = query.data?.data ?? {}
  return <SeoForm key={JSON.stringify(settings)} settings={settings} />
}

function SeoForm({ settings }) {
  const [image, setImage] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const previewUrl = useObjectUrl(image)

  const { register, control, handleSubmit, setError, formState: { errors, isDirty } } = useForm({ resolver: zodResolver(schema), defaultValues: toForm(settings) })
  const v = useWatch({ control })

  const save = useAdminMutation(
    'settings',
    async (values) => {
      const handle = values.twitter_handle ? `@${values.twitter_handle.replace(/^@/, '')}` : null
      // Image first so a rejected upload doesn't leave the text half-saved.
      if (image) await adminApi.settings.uploadImage('og_image', image)
      else if (removeImage) await adminApi.settings.removeImage('og_image')
      return adminApi.settings.update({
        meta_title: values.meta_title || null,
        meta_description: values.meta_description || null,
        meta_keywords: values.meta_keywords || null,
        twitter_handle: handle,
      })
    },
    {
      success: 'SEO settings saved',
      onError: (e) => {
        if (!e.isValidation) return
        const errs = Object.entries(fieldErrors(e))
        errs.forEach(([k, m]) => setError(k === 'image' ? 'og_image' : k, { message: m }))
        const imageError = errs.find(([k]) => k === 'image')
        toast.error(imageError ? `Image not saved: ${imageError[1]}` : 'Please fix the highlighted fields.')
      },
    },
  )

  const dirty = isDirty || Boolean(image) || removeImage
  const ogImage = previewUrl ?? (removeImage ? null : settings.og_image)
  const title = v.meta_title || settings.display_name || 'Your site title'
  const description = v.meta_description || 'Add a meta description so search engines show a helpful summary.'
  const host = (env.siteUrl || 'https://example.com').replace(/^https?:\/\//, '')

  return (
    <form noValidate onSubmit={handleSubmit((values) => save.mutate(values))}>
      <PageHeader
        title="SEO"
        description="How the site appears in Google and when a link is shared on WhatsApp, LinkedIn, X or Facebook."
        actions={<Button type="submit" size="sm" loading={save.isPending} disabled={!dirty}>Save SEO</Button>}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <section className="surface space-y-5 rounded-2xl p-5 sm:p-6">
            <h2 className="text-sm font-medium text-fg">Search engines</h2>
            <Field label="Meta title" hint={<span className="flex justify-between gap-3"><span>Home page title in Google and the browser tab. Aim for 50–60 characters.</span><Counter value={v.meta_title} max={LIMITS.meta_title} /></span>} error={errors.meta_title?.message}>
              {(a) => <Input {...a} error={errors.meta_title} {...register('meta_title')} />}
            </Field>
            <Field label="Meta description" hint={<span className="flex justify-between gap-3"><span>Summary under the title in search results. Aim for 140–160 characters.</span><Counter value={v.meta_description} max={LIMITS.meta_description} /></span>} error={errors.meta_description?.message}>
              {(a) => <Textarea {...a} rows={3} error={errors.meta_description} {...register('meta_description')} />}
            </Field>
            <Field label="Keywords" hint={<span className="flex justify-between gap-3"><span>Comma separated, e.g. Laravel Developer, React Developer, Raipur</span><Counter value={v.meta_keywords} max={LIMITS.meta_keywords} /></span>} error={errors.meta_keywords?.message}>
              {(a) => <Textarea {...a} rows={2} error={errors.meta_keywords} {...register('meta_keywords')} />}
            </Field>
          </section>

          <section className="surface space-y-5 rounded-2xl p-5 sm:p-6">
            <h2 className="text-sm font-medium text-fg">Social sharing</h2>
            <Field label="Share image (Open Graph)" hint="Shown when the site link is shared. 1200×630 px recommended · min 600×315 · JPG, PNG or WebP · max 4 MB" error={errors.og_image?.message}>
              {(a) => (
                <div className="max-w-md">
                  <SingleImageInput
                    id={a.id}
                    currentUrl={settings.og_image}
                    file={image}
                    removed={removeImage}
                    onFile={(f) => { setImage(f); if (f) setRemoveImage(false) }}
                    onRemove={() => setRemoveImage(true)}
                    onInvalid={(m) => toast.error(m)}
                    minWidth={600}
                    minHeight={315}
                    aspect="aspect-[1200/630]"
                    hint="1200×630 recommended"
                  />
                </div>
              )}
            </Field>
            <Field label="X / Twitter handle" hint="Optional, e.g. @ashwani_dev" error={errors.twitter_handle?.message}>
              {(a) => <Input {...a} placeholder="@username" className="max-w-xs" error={errors.twitter_handle} {...register('twitter_handle')} />}
            </Field>
          </section>

          <p className="text-xs leading-relaxed text-subtle">
            Changes apply to the website immediately. Link previews on WhatsApp, LinkedIn and Facebook read the HTML before JavaScript runs, so they pick up
            new values after the next frontend build (<code className="font-mono">npm run build</code>) and deploy.
          </p>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="surface rounded-2xl p-5">
            <h2 className="text-sm font-medium text-fg">Google preview</h2>
            <div className="mt-4 rounded-xl bg-white p-4 text-left font-[arial,sans-serif]">
              <p className="truncate text-[12px] text-[#202124]">{host}</p>
              <p className="mt-1 line-clamp-1 text-[18px] leading-snug text-[#1a0dab]">{title}</p>
              <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[#4d5156]">{description}</p>
            </div>
          </section>
          <section className="surface rounded-2xl p-5">
            <h2 className="text-sm font-medium text-fg">Share card preview</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-[var(--line)] bg-ink-900">
              <div className="aspect-[1200/630] bg-ink-800">
                {ogImage ? <img src={ogImage} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-subtle">No share image</div>}
              </div>
              <div className="space-y-1 p-3">
                <p className="text-[11px] uppercase text-subtle">{host}</p>
                <p className="line-clamp-1 text-sm font-medium text-fg">{title}</p>
                <p className="line-clamp-2 text-xs text-muted">{description}</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </form>
  )
}
