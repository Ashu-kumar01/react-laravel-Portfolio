import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
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
import { PageHeader } from '../components/PageHeader'
import { useAdminMutation } from '../hooks'

const text = (max) => z.string().max(max, `Max ${max} characters.`)
const httpsUrl = z.string().trim().max(300).refine((v) => v === '' || (v.startsWith('https://') && URL.canParse(v)), 'Enter a full https:// URL.')
const email = z.string().trim().max(190).refine((v) => v === '' || z.string().email().safeParse(v).success, 'Enter a valid email.')

const schema = z.object({
  full_name: text(120).min(1, 'Required.'),
  display_name: text(60).min(1, 'Required.'),
  title: text(120).min(1, 'Required.'),
  tagline: text(160),
  headline: text(200),
  summary: text(600),
  about: text(5000),
  location: text(120),
  years_experience: z.coerce.number().min(0).max(60),
  websites_count: z.coerce.number().int().min(0).max(10000),
  career_goal: text(1500),
  availability: text(120),
  email,
  phone: text(30),
  github_url: httpsUrl,
  linkedin_url: httpsUrl,
  notification_email: email,
})

const GROUPS = [
  {
    title: 'Profile',
    description: 'Shown in the hero, about section and footer.',
    fields: [
      ['full_name', 'Full name'], ['display_name', 'Display name (hero)'], ['title', 'Professional title'],
      ['tagline', 'Stack tagline', 'Separate items with •'], ['location', 'Location'], ['years_experience', 'Years of experience', 'Decimals allowed, e.g. 3.8', 'number'], ['websites_count', 'Websites delivered', 'Shown as 30+ in the hero', 'number'],
      ['availability', 'Availability badge'], ['headline', 'Hero headline', null, 'textarea', 2], ['summary', 'Short summary', 'Used in the footer', 'textarea', 3],
      ['about', 'About story', 'Separate paragraphs with a blank line', 'textarea', 8],
      ['career_goal', 'Career goal', 'Shown beside the about section', 'textarea', 3],
    ],
  },
  {
    title: 'Contact & social',
    description: 'Empty links are hidden on the website.',
    fields: [['email', 'Public email', null, 'email'], ['phone', 'Public phone'], ['github_url', 'GitHub URL', null, 'url'], ['linkedin_url', 'LinkedIn URL', null, 'url']],
  },
  {
    title: 'Private',
    description: 'Never exposed by the public API.',
    fields: [['notification_email', 'Notification email', 'New enquiries are emailed here (uses the API mail settings)', 'email']],
  },
]

const toForm = (data) => Object.fromEntries(Object.keys(schema.shape).map((k) => [k, data?.[k] ?? (['years_experience', 'websites_count'].includes(k) ? 0 : '')]))

export default function SettingsPage() {
  const query = useQuery({ queryKey: queryKeys.admin.settings, queryFn: adminApi.settings.get })
  const { register, handleSubmit, reset, setError, formState: { errors, isDirty } } = useForm({ resolver: zodResolver(schema), defaultValues: toForm({}) })

  useEffect(() => {
    if (query.data?.data) reset(toForm(query.data.data))
  }, [query.data, reset])

  const save = useAdminMutation('settings', adminApi.settings.update, {
    success: 'Settings saved',
    onSuccess: (res) => reset(toForm(res.data)),
    onError: (e) => {
      if (!e.isValidation) return
      Object.entries(fieldErrors(e)).forEach(([k, m]) => setError(k, { message: m }))
      toast.error('Please fix the highlighted fields.')
    },
  })

  if (query.isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 rounded-2xl" /></div>
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />

  // Empty strings become null so the API stores "unset" rather than "".
  const submit = (values) => save.mutate(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v === '' ? null : v])))

  return (
    <form noValidate onSubmit={handleSubmit(submit)}>
      <PageHeader
        title="Settings"
        description="Site-wide content and links. Changes appear on the website immediately."
        actions={<Button type="submit" size="sm" loading={save.isPending} disabled={!isDirty}>Save settings</Button>}
      />
      <div className="space-y-4">
        {GROUPS.map((group) => (
          <section key={group.title} className="surface grid gap-6 rounded-2xl p-5 sm:p-6 lg:grid-cols-[240px_1fr]">
            <div>
              <h2 className="text-sm font-medium text-fg">{group.title}</h2>
              <p className="mt-1 text-xs text-subtle">{group.description}</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {group.fields.map(([key, label, hint, type, rows]) => (
                <Field key={key} label={label} hint={hint} error={errors[key]?.message} className={type === 'textarea' ? 'sm:col-span-2' : undefined}>
                  {(a) =>
                    type === 'textarea' ? (
                      <Textarea {...a} rows={rows} error={errors[key]} {...register(key)} />
                    ) : (
                      <Input {...a} type={type ?? 'text'} step={key === 'years_experience' ? '0.1' : undefined} error={errors[key]} {...register(key)} />
                    )
                  }
                </Field>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit" loading={save.isPending} disabled={!isDirty}>Save settings</Button>
      </div>
    </form>
  )
}
