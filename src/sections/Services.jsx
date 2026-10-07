import { Code, Database, Globe, LayoutDashboard, Palette, Plug, Server, Shield, Smartphone, Sparkles, Webhook, Zap } from 'lucide-react'
import { RevealGroup, RevealItem } from '../components/common/Reveal'
import { SectionHeading } from '../components/common/SectionHeading'
import { SpotlightCard } from '../components/common/SpotlightCard'
import { LoadingRegion, Skeleton } from '../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../components/ui/States'
import { useServices } from '../hooks/usePortfolio'

/** Mirrors App\Enums\ServiceIcon on the API. */
export const SERVICE_ICONS = {
  server: Server, api: Webhook, code: Code, layout: LayoutDashboard, palette: Palette, globe: Globe,
  dashboard: LayoutDashboard, plug: Plug, smartphone: Smartphone, database: Database, shield: Shield, zap: Zap,
}

export function Services({ index = '05', full = false }) {
  const { data, isLoading, isError, error, refetch } = useServices()
  const services = data?.data ?? []

  return (
    <section id="services" className="container-page py-20 sm:py-28" aria-labelledby="services-title">
      <SectionHeading
        index={index}
        eyebrow="services"
        as={full ? 'h1' : 'h2'}
        title={<span id="services-title">How I can help.</span>}
        description="From a single API integration to a complete Laravel application with an admin panel."
      />

      <div className="mt-12">
        {isLoading && (
          <LoadingRegion label="Loading services" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </LoadingRegion>
        )}
        {isError && <ErrorState error={error} onRetry={refetch} />}
        {!isLoading && !isError && services.length === 0 && (
          <EmptyState icon={Sparkles} title="No services listed yet" description="Services added in the admin panel will appear here." />
        )}
        {services.length > 0 && (
          <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const Icon = SERVICE_ICONS[service.icon] ?? Code
              return (
                <RevealItem as="li" key={service.id}>
                  <SpotlightCard className="flex h-full flex-col p-6">
                    <div className="flex items-start justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line)] bg-ink-900 text-ember-400">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[11px] text-subtle">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <h3 className="mt-5 text-[17px] font-semibold text-fg">{service.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{service.short_description}</p>
                    {service.features?.length > 0 && (
                      <ul className="mt-5 space-y-1.5 border-t border-[var(--line)] pt-4">
                        {service.features.map((f) => (
                          <li key={f} className="flex items-center gap-2.5 text-[13px] text-fg/80">
                            <span className="h-1 w-1 rounded-full bg-ember-400" aria-hidden="true" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </SpotlightCard>
                </RevealItem>
              )
            })}
          </RevealGroup>
        )}
      </div>
    </section>
  )
}
