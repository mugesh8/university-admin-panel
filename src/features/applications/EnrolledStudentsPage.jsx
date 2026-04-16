import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, IdCard, Sparkles } from 'lucide-react'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { FilterBar } from '../../components/ui/FilterBar.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { KpiCard } from '../../components/ui/KpiCard.jsx'
import { getEnrolledStudentRows } from '../../lib/mock-data/applicationModules.js'

export function EnrolledStudentsPage() {
  const baseRows = useMemo(() => getEnrolledStudentRows(), [])
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    if (!search.trim()) return baseRows
    const q = search.trim().toLowerCase()
    return baseRows.filter(
      (r) =>
        r.applicantName.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q) ||
        r.applicationId.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q),
    )
  }, [baseRows, search])

  const intakes = useMemo(() => [...new Set(baseRows.map((r) => r.intake))], [baseRows])

  const columns = [
    {
      key: 'studentId',
      header: 'Student ID',
      sortable: true,
      sortType: 'string',
      render: (r) => (
        <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-[var(--color-heading)]">
          <IdCard className="h-4 w-4 text-[var(--color-text-muted)]" aria-hidden />
          {r.studentId}
        </span>
      ),
    },
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
    { key: 'applicantName', header: 'Legal name', sortable: true, sortType: 'string' },
    { key: 'email', header: 'Email', sortable: true, sortType: 'string' },
    { key: 'program', header: 'Program', sortable: true, sortType: 'string' },
    {
      key: 'intake',
      header: 'Intake',
      sortable: true,
      sortType: 'string',
      render: (r) => <Badge tone="info">{r.intake}</Badge>,
    },
    {
      key: 'enrolledAt',
      header: 'Enrolled on',
      sortable: true,
      sortType: 'date',
    },
    { key: 'confirmedBy', header: 'Confirmed by', sortable: true, sortType: 'string' },
    {
      key: 'notes',
      header: 'Notes',
      render: (r) => (
        <span className="line-clamp-2 max-w-[16rem] text-sm text-[var(--color-text-muted)]">{r.notes || '—'}</span>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <KpiCard compact title="Active enrollments" subtitle="Demo dataset" value={String(baseRows.length)} />
        <KpiCard
          compact
          title="Programs"
          subtitle="Distinct in list"
          value={String(new Set(baseRows.map((r) => r.program)).size)}
        />
        <KpiCard compact title="Next phase" subtitle="Provisioning" value="Phase 2" />
      </div>

      <Card>
        <CardHeader title="Cohort roster" />
        <FilterBar className="mb-4 !shadow-none">
          <div className="min-w-[240px] flex-1">
            <Input
              label="Search"
              placeholder="Student ID, application, name, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </FilterBar>
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.rowKey}
          pageSize={8}
          emptyMessage="No enrolled students match your search."
        />
      </Card>
    </div>
  )
}
