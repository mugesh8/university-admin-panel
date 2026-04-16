import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, Receipt, Scale } from 'lucide-react'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { FilterBar } from '../../components/ui/FilterBar.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { KpiCard } from '../../components/ui/KpiCard.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { getPaymentTransactionRows } from '../../lib/mock-data/applicationModules.js'

function paymentTone(status) {
  if (status === 'Paid') return 'success'
  if (status === 'Pending') return 'warning'
  return 'default'
}

export function PaymentsPage() {
  const baseRows = useMemo(() => getPaymentTransactionRows(), [])
  const [search, setSearch] = useState('')
  const [feeType, setFeeType] = useState('')
  const [payStatus, setPayStatus] = useState('')

  const feeTypes = useMemo(() => [...new Set(baseRows.map((r) => r.feeType))].sort(), [baseRows])

  const rows = useMemo(() => {
    let list = [...baseRows]
    if (feeType) list = list.filter((r) => r.feeType === feeType)
    if (payStatus) list = list.filter((r) => r.status === payStatus)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (r) =>
          r.applicantName.toLowerCase().includes(q) ||
          r.applicationId.toLowerCase().includes(q) ||
          String(r.reference).toLowerCase().includes(q),
      )
    }
    return list
  }, [baseRows, feeType, payStatus, search])

  const outstanding = baseRows.filter((r) => r.status === 'Pending').length
  const paid = baseRows.filter((r) => r.status === 'Paid').length

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
    { key: 'feeType', header: 'Fee type', sortable: true, sortType: 'string' },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      sortType: 'string',
      render: (r) => (
        <span className="tabular-nums font-medium text-[var(--color-heading)]">
          {r.amount} {r.currency}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortType: 'string',
      render: (r) => <Badge tone={paymentTone(r.status)}>{r.status}</Badge>,
    },
    {
      key: 'reference',
      header: 'Reference',
      sortable: true,
      sortType: 'string',
      render: (r) => <span className="tabular-nums text-sm">{r.reference}</span>,
    },
    { key: 'method', header: 'Method', sortable: true, sortType: 'string' },
    {
      key: 'instructionsSentAt',
      header: 'Instructions sent',
      sortable: true,
      sortType: 'date',
      sortValue: (r) => r.instructionsSentAt,
      render: (r) => (
        <span className="text-sm tabular-nums text-[var(--color-text)]">{r.instructionsSentAt ?? '—'}</span>
      ),
    },
    {
      key: 'recordedAt',
      header: 'Recorded',
      sortable: true,
      sortType: 'date',
      sortValue: (r) => r.recordedAt,
      render: (r) => (
        <span className="text-sm tabular-nums text-[var(--color-text)]">{r.recordedAt ?? '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <Button type="button" variant="secondary" className="!px-2.5 !py-1.5 text-xs">
            Record payment
          </Button>
          <Button type="button" variant="ghost" className="!px-2.5 !py-1.5 text-xs">
            Resend instructions
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <KpiCard compact title="Outstanding lines" subtitle="Awaiting confirmation" value={String(outstanding)} />
        <KpiCard
          compact
          title="Confirmed lines"
          subtitle="Recorded in system"
          value={String(paid)}
          delta="+12% vs prior month"
          deltaPositive
        />
        <KpiCard compact title="Gateway" subtitle="Phase 1" value="Manual" />
      </div>

      <Card>
        <CardHeader title="Fee transactions" />
        <FilterBar className="mb-4 !shadow-none">
          <div className="min-w-[200px] flex-1">
            <Input
              label="Search"
              placeholder="Applicant, application ID, reference…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="min-w-[200px]">
            <Select label="Fee type" value={feeType} onChange={(e) => setFeeType(e.target.value)}>
              <option value="">All</option>
              {feeTypes.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-[180px]">
            <Select label="Payment status" value={payStatus} onChange={(e) => setPayStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </Select>
          </div>
        </FilterBar>
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.rowKey}
          pageSize={8}
          emptyMessage="No payment lines match your filters."
        />
      </Card>
    </div>
  )
}
