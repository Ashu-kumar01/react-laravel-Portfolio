import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { KeyRound, UserRound } from 'lucide-react'
import { authApi } from '../../api/admin'
import { fieldErrors } from '../../api/errors'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import { useAuth } from '../../store/auth'
import { PageHeader } from '../components/PageHeader'
import { useAdminMutation } from '../hooks'

const accountSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  username: z.string().trim().min(3, 'At least 3 characters.').max(50).regex(/^[A-Za-z0-9_-]+$/, 'Letters, numbers, dashes and underscores only.'),
  email: z.string().trim().email('Enter a valid email.').max(190),
})

/** Mirrors Password::defaults() on the API: 10+ chars, mixed case, number, symbol. */
const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password.'),
    password: z
      .string()
      .min(10, 'At least 10 characters.')
      .regex(/[a-z]/, 'Add a lowercase letter.')
      .regex(/[A-Z]/, 'Add an uppercase letter.')
      .regex(/[0-9]/, 'Add a number.')
      .regex(/[^A-Za-z0-9]/, 'Add a symbol.'),
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, { path: ['password_confirmation'], message: 'Passwords do not match.' })
  .refine((v) => v.password !== v.current_password, { path: ['password'], message: 'Choose a different password.' })

function AccountForm() {
  const { user, updateUser } = useAuth()
  const { register, handleSubmit, setError, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: user?.name ?? '', username: user?.username ?? '', email: user?.email ?? '' },
  })
  const save = useAdminMutation('account', authApi.updateAccount, {
    success: 'Profile updated',
    onSuccess: (res) => updateUser(res.data),
    onError: (e) => e.isValidation && Object.entries(fieldErrors(e)).forEach(([k, m]) => setError(k, { message: m })),
  })

  return (
    <form noValidate onSubmit={handleSubmit((v) => save.mutate(v))} className="surface space-y-5 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2 text-sm font-medium text-fg"><UserRound className="h-4 w-4 text-ember-400" aria-hidden="true" /> Account details</div>
      <Field label="Name" error={errors.name?.message}>{(a) => <Input {...a} autoComplete="name" error={errors.name} {...register('name')} />}</Field>
      <Field label="Username" hint="Used to sign in" error={errors.username?.message}>{(a) => <Input {...a} autoComplete="username" error={errors.username} {...register('username')} />}</Field>
      <Field label="Email" error={errors.email?.message}>{(a) => <Input {...a} type="email" autoComplete="email" error={errors.email} {...register('email')} />}</Field>
      <Button type="submit" loading={save.isPending} disabled={!isDirty}>Save profile</Button>
    </form>
  )
}

function PasswordForm() {
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  })
  const save = useAdminMutation('account', authApi.updatePassword, {
    onSuccess: () => reset(),
    onError: (e) => e.isValidation && Object.entries(fieldErrors(e)).forEach(([k, m]) => setError(k, { message: m })),
  })

  return (
    <form noValidate onSubmit={handleSubmit((v) => save.mutate(v))} className="surface space-y-5 rounded-2xl p-5 sm:p-6">
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-fg"><KeyRound className="h-4 w-4 text-ember-400" aria-hidden="true" /> Change password</div>
        <p className="mt-1 text-xs text-subtle">Changing your password signs out every other session.</p>
      </div>
      <Field label="Current password" error={errors.current_password?.message}>{(a) => <Input {...a} type="password" autoComplete="current-password" error={errors.current_password} {...register('current_password')} />}</Field>
      <Field label="New password" hint="10+ characters with upper & lower case, a number and a symbol" error={errors.password?.message}>{(a) => <Input {...a} type="password" autoComplete="new-password" error={errors.password} {...register('password')} />}</Field>
      <Field label="Confirm new password" error={errors.password_confirmation?.message}>{(a) => <Input {...a} type="password" autoComplete="new-password" error={errors.password_confirmation} {...register('password_confirmation')} />}</Field>
      <Button type="submit" loading={save.isPending}>Update password</Button>
    </form>
  )
}

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" description="Your admin account and sign-in credentials." />
      <div className="grid gap-4 lg:grid-cols-2">
        <AccountForm />
        <PasswordForm />
      </div>
    </>
  )
}
