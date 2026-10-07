import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CircleAlert, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { MESSAGES } from '../../api/errors'
import { Logo } from '../../components/common/Logo'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import { useAuth } from '../../store/auth'

const schema = z.object({
  login: z.string().trim().min(1, 'Enter your username or email.'),
  password: z.string().min(1, 'Enter your password.'),
})

export default function LoginPage() {
  const { login, isAuthenticated, expired } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { login: '', password: '' } })

  if (isAuthenticated) return <Navigate to={location.state?.from ?? '/admin/dashboard'} replace />

  const onSubmit = async (values) => {
    setFormError(null)
    try {
      await login(values)
      navigate(location.state?.from ?? '/admin/dashboard', { replace: true })
    } catch (error) {
      if (error.kind === 'validation') setFormError(error.errors?.login?.[0] ?? error.message)
      else if (error.kind === 'rate_limit') setFormError('Too many login attempts. Please wait a minute and try again.')
      else if (error.isNetwork) setFormError(`${MESSAGES.network} ${MESSAGES.networkDetail}`)
      else setFormError(error.message)
    }
  }

  const sessionExpired = expired || location.state?.expired

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-ink-950 px-4 py-12">
      <div className="bg-grid mask-fade-y absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-ember-500/[0.08] blur-[100px]" aria-hidden="true" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="surface rounded-2xl p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-ink-900 text-ember-400">
              <LockKeyhole className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-fg">Admin sign in</h1>
              <p className="text-sm text-muted">Manage your portfolio content</p>
            </div>
          </div>

          {sessionExpired && !formError && (
            <p role="status" className="mb-4 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3.5 py-2.5 text-sm text-amber-400">
              Your session has expired. Please sign in again.
            </p>
          )}
          {formError && (
            <p role="alert" className="mb-4 flex gap-2 rounded-xl border border-danger-400/25 bg-danger-400/10 px-3.5 py-2.5 text-sm text-danger-400">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {formError}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Field label="Username or email" error={errors.login?.message}>
              {(a) => <Input {...a} autoComplete="username" autoFocus error={errors.login} {...register('login')} />}
            </Field>
            <Field label="Password" error={errors.password?.message}>
              {(a) => (
                <div className="relative">
                  <Input {...a} type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="pr-11" error={errors.password} {...register('password')} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-subtle hover:text-fg" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              )}
            </Field>
            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-subtle">
          <a href="/" className="hover:text-fg">← Back to website</a>
        </p>
      </div>
    </main>
  )
}
