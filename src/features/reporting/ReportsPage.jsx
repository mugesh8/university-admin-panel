import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Mail } from 'lucide-react'
import { FilterBar } from '../../components/ui/FilterBar.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { applications as allApplications } from '../../lib/mock-data/applications.js'
import { exportApplicationsToCsv } from '../applications/exportApplicationsCsv.js'

export function ReportsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(() => new Set())

  const rows = useMemo(() => {
    let list = [...allApplications]
    if (status) list = list.filter((a) => a.status === status)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.phone.includes(q) ||
          a.id.toLowerCase().includes(q),
      )
    }
    return list
  }, [search, status])

  const statuses = [...new Set(allApplications.map((a) => a.status))]

  const columns = [
    {
      key: 'id',
      header: 'Application ID',
      sortable: true,
      sortType: 'string',
      render: (r) => (
        <Link className="font-medium text-[var(--color-primary)] hover:underline" to={`/applications/${encodeURIComponent(r.id)}`}>
          {r.id}
        </Link>
      ),
    },
    { key: 'name', header: 'Name', sortable: true, sortType: 'string' },
    { key: 'citizenship', header: 'Citizenship', sortable: true, sortType: 'string' },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortType: 'string',
      render: (r) => <Badge tone="info">{r.status}</Badge>,
    },
    { key: 'submittedAt', header: 'Submitted', sortable: true, sortType: 'date' },
    { key: 'assignedOfficer', header: 'Officer', sortable: true, sortType: 'string' },
    { key: 'daysInStage', header: 'Days in stage', sortable: true, sortType: 'number', numeric: true },
    { key: 'program', header: 'Program', sortable: true, sortType: 'string' },
    { key: 'intake', header: 'Intake', sortable: true, sortType: 'string' },
    { key: 'country', header: 'Country', sortable: true, sortType: 'string' },
    { key: 'email', header: 'Email', sortable: true, sortType: 'string' },
    { key: 'referredBy', header: 'Referred by', sortable: true, sortType: 'string' },
  ]

  return (
    <>
      <FilterBar className="mb-6 border-[var(--color-border)]/80 bg-[var(--color-surface)] shadow-[0_1px_2px_rgb(10_22_40/0.04),0_4px_16px_rgb(10_22_40/0.04)]">
        <div className="min-w-[200px] flex-1">
          <Input
            label="Search"
            placeholder="Name, email, phone, ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full min-w-[180px] sm:max-w-[220px]">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <Button type="button" variant="secondary">
          Apply filters
        </Button>
        <Button type="button" variant="secondary" onClick={() => exportApplicationsToCsv(rows)}>
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </FilterBar>

      {selected.size > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-2 text-sm">
          <span className="font-medium text-amber-950">{selected.size} selected</span>
          <Button type="button" variant="secondary" className="!py-1.5 text-xs">
            Change status
          </Button>
          <Button type="button" variant="secondary" className="!py-1.5 text-xs">
            Assign officer
          </Button>
          <Button type="button" variant="secondary" className="!py-1.5 text-xs">
            <Mail className="h-3.5 w-3.5" />
            Send email
          </Button>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        pageSize={8}
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
      />
    </>
  )
}
