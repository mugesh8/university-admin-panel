import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Download, Mail, Plus } from 'lucide-react'
import { FilterBar } from '../../components/ui/FilterBar.jsx'
import { MultiSelect } from '../../components/ui/MultiSelect.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { useApplications } from '../../lib/mock-data/applications.js'
import { APPLICATION_PIPELINE_STAGES } from '../../lib/application-pipeline/applicationPipeline.js'
import { exportApplicationsToCsv } from './exportApplicationsCsv.js'
import { fetchApplicationByRowId, listApplications } from '../../lib/api/applicationsApi.js'
import { useAuth } from '../auth/useAuth.js'

export function ApplicationsTablePanel({ showExportExcel = false }) {
  const navigate = useNavigate()
  const { token } = useAuth()
  const mockApplications = useApplications()
  const applicationsPrefixRef = useRef(import.meta.env.VITE_APPLICATIONS_PREFIX || '/api/v1/applications')
  const [allApplications, setAllApplications] = useState(mockApplications)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState([])
  const [countryFilters, setCountryFilters] = useState([])

  const [selected, setSelected] = useState(() => new Set())

  const hasActiveFilters =
    search.trim() !== '' || statusFilters.length > 0 || countryFilters.length > 0

  function getRowStatus(application) {
    return application.status || 'Draft'
  }

  function normalizeBackendStatus(row) {
    const raw = String(row?.current_status || '').trim().toLowerCase()
    if (!raw) return 'Draft'
    if (raw === 'draft') {
      const completed = Number(row?.completed_steps || 0)
      return completed > 0 ? 'Partial Draft' : 'Draft'
    }
    return raw
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  function mapBackendApplicationRow(row) {
    const personal = Array.isArray(row?.personal_details) ? row.personal_details[0] : row?.personal_details
    const admission = Array.isArray(row?.admission_sought) ? row.admission_sought[0] : row?.admission_sought
    const firstName = personal?.first_name || ''
    const surname = personal?.surname || ''
    const fullName = `${firstName} ${surname}`.trim() || row?.application_id || 'Applicant'
    return {
      id: String(row?.application_id || row?.id || ''),
      name: fullName,
      citizenship: personal?.nationality_citizenship || '-',
      status: normalizeBackendStatus(row),
      submittedAt: row?.submitted_at ? String(row.submitted_at).slice(0, 10) : '-',
      assignedOfficer: '-',
      daysInStage: 0,
      program: admission?.program_type || '-',
      intake: admission?.preferred_semester || '-',
      country: personal?.country_of_residence || '-',
      phone: personal?.mobile_phone || '',
      email: personal?.email || '',
      referredBy: row?.lead_source || '-',
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadFromApi() {
      setLoading(true)
      setLoadError('')
      try {
        const response = await listApplications({
          token,
          preferredPrefix: applicationsPrefixRef.current,
          page: 1,
          limit: 100,
        })
        applicationsPrefixRef.current = response.preferredPrefix
        if (cancelled) return
        const enriched = await Promise.all(
          response.data.map(async (row) => {
            if (!row?.id) return row
            try {
              const detail = await fetchApplicationByRowId(row.id, {
                token,
                preferredPrefix: applicationsPrefixRef.current,
                full: true,
              })
              applicationsPrefixRef.current = detail.preferredPrefix
              return detail.application || row
            } catch {
              return row
            }
          }),
        )
        const mapped = enriched.map(mapBackendApplicationRow)
        setAllApplications(mapped)
      } catch (error) {
        if (cancelled) return
        setLoadError(error?.message || 'Failed to load applications from server.')
        setAllApplications(mockApplications)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadFromApi()
    return () => {
      cancelled = true
    }
  }, [token, mockApplications])

  const rows = useMemo(() => {
    let list = [...allApplications]
    if (statusFilters.length > 0) {
      const allow = new Set(statusFilters)
      list = list.filter((a) => allow.has(getRowStatus(a)))
    }
    if (countryFilters.length > 0) {
      const allow = new Set(countryFilters)
      list = list.filter((a) => allow.has(a.country))
    }
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
  }, [allApplications, search, statusFilters, countryFilters])

  function removeFilters() {
    setSearch('')
    setStatusFilters([])
    setCountryFilters([])
  }

  const statuses = [...new Set([...APPLICATION_PIPELINE_STAGES.map((s) => s.displayName), ...allApplications.map((a) => getRowStatus(a))])]
  const countries = [...new Set(allApplications.map((a) => a.country))].sort((a, b) =>
    a.localeCompare(b),
  )

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
      sortValue: (r) => getRowStatus(r),
      render: (r) => <Badge tone="info">{getRowStatus(r)}</Badge>,
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
      {loadError ? (
        <div className="mb-3 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {loadError}
        </div>
      ) : null}
      {showExportExcel ? (
        <div className="mb-4 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => exportApplicationsToCsv(rows)}
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      ) : null}

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
          <MultiSelect
            label="Country"
            options={countries}
            value={countryFilters}
            onChange={setCountryFilters}
            placeholder="All countries"
          />
        </div>
        <div className="w-full min-w-[180px] sm:max-w-[220px]">
          <MultiSelect
            label="Status"
            options={statuses}
            value={statusFilters}
            onChange={setStatusFilters}
            placeholder="All statuses"
          />
        </div>
        {hasActiveFilters ? (
          <Button type="button" variant="secondary" onClick={removeFilters}>
            Remove filters
          </Button>
        ) : null}
        <Button type="button" variant="primary" onClick={() => navigate('/applications/new')}>
          <Plus className="h-4 w-4" />
          Create New Application
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
      {loading ? <p className="mt-2 text-xs text-[var(--color-text-muted)]">Loading applications...</p> : null}
    </>
  )
}
