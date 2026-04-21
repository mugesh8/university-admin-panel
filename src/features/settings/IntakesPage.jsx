import { useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { SettingsModalBackdrop } from '../../components/settings/SettingsModal.jsx'
import { useSettingsStore } from '../../hooks/useSettingsStore.js'

function statusTone(status) {
  if (status === 'Open') return 'success'
  if (status === 'Planned') return 'info'
  return 'warning'
}

const STATUS_OPTIONS = ['Open', 'Planned', 'Closed']

export function IntakesPage() {
  const { intakes, setSettingsState } = useSettingsStore()

  const [viewRow, setViewRow] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [applicationDeadline, setApplicationDeadline] = useState('')
  const [capacity, setCapacity] = useState(0)
  const [status, setStatus] = useState('Open')

  function openAdd() {
    setEditingId(null)
    setName('')
    setStartDate('')
    setApplicationDeadline('')
    setCapacity(0)
    setStatus('Open')
    setFormOpen(true)
  }

  function openEdit(r) {
    setEditingId(r.id)
    setName(r.name)
    setStartDate(r.startDate)
    setApplicationDeadline(r.applicationDeadline)
    setCapacity(r.capacity)
    setStatus(r.status)
    setFormOpen(true)
  }

  function saveForm(e) {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    const row = {
      name: n,
      startDate: startDate.trim() || '—',
      applicationDeadline: applicationDeadline.trim() || '—',
      capacity: Math.max(0, Number(capacity) || 0),
      status,
    }
    if (editingId) {
      setSettingsState((s) => ({
        ...s,
        intakes: s.intakes.map((x) => (x.id === editingId ? { ...x, ...row } : x)),
      }))
    } else {
      setSettingsState((s) => ({
        ...s,
        intakes: [...s.intakes, { id: `i_${Date.now()}`, ...row }],
      }))
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setSettingsState((s) => ({
      ...s,
      intakes: s.intakes.filter((x) => x.id !== deleteTarget.id),
    }))
    if (viewRow?.id === deleteTarget.id) setViewRow(null)
    setDeleteTarget(null)
  }

  const columns = [
    { key: 'name', header: 'Intake', sortable: true, sortType: 'string' },
    { key: 'startDate', header: 'Start date', sortable: true, sortType: 'date' },
    { key: 'applicationDeadline', header: 'Application deadline', sortable: true, sortType: 'date' },
    { key: 'capacity', header: 'Capacity', sortable: true, sortType: 'number', numeric: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortType: 'string',
      render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <Button type="button" variant="ghost" className="!px-2 !py-1.5 !text-xs" onClick={() => setViewRow(r)}>
            <Eye className="h-3.5 w-3.5" aria-hidden />
            View
          </Button>
          <Button type="button" variant="ghost" className="!px-2 !py-1.5 !text-xs" onClick={() => openEdit(r)}>
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="!px-2 !py-1.5 !text-xs text-red-700 hover:bg-red-50"
            onClick={() => setDeleteTarget(r)}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button type="button" variant="secondary" onClick={openAdd}>
            <Plus className="h-4 w-4" aria-hidden />
            Create intake
          </Button>
        }
      />
      <DataTable columns={columns} rows={intakes} getRowKey={(r) => r.id} pageSize={10} />

      {viewRow ? (
        <SettingsModalBackdrop title="Intake" onClose={() => setViewRow(null)}>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Name</dt>
              <dd className="mt-1 font-medium text-[var(--color-heading)]">{viewRow.name}</dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Start</dt>
                <dd className="mt-1">{viewRow.startDate}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Deadline</dt>
                <dd className="mt-1">{viewRow.applicationDeadline}</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Capacity</dt>
              <dd className="mt-1">{viewRow.capacity}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Status</dt>
              <dd className="mt-1">
                <Badge tone={statusTone(viewRow.status)}>{viewRow.status}</Badge>
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
            <Button type="button" variant="secondary" onClick={() => setViewRow(null)}>
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                const r = viewRow
                setViewRow(null)
                openEdit(r)
              }}
            >
              Edit
            </Button>
          </div>
        </SettingsModalBackdrop>
      ) : null}

      {formOpen ? (
        <SettingsModalBackdrop title={editingId ? 'Edit intake' : 'Create intake'} onClose={() => setFormOpen(false)} wide>
          <form onSubmit={saveForm} className="space-y-4">
            <Input label="Intake name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input
              label="Application deadline"
              type="date"
              value={applicationDeadline}
              onChange={(e) => setApplicationDeadline(e.target.value)}
            />
            <Input
              type="number"
              min={0}
              label="Capacity"
              value={String(capacity)}
              onChange={(e) => setCapacity(Math.max(0, Number(e.target.value) || 0))}
            />
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <div className="flex justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? 'Save' : 'Create'}</Button>
            </div>
          </form>
        </SettingsModalBackdrop>
      ) : null}

      {deleteTarget ? (
        <SettingsModalBackdrop title="Delete intake?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--color-text)]">
            Delete <span className="font-semibold text-[var(--color-heading)]">{deleteTarget.name}</span>? This cannot be
            undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </SettingsModalBackdrop>
      ) : null}
    </div>
  )
}
