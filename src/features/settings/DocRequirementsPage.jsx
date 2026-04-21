import { useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { SettingsModalBackdrop } from '../../components/settings/SettingsModal.jsx'
import { useSettingsStore } from '../../hooks/useSettingsStore.js'

export function DocRequirementsPage() {
  const { documentRequirements, setSettingsState } = useSettingsStore()

  const [viewRow, setViewRow] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [name, setName] = useState('')
  const [required, setRequired] = useState(true)
  const [acceptedTypes, setAcceptedTypes] = useState('')
  const [maxSizeMb, setMaxSizeMb] = useState(10)

  function openAdd() {
    setEditingId(null)
    setName('')
    setRequired(true)
    setAcceptedTypes('')
    setMaxSizeMb(10)
    setFormOpen(true)
  }

  function openEdit(r) {
    setEditingId(r.id)
    setName(r.name)
    setRequired(Boolean(r.required))
    setAcceptedTypes(r.acceptedTypes)
    setMaxSizeMb(r.maxSizeMb)
    setFormOpen(true)
  }

  function saveForm(e) {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    const row = {
      name: n,
      required,
      acceptedTypes: acceptedTypes.trim() || 'PDF',
      maxSizeMb: Math.max(1, Number(maxSizeMb) || 10),
    }
    if (editingId) {
      setSettingsState((s) => ({
        ...s,
        documentRequirements: s.documentRequirements.map((x) => (x.id === editingId ? { ...x, ...row } : x)),
      }))
    } else {
      setSettingsState((s) => ({
        ...s,
        documentRequirements: [...s.documentRequirements, { id: `d_${Date.now()}`, ...row }],
      }))
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setSettingsState((s) => ({
      ...s,
      documentRequirements: s.documentRequirements.filter((x) => x.id !== deleteTarget.id),
    }))
    if (viewRow?.id === deleteTarget.id) setViewRow(null)
    setDeleteTarget(null)
  }

  const columns = [
    { key: 'name', header: 'Document', sortable: true, sortType: 'string' },
    {
      key: 'required',
      header: 'Required',
      sortable: true,
      sortType: 'number',
      sortValue: (r) => (r.required ? 1 : 0),
      render: (r) =>
        r.required ? <Badge tone="warning">Required</Badge> : <Badge tone="default">Optional</Badge>,
    },
    { key: 'acceptedTypes', header: 'Accepted types', sortable: true, sortType: 'string' },
    { key: 'maxSizeMb', header: 'Max size (MB)', sortable: true, sortType: 'number', numeric: true },
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
            Add document type
          </Button>
        }
      />
      <DataTable columns={columns} rows={documentRequirements} getRowKey={(r) => r.id} pageSize={10} />

      {viewRow ? (
        <SettingsModalBackdrop title="Document requirement" onClose={() => setViewRow(null)} wide>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Document</dt>
              <dd className="mt-1 font-medium text-[var(--color-heading)]">{viewRow.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Required</dt>
              <dd className="mt-1">
                {viewRow.required ? <Badge tone="warning">Required</Badge> : <Badge tone="default">Optional</Badge>}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Accepted types</dt>
              <dd className="mt-1">{viewRow.acceptedTypes}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Max size</dt>
              <dd className="mt-1">{viewRow.maxSizeMb} MB</dd>
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
        <SettingsModalBackdrop
          title={editingId ? 'Edit document type' : 'Add document type'}
          onClose={() => setFormOpen(false)}
          wide
        >
          <form onSubmit={saveForm} className="space-y-4">
            <Input label="Document name" value={name} onChange={(e) => setName(e.target.value)} required />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-heading)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#0A1628]/25"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
              />
              Required for submission
            </label>
            <Input
              label="Accepted file types"
              value={acceptedTypes}
              onChange={(e) => setAcceptedTypes(e.target.value)}
              hint="e.g. PDF, JPG, PNG"
            />
            <Input
              type="number"
              min={1}
              label="Max file size (MB)"
              value={String(maxSizeMb)}
              onChange={(e) => setMaxSizeMb(Math.max(1, Number(e.target.value) || 1))}
            />
            <div className="flex justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? 'Save' : 'Add'}</Button>
            </div>
          </form>
        </SettingsModalBackdrop>
      ) : null}

      {deleteTarget ? (
        <SettingsModalBackdrop title="Delete document type?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--color-text)]">
            Remove <span className="font-semibold text-[var(--color-heading)]">{deleteTarget.name}</span>? This cannot be
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
