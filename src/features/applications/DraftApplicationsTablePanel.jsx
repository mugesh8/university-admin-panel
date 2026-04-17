import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Plus } from 'lucide-react'
import { FilterBar } from '../../components/ui/FilterBar.jsx'
import { MultiSelect } from '../../components/ui/MultiSelect.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { getApplicationFormProgressPercent } from '../../lib/applicationFormProgress.js'
import { applicationDrafts as allDrafts } from '../../lib/mock-data/applicationDrafts.js'

function formatSaved(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toISOString().slice(0, 10)
}

export function DraftApplicationsTablePanel() {
  const [search, setSearch] = useState('')
  const [countryFilters, setCountryFilters] = useState([])
  const [stepFilters, setStepFilters] = useState([])

  const [selected, setSelected] = useState(() => new Set())

  const hasActiveFilters =
    search.trim() !== '' || countryFilters.length > 0 || stepFilters.length > 0

  const rows = useMemo(() => {
    let list = [...allDrafts]
    if (countryFilters.length > 0) {
      const allow = new Set(countryFilters)
      list = list.filter((d) => allow.has(d.country))
    }
    if (stepFilters.length > 0) {
      const allow = new Set(stepFilters)
      list = list.filter((d) => allow.has(d.currentStepTitle))
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (d) =>
          d.applicantName.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          d.phone.includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.userEmail.toLowerCase().includes(q),
      )
    }
    return list.map((d) => ({
      ...d,
      progressPercent: getApplicationFormProgressPercent(d.currentStepIndex),
    }))
  }, [search, countryFilters, stepFilters])

  function removeFilters() {
    setSearch('')
    setCountryFilters([])
    setStepFilters([])
  }

  const countries = [...new Set(allDrafts.map((d) => d.country))].sort((a, b) => a.localeCompare(b))
  const steps = [...new Set(allDrafts.map((d) => d.currentStepTitle))].sort((a, b) =>
    a.localeCompare(b),
  )

  const columns = [
    {
      key: 'id',
      header: 'Draft ID',
      sortable: true,
      sortType: 'string',
      render: (r) => (
        <Link
          className="font-medium text-[var(--color-primary)] hover:underline"
          to={`/applications/drafts/${encodeURIComponent(r.id)}`}
        >
          {r.id}
        </Link>
      ),
    },
    { key: 'applicantName', header: 'Name', sortable: true, sortType: 'string' },
    { key: 'email', header: 'Email', sortable: true, sortType: 'string' },
    { key: 'phone', header: 'Phone', sortable: true, sortType: 'string' },
    { key: 'citizenship', header: 'Citizenship', sortable: true, sortType: 'string' },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortType: 'string',
      render: (r) => <Badge tone="warning">{r.status}</Badge>,
    },
    {
      key: 'progressPercent',
      header: 'Progress',
      sortable: true,
      sortType: 'number',
      numeric: true,
      render: (r) => (
        <div className="flex min-w-[88px] items-center gap-2">
          <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums text-[var(--color-heading)]">
            {r.progressPercent}%
          </span>
        </div>
      ),
    },
    {
      key: 'lastSavedAt',
      header: 'Last saved',
      sortable: true,
      sortType: 'date',
      render: (r) => formatSaved(r.lastSavedAt),
    },
    { key: 'currentStepTitle', header: 'Current step', sortable: true, sortType: 'string' },
    { key: 'program', header: 'Program', sortable: true, sortType: 'string' },
    { key: 'intake', header: 'Intake', sortable: true, sortType: 'string' },
    { key: 'country', header: 'Country', sortable: true, sortType: 'string' },
    { key: 'userEmail', header: 'Portal account', sortable: true, sortType: 'string' },
  ]

  return (
    <>
      <FilterBar className="mb-6 border-[var(--color-border)]/80 bg-[var(--color-surface)] shadow-[0_1px_2px_rgb(10_22_40/0.04),0_4px_16px_rgb(10_22_40/0.04)]">
        <div className="min-w-[200px] flex-1">
          <Input
            label="Search"
            placeholder="Name, email, phone, draft ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full min-w-[180px] sm:max-w-[220px]">
          <MultiSelect
            label="Country"
            options={countries}
            value={countryFilters}
            onChange={setCountryFilters}
            placeholder="All countries"
          />
        </div>
        <div className="w-full min-w-[180px] sm:max-w-[260px]">
          <MultiSelect
            label="Current step"
            options={steps}
            value={stepFilters}
            onChange={setStepFilters}
            placeholder="All steps"
          />
        </div>
        {hasActiveFilters ? (
          <Button type="button" variant="secondary" onClick={removeFilters}>
            Remove filters
          </Button>
        ) : null}
      </FilterBar>

      {selected.size > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-2 text-sm">
          <span className="font-medium text-amber-950">{selected.size} selected</span>
          <Button type="button" variant="secondary" className="!py-1.5 text-xs">
            Remind applicant
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
        emptyMessage="No draft applications match your filters."
      />
    </>
  )
}
