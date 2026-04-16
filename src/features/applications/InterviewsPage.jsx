import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, ClipboardCheck, Mic2 } from 'lucide-react'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { FilterBar } from '../../components/ui/FilterBar.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { KpiCard } from '../../components/ui/KpiCard.jsx'
import { getInterviewTableRows } from '../../lib/mock-data/applicationModules.js'

function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function InterviewsPage() {
  const baseRows = useMemo(() => getInterviewTableRows(), [])
  const [search, setSearch] = useState('')
  const [interviewStatus, setInterviewStatus] = useState('')

  const rows = useMemo(() => {
    let list = [...baseRows]
    if (interviewStatus) {
      list = list.filter((r) => r.interviewStatus === interviewStatus)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (r) =>
          r.applicantName.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.applicationId.toLowerCase().includes(q) ||
          r.program.toLowerCase().includes(q),
      )
    }
    return list
  }, [baseRows, interviewStatus, search])

  const scheduled = baseRows.filter((r) => r.interviewStatus === 'scheduled').length
  const complete = baseRows.filter((r) => r.interviewStatus === 'complete').length

  const columns = [
    {
      key: 'applicationId',
      header: 'Application',
      sortable: true,
      sortType: 'string',
      render: (r) => (
        <Link
          className="font-medium text-[var(--color-primary)] hover:underline"
          to={`/applications/${encodeURIComponent(r.applicationId)}`}
        >
          {r.applicationId}
        </Link>
      ),
    },
    {
      key: 'applicantName',
      header: 'Applicant',
      sortable: true,
      sortType: 'string',
    },
    { key: 'program', header: 'Program', sortable: true, sortType: 'string' },
    { key: 'intake', header: 'Intake', sortable: true, sortType: 'string' },
    {
      key: 'pipelineStatus',
      header: 'Pipeline',
      sortable: true,
      sortType: 'string',
      render: (r) => <Badge tone="info">{r.pipelineStatus}</Badge>,
    },
    {
      key: 'interviewStatus',
      header: 'Interview',
      sortable: true,
      sortType: 'string',
      render: (r) => (
        <Badge tone={r.interviewStatus === 'complete' ? 'success' : 'warning'}>
          {r.interviewStatus === 'complete' ? 'Complete' : 'Scheduled'}
        </Badge>
      ),
    },
    {
      key: 'scheduledAt',
      header: 'Date & time',
      sortable: true,
      sortType: 'date',
      sortValue: (r) => r.scheduledAt,
      render: (r) => (
        <span className="tabular-nums text-[var(--color-text)]">{formatDateTime(r.scheduledAt)}</span>
      ),
    },
    {
      key: 'mode',
      header: 'Format',
      sortable: true,
      sortType: 'string',
      render: (r) => (
        <div>
          <p className="text-[var(--color-heading)]">{r.mode}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{r.timezone}</p>
        </div>
      ),
    },
    {
      key: 'interviewers',
      header: 'Panel',
      render: (r) => <span className="text-sm text-[var(--color-text)]">{r.interviewers.join(', ')}</span>,
    },
    {
      key: 'evaluation',
      header: 'Dean evaluation',
      render: (r) =>
        r.evaluation ? (
          <div className="max-w-[14rem] text-sm">
            <p className="font-medium text-[var(--color-heading)]">{r.evaluation.recommendation}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {r.evaluation.submittedBy} · {formatDateTime(r.evaluation.submittedAt)}
            </p>
          </div>
        ) : (
          <span className="text-sm text-[var(--color-text-muted)]">—</span>
        ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <KpiCard
          compact
          title="Scheduled"
          subtitle="Awaiting interview"
          value={String(scheduled)}
          delta="+1 vs last week"
          deltaPositive
        />
        <KpiCard
          compact
          title="Evaluations submitted"
          subtitle="Interview complete"
          value={String(complete)}
          delta="+0 vs last week"
          deltaPositive
        />
        <KpiCard compact title="In interview workflow" subtitle="All pathways" value={String(baseRows.length)} />
      </div>

      <Card className="mb-6">
        <CardHeader
          title="Interview queue"
        />
        <FilterBar className="mb-4 !shadow-none">
          <div className="min-w-[200px] flex-1">
            <Input
              label="Search"
              placeholder="Name, email, application ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="min-w-[200px]">
            <Select label="Interview status" value={interviewStatus} onChange={(e) => setInterviewStatus(e.target.value)}>
              <option value="">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="complete">Complete</option>
            </Select>
          </div>
        </FilterBar>
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.rowKey}
          pageSize={8}
          emptyMessage="No interviews match your filters."
        />
      </Card>
    </div>
  )
}
