import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, FileScan, ShieldCheck } from 'lucide-react'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { FilterBar } from '../../components/ui/FilterBar.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { KpiCard } from '../../components/ui/KpiCard.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { getDocumentVerificationRows } from '../../lib/mock-data/applicationModules.js'

function verificationTone(status) {
  if (status === 'verified') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'rejected') return 'danger'
  return 'default'
}

function virusTone(scan) {
  if (scan === 'clean') return 'success'
  if (scan === 'infected') return 'danger'
  return 'warning'
}

export function DocumentsPage() {
  const baseRows = useMemo(() => getDocumentVerificationRows(), [])
  const [search, setSearch] = useState('')
  const [verification, setVerification] = useState('')
  const [staleOnly, setStaleOnly] = useState('')

  const rows = useMemo(() => {
    let list = [...baseRows]
    if (verification) list = list.filter((r) => r.verificationStatus === verification)
    if (staleOnly === 'yes') list = list.filter((r) => r.stale)
    if (staleOnly === 'no') list = list.filter((r) => !r.stale)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (r) =>
          r.documentType.toLowerCase().includes(q) ||
          r.applicantName.toLowerCase().includes(q) ||
          r.applicationId.toLowerCase().includes(q),
      )
    }
    return list
  }, [baseRows, search, staleOnly, verification])

  const pending = baseRows.filter((r) => r.verificationStatus === 'pending').length
  const verified = baseRows.filter((r) => r.verificationStatus === 'verified').length
  const stale = baseRows.filter((r) => r.stale).length

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
    { key: 'applicantName', header: 'Applicant', sortable: true, sortType: 'string' },
    { key: 'documentType', header: 'Document', sortable: true, sortType: 'string' },
    {
      key: 'virusScan',
      header: 'Virus scan',
      sortable: true,
      sortType: 'string',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5">
          <FileScan className="h-4 w-4 text-[var(--color-text-muted)]" aria-hidden />
          <Badge tone={virusTone(r.virusScan)}>{r.virusScan}</Badge>
        </span>
      ),
    },
    {
      key: 'verificationStatus',
      header: 'Verification',
      sortable: true,
      sortType: 'string',
      render: (r) => <Badge tone={verificationTone(r.verificationStatus)}>{r.verificationStatus}</Badge>,
    },
    {
      key: 'stale',
      header: 'Staleness',
      sortable: true,
      sortType: 'string',
      render: (r) =>
        r.stale ? (
          <span className="inline-flex items-center gap-1 text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            Review (e.g. bank statement)
          </span>
        ) : (
          <span className="text-sm text-[var(--color-text-muted)]">OK</span>
        ),
    },
    {
      key: 'uploadedAt',
      header: 'Uploaded',
      sortable: true,
      sortType: 'date',
      render: (r) => <span className="tabular-nums text-sm">{r.uploadedAt ?? '—'}</span>,
    },
    {
      key: 'officer',
      header: 'Officer',
      sortable: true,
      sortType: 'string',
      render: (r) => <span className="text-sm">{r.officer ?? '—'}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <div className="flex flex-wrap gap-1">
          <Button type="button" variant="secondary" className="!px-2.5 !py-1.5 text-xs">
            Verify
          </Button>
          <Button type="button" variant="secondary" className="!px-2.5 !py-1.5 text-xs">
            Reject
          </Button>
          <Button type="button" variant="ghost" className="!px-2.5 !py-1.5 text-xs">
            Request re-upload
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <KpiCard compact title="Pending verification" subtitle="Officer action" value={String(pending)} />
        <KpiCard
          compact
          title="Verified"
          subtitle="All document types"
          value={String(verified)}
          delta="+4% vs last week"
          deltaPositive
        />
        <KpiCard compact title="Stale / review" subtitle="Automation flags" value={String(stale)} />
      </div>

      <Card>
        <CardHeader title="Verification queue" />
        <FilterBar className="mb-4 !shadow-none">
          <div className="min-w-[200px] flex-1">
            <Input
              label="Search"
              placeholder="Applicant, application ID, document…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="min-w-[200px]">
            <Select
              label="Verification"
              value={verification}
              onChange={(e) => setVerification(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
            </Select>
          </div>
          <div className="min-w-[200px]">
            <Select label="Staleness" value={staleOnly} onChange={(e) => setStaleOnly(e.target.value)}>
              <option value="">All</option>
              <option value="yes">Flagged only</option>
              <option value="no">Not flagged</option>
            </Select>
          </div>
        </FilterBar>
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.rowKey}
          pageSize={8}
          emptyMessage="No documents match your filters."
        />
      </Card>
    </div>
  )
}
