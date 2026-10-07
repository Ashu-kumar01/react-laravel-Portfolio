import { Suspense, lazy } from 'react'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Reveal } from '../components/common/Reveal'
import { SectionHeading } from '../components/common/SectionHeading'
import { SocialLinks } from '../components/common/ProfileLinks'
import { Skeleton } from '../components/ui/Skeleton'
import { useProfile } from '../hooks/usePortfolio'

const ContactForm = lazy(() => import('../components/forms/ContactForm'))

function FormSkeleton() {
  return (
    <div className="surface space-y-5 rounded-2xl p-6 sm:p-8" aria-hidden="true">
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
      <Skeleton className="h-40" />
      <Skeleton className="ml-auto h-12 w-40" />
    </div>
  )
}
export function Contact({ index = '06', full = false }) {
  const { data } = useProfile()
  const profile = data?.data?.profile ?? {}

  const details = [
    profile.email && { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    profile.phone && { icon: Phone, label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/\s+/g, '')}` },
    profile.location && { icon: MapPin, label: 'Location', value: profile.location },
    profile.availability && { icon: Clock, label: 'Availability', value: profile.availability },
  ].filter(Boolean)

  return (
    <section id="contact" className="container-page py-20 sm:py-28" aria-labelledby="contact-title">
      <SectionHeading
        index={index}
        eyebrow="contact"
        as={full ? 'h1' : 'h2'}
        title={<span id="contact-title">Let&apos;s build something solid.</span>}
        description="Have a project, an API to build or a Laravel app that needs attention? Send a message."
      />
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.6fr]">
        <Reveal className="space-y-3">
          {details.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="surface flex items-center gap-4 rounded-2xl p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-ink-900 text-ember-400">
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-subtle">{label}</p>
                {href ? (
                  <a href={href} className="truncate text-[15px] text-fg underline-offset-4 hover:underline">{value}</a>
                ) : (
                  <p className="text-[15px] text-fg">{value}</p>
                )}
              </div>
            </div>
          ))}
          <SocialLinks className="pt-2" />
        </Reveal>
        <Reveal delay={0.08}>
          <Suspense fallback={<FormSkeleton />}>
            <ContactForm />
          </Suspense>
        </Reveal>
      </div>
    </section>
  )
}
