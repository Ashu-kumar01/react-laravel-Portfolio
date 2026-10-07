import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, CircleCheck, Send } from 'lucide-react'
import { contactApi } from '../../api/portfolio'
import { fieldErrors, MESSAGES } from '../../api/errors'
import { contactDefaults, contactSchema } from '../../schemas/contact'
import { Button } from '../ui/Button'
import { Field, Input, Textarea } from '../ui/Field'

/** Loaded lazily (with zod + react-hook-form) when the contact section is rendered. */
export default function ContactForm() {
  const [sent, setSent] = useState(null)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(contactSchema), defaultValues: contactDefaults, mode: 'onTouched' })

  const mutation = useMutation({
    mutationFn: contactApi.send,
    onSuccess: (res) => {
      setSent(res.message || 'Thank you! Your message has been sent.')
      reset(contactDefaults)
    },
    onError: (error) => {
      if (error.isValidation) {
        Object.entries(fieldErrors(error)).forEach(([field, message]) => setError(field, { message }))
      }
    },
  })

  const messageLength = useWatch({ control, name: 'message' })?.length ?? 0
  const onSubmit = (values) => {
    setSent(null)
    mutation.mutate(values)
  }

  const serverError = mutation.isError && !mutation.error.isValidation ? mutation.error : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="surface relative space-y-5 rounded-2xl p-6 sm:p-8" aria-labelledby="contact-form-title">
      <h3 id="contact-form-title" className="sr-only">Contact form</h3>

      {/* Honeypot: hidden from people and assistive tech, attractive to bots */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" required error={errors.name?.message}>
          {(a) => <Input {...a} autoComplete="name" placeholder="Your name" error={errors.name} {...register('name')} />}
        </Field>
        <Field label="Email" required error={errors.email?.message}>
          {(a) => <Input {...a} type="email" autoComplete="email" placeholder="you@company.com" error={errors.email} {...register('email')} />}
        </Field>
        <Field label="Phone" hint="Optional" error={errors.phone?.message}>
          {(a) => <Input {...a} type="tel" autoComplete="tel" placeholder="+91 …" error={errors.phone} {...register('phone')} />}
        </Field>
        <Field label="Subject" required error={errors.subject?.message}>
          {(a) => <Input {...a} placeholder="Project enquiry" error={errors.subject} {...register('subject')} />}
        </Field>
      </div>
      <Field label="Message" required error={errors.message?.message} hint={`${messageLength}/5000`}>
        {(a) => <Textarea {...a} rows={6} placeholder="Tell me about your project, timeline and goals…" error={errors.message} {...register('message')} />}
      </Field>

      <AnimatePresence mode="wait">
        {sent && (
          <motion.div key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className="flex items-start gap-3 rounded-xl border border-mint-400/25 bg-mint-400/10 p-4 text-sm text-mint-400">
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{sent}</span>
          </motion.div>
        )}
        {serverError && (
          <motion.div key="err" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="flex items-start gap-3 rounded-xl border border-danger-400/25 bg-danger-400/10 p-4 text-sm text-danger-400">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {serverError.isNetwork ? `${MESSAGES.network} ${MESSAGES.networkDetail}` : serverError.message} Your message has not been sent.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col-reverse items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-xs text-subtle">Your details are only used to reply to your enquiry.</p>
        <Button type="submit" size="lg" loading={mutation.isPending} disabled={mutation.isPending}>
          {mutation.isPending ? 'Sending…' : <>Send message <Send className="h-4 w-4" aria-hidden="true" /></>}
        </Button>
      </div>
    </form>
  )
}
