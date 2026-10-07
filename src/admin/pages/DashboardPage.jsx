import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Cpu, Download, FolderKanban, Mail, MailOpen, Plus, Star, Briefcase } from 'lucide-react'
import { adminApi } from '../../api/admin'
import { queryKeys } from '../../api/queryClient'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/States'
import { useAuth } from '../../store/auth'
import { relativeTime } from '../../utils/format'
import { BarList, ColumnChart } from '../components/Charts'
import { PageHeader } from '../components/PageHeader'
import { MessageStatusBadge } from '../components/StatusBadges'

function StatCard({ icon: Icon, label, value, to, hint }) {
  const body = (
    <div className="surface h-full rounded-2xl p-5 transition-colors hover:border-[var(--line-strong)]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <Icon className="h-4 w-4 text-subtle" aria-hidden="true" />
      </div>
      <p className="mt-3 font-mono text-3xl font-medium tabular-nums text-fg">{value ?? <Skeleton className="h-9 w-12" />}</p>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </div>
  )
  return to ? <Link to={to} className="block rounded-2xl">{body}</Link> : body
}

function Panel({ title, children, action }) {
  return (
    <section className="surface rounded-2xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-medium text-fg">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const query = useQuery({ queryKey: queryKeys.admin.dashboard, queryFn: adminApi.dashboard })
  const d = query.data?.data
  const s = d?.stats ?? {}

  const toRows = (obj = {}) => Object.entries(obj).map(([label, value]) => ({ label, value }))

  return (
    <>
      <PageHeader
        title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        description="An overview of your portfolio content and enquiries."
        actions={<Button to="/admin/projects/create" size="sm"><Plus className="h-4 w-4" aria-hidden="true" /> New project</Button>}
      />

      {query.isError && <ErrorState error={query.error} onRetry={query.refetch} />}

      {!query.isError && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard icon={FolderKanban} label="Projects" value={d && s.projects} hint={d && `${s.published_projects} published`} to="/admin/projects" />
            <StatCard icon={Star} label="Featured" value={d && s.featured_projects} to="/admin/projects?featured=1" />
            <StatCard icon={Cpu} label="Technologies" value={d && s.technologies} hint={d && `${s.active_technologies} active`} to="/admin/technologies" />
            <StatCard icon={Briefcase} label="Experience" value={d && s.experiences} to="/admin/experience" />
            <StatCard icon={Mail} label="Messages" value={d && s.messages} to="/admin/messages" />
            <StatCard icon={MailOpen} label="Unread" value={d && s.unread_messages} to="/admin/messages?status=new" />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <Panel title="Enquiries — last 6 months">
              {d ? (
                <ColumnChart caption="Contact messages per month" valueLabel="Messages" data={d.charts.messages_per_month.map((m) => ({ label: m.label, value: m.count }))} />
              ) : <Skeleton className="h-52" />}
            </Panel>
            <Panel title="Technologies by category">
              {d ? <BarList caption="Technologies by category" data={toRows(d.charts.technologies_by_category)} /> : <Skeleton className="h-52" />}
            </Panel>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <Panel title="Recent messages" action={<Link to="/admin/messages" className="text-xs text-muted hover:text-fg">View all →</Link>}>
              {!d && <Skeleton className="h-40" />}
              {d && d.recent_messages.length === 0 && <p className="py-8 text-center text-sm text-muted">No messages yet. Enquiries from the contact form appear here.</p>}
              {d && d.recent_messages.length > 0 && (
                <ul className="-mx-2 divide-y divide-[var(--line)]">
                  {d.recent_messages.map((m) => (
                    <li key={m.id}>
                      <Link to={`/admin/messages?open=${m.id}`} className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-white/[0.03]">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-fg">{m.subject}</p>
                          <p className="truncate text-xs text-subtle">{m.name} · {relativeTime(m.created_at)}</p>
                        </div>
                        <MessageStatusBadge status={m.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
            <div className="space-y-4">
              <Panel title="Messages by status">
                {d ? (
                  <dl className="grid grid-cols-2 gap-3">
                    {['new', 'read', 'replied', 'archived'].map((k) => (
                      <div key={k} className="rounded-xl border border-[var(--line)] p-3">
                        <dt><MessageStatusBadge status={k} /></dt>
                        <dd className="mt-2 font-mono text-xl text-fg">{d.charts.messages_by_status[k] ?? 0}</dd>
                      </div>
                    ))}
                  </dl>
                ) : <Skeleton className="h-32" />}
              </Panel>
              <Panel title="Resume">
                {d && (d.resume ? (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="text-fg">{d.resume.title}</p>
                      <p className="text-xs text-subtle">Updated {relativeTime(d.resume.updated_at)}</p>
                    </div>
                    <p className="flex items-center gap-1.5 font-mono text-xs text-muted"><Download className="h-3.5 w-3.5" aria-hidden="true" /> {s.resume_downloads}</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <p className="text-muted">No resume uploaded.</p>
                    <Button to="/admin/resume" size="sm" variant="secondary">Upload</Button>
                  </div>
                ))}
              </Panel>
            </div>
          </div>
        </>
      )}
    </>
  )
}
