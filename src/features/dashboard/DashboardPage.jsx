import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { KpiCard } from '../../components/ui/KpiCard.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import {
  actionQueue,
  documentCompletion,
  getFunnelData,
  kpiCards,
  revenueMock,
} from '../../lib/mock-data/dashboard.js'
import { pipelineStages, programBreakdown, weeklyTrend } from '../../lib/mock-data/pipeline.js'

export function DashboardPage() {
  const funnelData = useMemo(() => getFunnelData(), [])
  const genderSlices = useMemo(
    () => [
      { name: 'Female', value: 58, fill: '#0f766e' },
      { name: 'Male', value: 38, fill: '#0e7490' },
      { name: 'Other', value: 4, fill: '#64748b' },
    ],
    [],
  )

  const revTotal =
    revenueMock.applicationFees + revenueMock.registrationFees + revenueMock.seatReservation
  const revPct = Math.round((revTotal / revenueMock.target) * 100)

  return (
    <div className="mx-auto w-full max-w-[80rem] space-y-6">
      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((k) => (
          <KpiCard key={k.id} {...k} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <Card className="flex min-h-0 flex-col">
          <CardHeader title="Admissions funnel" />
          <div className="min-h-[288px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--color-border)]" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Applications" radius={[0, 4, 4, 0]}>
                  {funnelData.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex min-h-0 flex-col">
          <CardHeader title="Pipeline distribution" />
          <div className="min-h-[288px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineStages} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--color-border)]" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-primary)" name="Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
        <Card className="flex min-h-0 flex-col lg:col-span-2">
          <CardHeader title="Applications trend" />
          <div className="min-h-[260px] w-full flex-1 sm:min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--color-border)]" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="applications" stroke="var(--color-primary)" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex min-h-0 flex-col">
          <CardHeader title="Gender breakdown" />
          <div className="min-h-[260px] w-full flex-1 sm:min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderSlices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {genderSlices.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
        <Card className="flex min-h-0 flex-col">
          <CardHeader title="Program breakdown" />
          <ul className="flex-1 space-y-3 text-sm">
            {programBreakdown.map((p) => (
              <li key={p.program} className="flex justify-between gap-2 border-b border-[var(--color-border)] pb-2 last:border-0">
                <span className="font-medium text-[var(--color-heading)]">{p.program}</span>
                <span className="text-[var(--color-text-muted)]">
                  {p.enrolled}/{p.capacity}{' '}
                  <span className="text-emerald-700">({Math.round((p.enrolled / p.capacity) * 100)}%)</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex min-h-0 flex-col">
          <CardHeader title="Revenue tracker" />
          <p className="text-2xl font-semibold tabular-nums text-[var(--color-heading)]">
            ${revTotal.toLocaleString()}
            <span className="text-sm font-normal text-[var(--color-text-muted)]">
              {' '}
              / ${revenueMock.target.toLocaleString()}
            </span>
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all"
              style={{ width: `${Math.min(revPct, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">{revPct}% of monthly target</p>
        </Card>

        <Card className="flex min-h-0 flex-col">
          <CardHeader title="Document completion" />
          <div className="min-h-[220px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Complete', value: documentCompletion.complete, fill: '#0f766e' },
                    { name: 'Incomplete', value: documentCompletion.incomplete, fill: '#f59e0b' },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section>
      <Card>
        <CardHeader title="Geographic heatmap" />
        <div className="flex h-40 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-muted)]">
          Map visualization placeholder (connect to analytics service later)
        </div>
      </Card>
      </section>

      <section>
      <Card>
        <CardHeader title="Action required queue" actions={<Button variant="secondary">View all</Button>} />
        <ul className="divide-y divide-[var(--color-border)]">
          {actionQueue.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
              <div>
                <Link
                  to={`/applications/${encodeURIComponent(a.applicationId)}`}
                  className="font-medium text-[var(--color-primary)] hover:underline"
                >
                  {a.applicationId}
                </Link>
                <p className="text-sm text-[var(--color-heading)]">{a.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{a.action}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="warning">{a.daysWaiting}d</Badge>
                <Badge>{a.stage}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      </section>
    </div>
  )
}
