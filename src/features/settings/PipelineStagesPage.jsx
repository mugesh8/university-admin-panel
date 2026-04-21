import { useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { SettingsModalBackdrop } from '../../components/settings/SettingsModal.jsx'
import { useSettingsStore } from '../../hooks/useSettingsStore.js'

export function PipelineStagesPage() {
  const { pipelineStages, setSettingsState } = useSettingsStore()

  const [viewRow, setViewRow] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [order, setOrder] = useState(1)
  const [stageKey, setStageKey] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [slaDays, setSlaDays] = useState('')
  const [notificationTemplate, setNotificationTemplate] = useState('')
  const [active, setActive] = useState(true)

  function openAdd() {
    setEditingId(null)
    const nextOrder =
      pipelineStages.length > 0 ? Math.max(...pipelineStages.map((s) => s.order)) + 1 : 1
    setOrder(nextOrder)
    setStageKey('')
    setDisplayName('')
    setSlaDays('')
    setNotificationTemplate('')
    setActive(true)
    setFormOpen(true)
  }

  function openEdit(r) {
    setEditingId(r.id)
    setOrder(r.order)
    setStageKey(r.stageKey)
    setDisplayName(r.displayName)
    setSlaDays(r.slaDays === null || r.slaDays === undefined ? '' : String(r.slaDays))
    setNotificationTemplate(r.notificationTemplate === '—' ? '' : r.notificationTemplate)
    setActive(Boolean(r.active))
    setFormOpen(true)
  }

  function saveForm(e) {
    e.preventDefault()
    const dn = displayName.trim()
    const sk = stageKey.trim()
    if (!dn || !sk) return
    let sla = null
    if (slaDays.trim() !== '') {
      const n = Number(slaDays)
      sla = Number.isFinite(n) ? Math.max(0, n) : null
    }
    const row = {
      order: Math.max(1, Number(order) || 1),
      stageKey: sk.replace(/\s+/g, '_').toLowerCase(),
      displayName: dn,
      slaDays: sla,
      notificationTemplate: notificationTemplate.trim() || '—',
      active,
    }
    if (editingId) {
      setSettingsState((s) => ({
        ...s,
        pipelineStages: s.pipelineStages.map((x) => (x.id === editingId ? { ...x, ...row } : x)),
      }))
    } else {
      setSettingsState((s) => ({
        ...s,
        pipelineStages: [...s.pipelineStages, { id: `s_${Date.now()}`, ...row }],
      }))
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setSettingsState((s) => ({
      ...s,
      pipelineStages: s.pipelineStages.filter((x) => x.id !== deleteTarget.id),
    }))
    if (viewRow?.id === deleteTarget.id) setViewRow(null)
    setDeleteTarget(null)
  }

  const columns = [
    { key: 'order', header: 'Order', sortable: true, sortType: 'number', numeric: true },
    { key: 'stageKey', header: 'Stage key', sortable: true, sortType: 'string' },
    { key: 'displayName', header: 'Display name', sortable: true, sortType: 'string' },
    {
      key: 'slaDays',
      header: 'SLA (days)',
      sortable: true,
      sortType: 'number',
      sortValue: (r) => r.slaDays ?? -1,
      render: (r) => <span className="tabular-nums">{r.slaDays ?? '—'}</span>,
    },
    {
      key: 'notificationTemplate',
      header: 'Notification template',
      sortable: true,
      sortType: 'string',
    },
    {
      key: 'active',
      header: 'Active',
      sortable: true,
      sortType: 'number',
      sortValue: (r) => (r.active ? 1 : 0),
      render: (r) => (r.active ? <Badge tone="success">Yes</Badge> : <Badge tone="warning">No</Badge>),
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
            Add stage
          </Button>
        }
      />
      <DataTable columns={columns} rows={pipelineStages} getRowKey={(r) => r.id} pageSize={12} />

      {viewRow ? (
        <SettingsModalBackdrop title="Pipeline stage" onClose={() => setViewRow(null)} wide>
          <dl className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Order</dt>
                <dd className="mt-1">{viewRow.order}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Active</dt>
                <dd className="mt-1">{viewRow.active ? <Badge tone="success">Yes</Badge> : <Badge tone="warning">No</Badge>}</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Stage key</dt>
              <dd className="mt-1 font-mono text-xs">{viewRow.stageKey}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Display name</dt>
              <dd className="mt-1 font-medium text-[var(--color-heading)]">{viewRow.displayName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">SLA (days)</dt>
              <dd className="mt-1">{viewRow.slaDays ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Notification template</dt>
              <dd className="mt-1">{viewRow.notificationTemplate}</dd>
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
        <SettingsModalBackdrop title={editingId ? 'Edit stage' : 'Add stage'} onClose={() => setFormOpen(false)} wide>
          <form onSubmit={saveForm} className="space-y-4">
            <Input
              type="number"
              min={1}
              label="Order"
              value={String(order)}
              onChange={(e) => setOrder(Math.max(1, Number(e.target.value) || 1))}
            />
            <Input
              label="Stage key"
              value={stageKey}
              onChange={(e) => setStageKey(e.target.value)}
              hint="Lowercase, use underscores (e.g. under_review)"
              required
            />
            <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            <Input
              label="SLA (days)"
              value={slaDays}
              onChange={(e) => setSlaDays(e.target.value)}
              hint="Leave empty if not applicable"
            />
            <Input
              label="Notification template"
              value={notificationTemplate}
              onChange={(e) => setNotificationTemplate(e.target.value)}
              hint="Email template name or —"
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
              <Button type="submit">{editingId ? 'Save' : 'Add'}</Button>
            </div>
          </form>
        </SettingsModalBackdrop>
      ) : null}

      {deleteTarget ? (
        <SettingsModalBackdrop title="Delete stage?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--color-text)]">
            Delete <span className="font-semibold text-[var(--color-heading)]">{deleteTarget.displayName}</span>? This
            cannot be undone.
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
