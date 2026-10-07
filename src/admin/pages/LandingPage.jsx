import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { adminApi } from '../../api/admin'
// The preview falls back to the same bundled portrait the website uses.
import fallbackPortrait from '../../assets/portrait.png'
import { fieldErrors } from '../../api/errors'
import { queryKeys } from '../../api/queryClient'
import { SvgBrand } from '../../components/common/BrandIcon'
import { BRAND_OPTIONS } from '../../components/common/brands'
import { HeroPortrait } from '../../components/Hero/HeroPortrait'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { Skeleton } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/States'
import { HERO } from '../../config/hero'
import { cn } from '../../utils/cn'
import { SingleImageInput } from '../components/ImageInput'
import { PageHeader } from '../components/PageHeader'
import { useAdminMutation } from '../hooks'

const MAX_BADGES = 12
const MAX_FLOATING = 4
const MAX_BUBBLES = 4

const text = (max) => z.string().trim().max(max, `Max ${max} characters.`)

const schema = z.object({
  hero_eyebrow: text(60),
  hero_name: text(120),
  hero_role: text(120),
  hero_summary: text(300),
  hero_badges: z.array(z.object({ label: text(40).min(1, 'Label is required.'), icon: z.string() })).max(MAX_BADGES),
  hero_floating_badges: z.array(z.object({ value: text(20), label: text(60).min(1, 'Label is required.') })).max(MAX_FLOATING),
  hero_tech_bubbles: z.array(z.string()).max(MAX_BUBBLES),
})

/** Settings → form values. Unset lists start from the defaults the website currently shows. */
const toForm = (s = {}) => ({
  hero_eyebrow: s.hero_eyebrow ?? '',
  hero_name: s.hero_name ?? '',
  hero_role: s.hero_role ?? '',
  hero_summary: s.hero_summary ?? '',
  hero_badges: (s.hero_badges ?? HERO.badges).map((b) => ({ label: b.label ?? '', icon: b.icon ?? '' })),
  hero_floating_badges: (s.hero_floating_badges ?? HERO.floatingBadges).map((b) => ({ value: b.value ?? '', label: b.label ?? '' })),
  hero_tech_bubbles: s.hero_tech_bubbles ?? HERO.bubbles,
})

/** Form values → API payload: empty strings are stored as "unset" (null). */
const toPayload = (v) => ({
  hero_eyebrow: v.hero_eyebrow || null,
  hero_name: v.hero_name || null,
  hero_role: v.hero_role || null,
  hero_summary: v.hero_summary || null,
  hero_badges: v.hero_badges.map((b) => ({ label: b.label, icon: b.icon || null })),
  hero_floating_badges: v.hero_floating_badges.map((b) => ({ value: b.value || null, label: b.label })),
  hero_tech_bubbles: v.hero_tech_bubbles,
})

function useObjectUrl(file) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => url && URL.revokeObjectURL(url), [url])
  return url
}

function Section({ title, description, children, className }) {
  return (
    <section className={cn('surface space-y-5 rounded-2xl p-5 sm:p-6', className)}>
      <div>
        <h2 className="text-sm font-medium text-fg">{title}</h2>
        {description && <p className="mt-1 text-xs text-subtle">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function RowActions({ index, count, onMove, onRemove, label }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button size="icon-sm" variant="ghost" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Move ${label} up`}>
        <ArrowUp className="h-3.5 w-3.5" />
      </Button>
      <Button size="icon-sm" variant="ghost" disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label={`Move ${label} down`}>
        <ArrowDown className="h-3.5 w-3.5" />
      </Button>
      <Button size="icon-sm" variant="ghost" onClick={() => onRemove(index)} aria-label={`Remove ${label}`} className="text-danger-400">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

export default function LandingPage() {
  const query = useQuery({ queryKey: queryKeys.admin.settings, queryFn: adminApi.settings.get })

  if (query.isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-56" /><Skeleton className="h-[32rem] rounded-2xl" /></div>
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />

  const settings = query.data?.data ?? {}
  // Re-mount after every save so the form starts from what the server stored.
  return <LandingForm key={JSON.stringify(settings)} settings={settings} />
}

function LandingForm({ settings }) {
  const [image, setImage] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const previewUrl = useObjectUrl(image)

  const { register, control, handleSubmit, setValue, setError, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: toForm(settings),
  })
  const badges = useFieldArray({ control, name: 'hero_badges' })
  const floating = useFieldArray({ control, name: 'hero_floating_badges' })
  const watched = useWatch({ control })
  const bubbles = watched.hero_tech_bubbles ?? []

  const save = useAdminMutation(
    'settings',
    // Image first: if the upload is rejected nothing else is saved, so the page never ends up half-updated.
    async (values) => {
      if (image) await adminApi.settings.uploadImage('hero_image', image)
      else if (removeImage) await adminApi.settings.removeImage('hero_image')
      return adminApi.settings.update(toPayload(values))
    },
    {
      success: 'Landing section saved',
      onError: (e) => {
        if (!e.isValidation) return
        const errs = Object.entries(fieldErrors(e))
        errs.forEach(([k, m]) => setError(k === 'image' ? 'hero_image' : k, { message: m }))
        const imageError = errs.find(([k]) => k === 'image')
        toast.error(imageError ? `Image not saved: ${imageError[1]}` : 'Please fix the highlighted fields.')
      },
    },
  )

  const toggleBubble = (slug) => {
    const next = bubbles.includes(slug) ? bubbles.filter((s) => s !== slug) : [...bubbles, slug]
    if (next.length > MAX_BUBBLES) return toast.error(`Choose up to ${MAX_BUBBLES} icons.`)
    setValue('hero_tech_bubbles', next, { shouldDirty: true })
  }

  const dirty = isDirty || Boolean(image) || removeImage
  const shownImage = previewUrl ?? (removeImage ? null : settings.hero_image)

  return (
    <form noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
      <PageHeader
        title="Landing section"
        description="The first screen of the home page: text, portrait image and badges."
        actions={<Button type="submit" size="sm" loading={save.isPending} disabled={!dirty}>Save changes</Button>}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <Section title="Text" description="Leave a field empty to use the default shown as placeholder.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Small label" error={errors.hero_eyebrow?.message}>
                {(a) => <Input {...a} placeholder={HERO.eyebrow} error={errors.hero_eyebrow} {...register('hero_eyebrow')} />}
              </Field>
              <Field label="Name" error={errors.hero_name?.message}>
                {(a) => <Input {...a} placeholder={HERO.name} error={errors.hero_name} {...register('hero_name')} />}
              </Field>
              <Field label="Role (second line)" error={errors.hero_role?.message} className="sm:col-span-2">
                {(a) => <Input {...a} placeholder={HERO.role} error={errors.hero_role} {...register('hero_role')} />}
              </Field>
              <Field label="Supporting text" hint="Up to 300 characters" error={errors.hero_summary?.message} className="sm:col-span-2">
                {(a) => <Textarea {...a} rows={3} placeholder={HERO.summary} error={errors.hero_summary} {...register('hero_summary')} />}
              </Field>
            </div>
          </Section>

          <Section title="Portrait image" description="Best: a transparent PNG cut-out (no background), at least 800×800 px. JPG/WebP also work.">
            <Field error={errors.hero_image?.message} hint="JPG, PNG or WebP · min 200×200 · max 4 MB">
              {(a) => (
                <div className="max-w-xs">
                  <SingleImageInput
                    id={a.id}
                    currentUrl={settings.hero_image}
                    file={image}
                    removed={removeImage}
                    onFile={(f) => { setImage(f); if (f) setRemoveImage(false) }}
                    onRemove={() => setRemoveImage(true)}
                    onInvalid={(m) => toast.error(m)}
                    minWidth={200}
                    minHeight={200}
                    aspect="aspect-square"
                    fit="contain"
                    hint="Transparent PNG recommended"
                  />
                </div>
              )}
            </Field>
            {!shownImage && <p className="text-xs text-subtle">No image uploaded: the website shows the built-in portrait.</p>}
          </Section>

          <Section title="Technology badges" description={`Glass badges under the text (max ${MAX_BADGES}). Pick an icon or leave it as text only.`}>
            <ul className="space-y-2.5">
              {badges.fields.map((field, i) => (
                <li key={field.id} className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line)]" aria-hidden="true">
                    {watched.hero_badges?.[i]?.icon ? <SvgBrand slug={watched.hero_badges[i].icon} colored decorative className="h-4 w-4" /> : <span className="text-xs text-subtle">—</span>}
                  </div>
                  <Field error={errors.hero_badges?.[i]?.label?.message} className="min-w-0 flex-1">
                    {(a) => <Input {...a} aria-label={`Badge ${i + 1} label`} placeholder="Label, e.g. React.js" error={errors.hero_badges?.[i]?.label} {...register(`hero_badges.${i}.label`)} />}
                  </Field>
                  <Select aria-label={`Badge ${i + 1} icon`} className="w-full sm:w-44" {...register(`hero_badges.${i}.icon`)}>
                    <option value="">No icon</option>
                    {BRAND_OPTIONS.map((o) => <option key={o.slug} value={o.slug}>{o.title}</option>)}
                  </Select>
                  <RowActions index={i} count={badges.fields.length} onMove={badges.move} onRemove={badges.remove} label={`badge ${i + 1}`} />
                </li>
              ))}
            </ul>
            <Button variant="secondary" size="sm" disabled={badges.fields.length >= MAX_BADGES} onClick={() => badges.append({ label: '', icon: '' })}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add badge
            </Button>
          </Section>

          <Section title="Badges around the photo" description={`Up to ${MAX_FLOATING}. With a value (e.g. "3.8+") the badge shows as a stat card; without, as a pill with a dot.`}>
            <ul className="space-y-2.5">
              {floating.fields.map((field, i) => (
                <li key={field.id} className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
                  <Field error={errors.hero_floating_badges?.[i]?.value?.message} className="w-full sm:w-28">
                    {(a) => <Input {...a} aria-label={`Photo badge ${i + 1} value`} placeholder="Value" error={errors.hero_floating_badges?.[i]?.value} {...register(`hero_floating_badges.${i}.value`)} />}
                  </Field>
                  <Field error={errors.hero_floating_badges?.[i]?.label?.message} className="min-w-0 flex-1">
                    {(a) => <Input {...a} aria-label={`Photo badge ${i + 1} label`} placeholder="Label, e.g. Years of experience" error={errors.hero_floating_badges?.[i]?.label} {...register(`hero_floating_badges.${i}.label`)} />}
                  </Field>
                  <RowActions index={i} count={floating.fields.length} onMove={floating.move} onRemove={floating.remove} label={`photo badge ${i + 1}`} />
                </li>
              ))}
            </ul>
            <Button variant="secondary" size="sm" disabled={floating.fields.length >= MAX_FLOATING} onClick={() => floating.append({ value: '', label: '' })}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add photo badge
            </Button>
          </Section>

          <Section title="Technology icons around the photo" description={`Choose up to ${MAX_BUBBLES}, in the order you click them (${bubbles.length}/${MAX_BUBBLES} selected).`}>
            <ul className="flex flex-wrap gap-2">
              {BRAND_OPTIONS.map((o) => {
                const order = bubbles.indexOf(o.slug)
                const active = order !== -1
                return (
                  <li key={o.slug}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleBubble(o.slug)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors',
                        active ? 'border-signal-400/60 bg-signal-400/10 text-fg' : 'border-[var(--line)] text-muted hover:text-fg',
                      )}
                    >
                      <SvgBrand slug={o.slug} colored decorative className="h-3.5 w-3.5" />
                      {o.title}
                      {active && <span className="font-mono text-[10px] text-signal-300">{order + 1}</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </Section>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <section className="surface rounded-2xl p-5">
            <h2 className="text-sm font-medium text-fg">Live preview</h2>
            <p className="mt-1 text-xs text-subtle">Unsaved changes included.</p>
            <div className="hero mt-4 overflow-hidden rounded-xl px-10 pb-2 pt-10">
              <HeroPortrait
                image={shownImage ?? fallbackPortrait}
                alt="Preview"
                badges={(watched.hero_floating_badges ?? []).filter((b) => b?.label)}
                bubbles={bubbles}
                reduce
              />
            </div>
          </section>
        </aside>
      </div>
    </form>
  )
}
