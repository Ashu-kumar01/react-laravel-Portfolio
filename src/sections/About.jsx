import { Database, Gauge, LayoutDashboard, LayoutTemplate, PenTool, ServerCog, Sprout, Target, Webhook } from 'lucide-react'
import { Reveal, RevealGroup, RevealItem } from '../components/common/Reveal'
import { SectionHeading } from '../components/common/SectionHeading'
import { ErrorState } from '../components/ui/States'
import { SkeletonText } from '../components/ui/Skeleton'
import { useProfile } from '../hooks/usePortfolio'
import { paragraphs } from '../utils/format'

/** What I bring — based on the owner's described skills and responsibilities. */
const FOCUS = [
  { icon: LayoutTemplate, title: 'Responsive frontend', text: 'HTML5, CSS3, JavaScript, Bootstrap and Tailwind — layouts that work on every screen and browser.' },
  { icon: PenTool, title: 'Design to code', text: 'Turning UI/UX and Figma designs into clean, functional interfaces.' },
  { icon: ServerCog, title: 'PHP & Laravel', text: 'MVC, routing, Eloquent, migrations, validation and authentication.' },
  { icon: Webhook, title: 'REST APIs', text: 'Building and consuming APIs with validated JSON responses, tested in Postman.' },
  { icon: Database, title: 'MySQL', text: 'Database design, relationships, joins, filtering and pagination.' },
  { icon: LayoutDashboard, title: 'Dashboards & admin panels', text: 'Tables, forms, modals and CRUD workflows for real teams.' },
  { icon: Gauge, title: 'Performance & maintenance', text: 'Debugging, optimising and improving existing applications.' },
  { icon: Sprout, title: 'Always learning', text: 'Deepening React.js and Laravel APIs; exploring Flutter & Dart.' },
]

function WhoAmI({ profile, stats }) {
  const rows = [
    ['name', profile.full_name],
    ['role', profile.title],
    ['location', profile.location],
    ['experience', stats?.years_experience ? `${stats.years_experience}+ years` : null],
    ['websites', stats?.websites ? `${stats.websites}+ delivered` : null],
    ['stack', 'HTML · CSS · JS · PHP · Laravel · MySQL'],
    ['learning', 'React.js · Flutter · Dart'],
  ].filter(([, v]) => v)

  return (
    <div className="surface overflow-hidden rounded-2xl font-mono text-[13px]">
      <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="ml-2 text-[11px] text-subtle">~/portfolio — zsh</span>
      </div>
      <div className="space-y-1.5 p-5">
        <p><span className="text-mint-400">➜</span> <span className="text-signal-300">~</span> <span className="text-fg">whoami --verbose</span></p>
        <dl className="mt-3 space-y-1.5">
          {rows.map(([key, value]) => (
            <div key={key} className="grid grid-cols-[92px_1fr] gap-3">
              <dt className="text-subtle">{key}</dt>
              <dd className="text-fg/90"><span className="text-ember-300">"</span>{value}<span className="text-ember-300">"</span></dd>
            </div>
          ))}
        </dl>
        <p className="pt-2"><span className="text-mint-400">➜</span> <span className="text-signal-300">~</span> <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-fg/70" aria-hidden="true" /></p>
      </div>
    </div>
  )
}

export function About({ index = '01', full = false }) {
  const { data, isLoading, isError, error, refetch } = useProfile()
  const profile = data?.data?.profile ?? {}
  const stats = data?.data?.stats

  return (
    <section id="about" className="container-page py-20 sm:py-28" aria-labelledby="about-title">
      <SectionHeading
        index={index}
        eyebrow="about"
        as={full ? 'h1' : 'h2'}
        title={<span id="about-title">Clean interfaces, with PHP & Laravel underneath.</span>}
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
        <Reveal className="space-y-5 text-[16.5px] leading-[1.75] text-muted">
          {isLoading && <SkeletonText lines={6} />}
          {isError && <ErrorState error={error} onRetry={refetch} compact />}
          {paragraphs(profile.about).map((p, i) => (
            <p key={i} className={i === 0 ? 'text-fg/90' : undefined}>{p}</p>
          ))}
        </Reveal>
        <Reveal delay={0.1} className="space-y-4">
          {!isError && <WhoAmI profile={profile} stats={stats} />}
          {profile.career_goal && (
            <div className="surface rounded-2xl p-5">
              <p className="flex items-center gap-2 text-sm font-medium text-fg">
                <Target className="h-4 w-4 text-ember-400" aria-hidden="true" /> Career goal
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{profile.career_goal}</p>
            </div>
          )}
        </Reveal>
      </div>

      <RevealGroup as="ul" className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4" aria-label="Focus areas">
        {(full ? FOCUS : FOCUS.slice(0, 4)).map(({ icon: Icon, title, text }) => (
          <RevealItem as="li" key={title} className="group bg-ink-950 p-6 transition-colors duration-300 hover:bg-ink-900">
            <Icon className="h-5 w-5 text-ember-400 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true" />
            <h3 className="mt-4 font-medium text-fg">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}
