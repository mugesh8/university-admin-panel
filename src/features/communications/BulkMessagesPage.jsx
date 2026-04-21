import { useMemo, useState } from 'react'
import { Megaphone, PieChart, Users } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { KpiCard } from '../../components/ui/KpiCard.jsx'
import { applications } from '../../lib/mock-data/applications.js'
import { bulkMessageCampaigns } from '../../lib/mock-data/scaffold.js'
import { useEmailTemplatesStore } from '../../hooks/useEmailTemplatesStore.js'

function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export function BulkMessagesPage() {
  const { templates: emailTemplates } = useEmailTemplatesStore()
  const [program, setProgram] = useState('')
  const [intake, setIntake] = useState('')
  const [status, setStatus] = useState('')
  const [templateId, setTemplateId] = useState('')

  const programs = useMemo(() => [...new Set(applications.map((a) => a.program))].sort(), [])
  const intakes = useMemo(() => [...new Set(applications.map((a) => a.intake))].sort(), [])
  const statuses = useMemo(() => [...new Set(applications.map((a) => a.status))].sort(), [])
  const activeTemplates = useMemo(() => emailTemplates.filter((t) => t.active), [emailTemplates])

  const audienceCount = useMemo(() => {
    return applications.filter((a) => {
      if (program && a.program !== program) return false
      if (intake && a.intake !== intake) return false
      if (status && a.status !== status) return false
      return true
    }).length
  }, [program, intake, status])

  const lastRun = bulkMessageCampaigns[0]
  const totalSent = bulkMessageCampaigns.reduce((acc, c) => acc + c.sent, 0)

  const columns = [
    {
      key: 'label',
      header: 'Campaign',
      sortable: true,
      sortType: 'string',
      render: (c) => (
        <div>
          <p className="font-medium text-[var(--color-heading)]">{c.label}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{c.filtersSummary}</p>
        </div>
      ),
    },
    {
      key: 'templateName',
      header: 'Template',
      sortable: true,
      sortType: 'string',
    },
    {
      key: 'sentAt',
      header: 'Sent',
      sortable: true,
      sortType: 'date',
      sortValue: (c) => c.sentAt,
      render: (c) => <span className="tabular-nums text-sm">{formatDateTime(c.sentAt)}</span>,
    },
    { key: 'sender', header: 'Sender', sortable: true, sortType: 'string' },
    {
      key: 'recipients',
      header: 'Audience',
      sortable: true,
      sortType: 'number',
      numeric: true,
    },
    {
      key: 'delivered',
      header: 'Delivered',
      sortable: true,
      sortType: 'number',
      numeric: true,
    },
    {
      key: 'opened',
      header: 'Opened',
      sortable: true,
      sortType: 'number',
      numeric: true,
    },
    {
      key: 'bounced',
      header: 'Bounced',
      sortable: true,
      sortType: 'number',
      numeric: true,
      render: (c) => (
        <Badge tone={c.bounced > 0 ? 'warning' : 'success'}>{c.bounced}</Badge>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        actions={
          <Button type="button" variant="secondary">
            Export CSV (log)
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <KpiCard compact title="Audience (current filters)" subtitle="Live estimate" value={String(audienceCount)} />
        <KpiCard
          compact
          title="Bulk sends (demo)"
          subtitle="All campaigns"
          value={String(bulkMessageCampaigns.length)}
        />
        <KpiCard compact title="Messages dispatched" subtitle="Sum of sent counts" value={String(totalSent)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Bulk composer"
            actions={
              <Badge tone="info">
                <Users className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                {audienceCount} recipients
              </Badge>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Program" value={program} onChange={(e) => setProgram(e.target.value)}>
              <option value="">Any program</option>
              {programs.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
            <Select label="Intake" value={intake} onChange={(e) => setIntake(e.target.value)}>
              <option value="">Any intake</option>
              {intakes.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </Select>
            <Select label="Pipeline status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Any status</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select label="Template" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              <option value="">Select template…</option>
              {activeTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="secondary">
              Preview with sample merge
            </Button>
            <Button type="button">
              <Megaphone className="h-4 w-4" aria-hidden />
              Queue & send
            </Button>
          </div>
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">
            Production sends enqueue a job per recipient, write to the communication log, and surface SendGrid / SES
            events (delivered, opened, bounced) for audit.
          </p>
        </Card>

        <Card className="border-[#0A1628]/10 bg-[#f8fafc]">
          <CardHeader
            title="Delivery & audit"
            actions={<PieChart className="h-5 w-5 text-[#0A1628]/60" aria-hidden />}
          />
          <ul className="space-y-3 text-sm text-[var(--color-text)]">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              <span>
                <span className="font-medium text-[var(--color-heading)]">Sent / delivered / opened / bounced</span>{' '}
                <span className="text-[var(--color-text-muted)]">
                  — statuses appear in the Communication log tab; bulk runs aggregate counts below.
                </span>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              <span>
                <span className="font-medium text-[var(--color-heading)]">No personal inboxes</span>{' '}
                <span className="text-[var(--color-text-muted)]">
                  — all mail is issued from platform-connected accounts for compliance.
                </span>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
              <span>
                <span className="font-medium text-[var(--color-heading)]">Latest scheduled send</span>{' '}
                <span className="text-[var(--color-text-muted)]">{lastRun ? formatDateTime(lastRun.sentAt) : '—'}</span>
              </span>
            </li>
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recent bulk campaigns" />
        <DataTable
          columns={columns}
          rows={bulkMessageCampaigns.map((c) => ({ ...c, rowKey: c.id }))}
          getRowKey={(r) => r.rowKey}
          pageSize={6}
          emptyMessage="No bulk campaigns recorded."
        />
      </Card>
    </div>
  )
}
