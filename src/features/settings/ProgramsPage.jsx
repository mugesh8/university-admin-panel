import { useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { SettingsModalBackdrop } from '../../components/settings/SettingsModal.jsx'
import { useSettingsStore } from '../../hooks/useSettingsStore.js'

export function ProgramsPage() {
  const { programs, setSettingsState } = useSettingsStore()

  const [viewRow, setViewRow] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [durationYears, setDurationYears] = useState(4)
  const [level, setLevel] = useState('')
  const [capacity, setCapacity] = useState(0)
  const [active, setActive] = useState(true)

  function openAdd() {
    setEditingId(null)
    setName('')
    setCode('')
    setDurationYears(4)
    setLevel('')
    setCapacity(0)
    setActive(true)
    setFormOpen(true)
  }

  function openEdit(r) {
    setEditingId(r.id)
    setName(r.name)
    setCode(r.code)
    setDurationYears(r.durationYears)
    setLevel(r.level)
    setCapacity(r.capacity)
    setActive(Boolean(r.active))
    setFormOpen(true)
  }

  function saveForm(e) {
    e.preventDefault()
    const n = name.trim()
    const c = code.trim()
    if (!n || !c) return
    const row = {
      name: n,
      code: c,
      durationYears: Math.max(0, Number(durationYears) || 0),
      level: level.trim() || '—',
      capacity: Math.max(0, Number(capacity) || 0),
      active,
    }
    if (editingId) {
      setSettingsState((s) => ({
        ...s,
        programs: s.programs.map((p) => (p.id === editingId ? { ...p, ...row } : p)),
      }))
    } else {
      setSettingsState((s) => ({
        ...s,
        programs: [...s.programs, { id: `p_${Date.now()}`, ...row }],
      }))
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setSettingsState((s) => ({
      ...s,
      programs: s.programs.filter((p) => p.id !== deleteTarget.id),
    }))
    if (viewRow?.id === deleteTarget.id) setViewRow(null)
    setDeleteTarget(null)
  }

  const columns = [
    { key: 'name', header: 'Program', sortable: true, sortType: 'string' },
    { key: 'code', header: 'Code', sortable: true, sortType: 'string' },
    { key: 'durationYears', header: 'Duration (yrs)', sortable: true, sortType: 'number', numeric: true },
    { key: 'level', header: 'Level', sortable: true, sortType: 'string' },
    { key: 'capacity', header: 'Capacity', sortable: true, sortType: 'number', numeric: true },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      sortType: 'number',
      sortValue: (r) => (r.active ? 1 : 0),
      render: (r) => (r.active ? <Badge tone="success">Active</Badge> : <Badge tone="warning">Inactive</Badge>),
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
            Add program
          </Button>
        }
      />
      <DataTable columns={columns} rows={programs} getRowKey={(r) => r.id} pageSize={10} />

      {viewRow ? (
        <SettingsModalBackdrop title="Program" onClose={() => setViewRow(null)}>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Name</dt>
              <dd className="mt-1 font-medium text-[var(--color-heading)]">{viewRow.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Code</dt>
              <dd className="mt-1">{viewRow.code}</dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Duration</dt>
                <dd className="mt-1">{viewRow.durationYears} yrs</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Capacity</dt>
                <dd className="mt-1">{viewRow.capacity}</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Level</dt>
              <dd className="mt-1">{viewRow.level}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Status</dt>
              <dd className="mt-1">
                {viewRow.active ? <Badge tone="success">Active</Badge> : <Badge tone="warning">Inactive</Badge>}
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
        <SettingsModalBackdrop title={editingId ? 'Edit program' : 'Add program'} onClose={() => setFormOpen(false)} wide>
          <form onSubmit={saveForm} className="space-y-4">
            <Input label="Program name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} required />
            <Input
              type="number"
              min={0}
              label="Duration (years)"
              value={String(durationYears)}
              onChange={(e) => setDurationYears(Math.max(0, Number(e.target.value) || 0))}
            />
            <Input label="Level" value={level} onChange={(e) => setLevel(e.target.value)} />
            <Input
              type="number"
              min={0}
              label="Capacity"
              value={String(capacity)}
              onChange={(e) => setCapacity(Math.max(0, Number(e.target.value) || 0))}
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-heading)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#0A1628]/25"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Active
            </label>
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
        <SettingsModalBackdrop title="Delete program?" onClose={() => setDeleteTarget(null)}>
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
