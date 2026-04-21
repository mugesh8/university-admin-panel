import { useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { SettingsModalBackdrop } from '../../components/settings/SettingsModal.jsx'
import { useSettingsStore } from '../../hooks/useSettingsStore.js'

const textareaClass =
  'min-h-[160px] w-full rounded-xl border border-[#0A1628]/15 bg-white px-3 py-2.5 text-sm text-[#0A1628] placeholder:text-[#0A1628]/45 focus:border-[#D4A843]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/35'

function parseOptions(text) {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function optionsToText(opts) {
  return Array.isArray(opts) ? opts.join('\n') : ''
}

export function DropdownOptionsPage() {
  const { dropdownCategories, setSettingsState } = useSettingsStore()

  const [viewRow, setViewRow] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [optionsText, setOptionsText] = useState('')

  const rows = useMemo(
    () =>
      dropdownCategories.map((c) => ({
        id: c.id,
        category: c.category,
        description: c.description,
        optionCount: c.options.length,
        optionsPreview: c.options.slice(0, 6).join(', ') + (c.options.length > 6 ? '…' : ''),
        _full: c,
      })),
    [dropdownCategories],
  )

  function openAdd() {
    setEditingId(null)
    setCategory('')
    setDescription('')
    setOptionsText('')
    setFormOpen(true)
  }

  function openEdit(c) {
    setEditingId(c.id)
    setCategory(c.category)
    setDescription(c.description)
    setOptionsText(optionsToText(c.options))
    setFormOpen(true)
  }

  function saveForm(e) {
    e.preventDefault()
    const cat = category.trim()
    if (!cat) return
    const opts = parseOptions(optionsText)
    if (opts.length === 0) return
    const row = {
      category: cat,
      description: description.trim() || '—',
      options: opts,
    }
    if (editingId) {
      setSettingsState((s) => ({
        ...s,
        dropdownCategories: s.dropdownCategories.map((x) => (x.id === editingId ? { ...x, ...row } : x)),
      }))
    } else {
      setSettingsState((s) => ({
        ...s,
        dropdownCategories: [...s.dropdownCategories, { id: `dd_${Date.now()}`, ...row }],
      }))
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setSettingsState((s) => ({
      ...s,
      dropdownCategories: s.dropdownCategories.filter((x) => x.id !== deleteTarget.id),
    }))
    if (viewRow?.id === deleteTarget.id) setViewRow(null)
    setDeleteTarget(null)
  }

  const columns = [
    { key: 'category', header: 'Category', sortable: true, sortType: 'string' },
    { key: 'description', header: 'Description', sortable: true, sortType: 'string' },
    { key: 'optionCount', header: '# Options', sortable: true, sortType: 'number', numeric: true },
    {
      key: 'optionsPreview',
      header: 'Sample values',
      sortable: true,
      sortType: 'string',
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <Button type="button" variant="ghost" className="!px-2 !py-1.5 !text-xs" onClick={() => setViewRow(r._full)}>
            <Eye className="h-3.5 w-3.5" aria-hidden />
            View
          </Button>
          <Button type="button" variant="ghost" className="!px-2 !py-1.5 !text-xs" onClick={() => openEdit(r._full)}>
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="!px-2 !py-1.5 !text-xs text-red-700 hover:bg-red-50"
            onClick={() => setDeleteTarget(r._full)}
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
            Add category
          </Button>
        }
      />
      <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} pageSize={10} />

      {viewRow ? (
        <SettingsModalBackdrop title="Dropdown category" onClose={() => setViewRow(null)} wide>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Category</p>
              <p className="mt-1 font-medium text-[var(--color-heading)]">{viewRow.category}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Description</p>
              <p className="mt-1 text-[var(--color-text)]">{viewRow.description}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Options ({viewRow.options.length})</p>
              <ul className="mt-2 max-h-[240px] list-inside list-disc space-y-1 overflow-y-auto rounded-xl border border-[#0A1628]/10 bg-[var(--color-bg)] p-3">
                {viewRow.options.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          </div>
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
          title={editingId ? 'Edit dropdown category' : 'Add category'}
          onClose={() => setFormOpen(false)}
          wide
        >
          <form onSubmit={saveForm} className="space-y-4">
            <Input label="Category label" value={category} onChange={(e) => setCategory(e.target.value)} required />
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="w-full">
              <label htmlFor="dd-options" className="mb-1.5 block text-sm font-medium text-[var(--color-heading)]">
                Options (one per line)
              </label>
              <textarea
                id="dd-options"
                className={textareaClass}
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder={'Mr\nMrs\nMs\nDr'}
                required
              />
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Each line becomes one selectable value.</p>
            </div>
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
        <SettingsModalBackdrop title="Delete category?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--color-text)]">
            Delete <span className="font-semibold text-[var(--color-heading)]">{deleteTarget.category}</span> and all
            its option values? This cannot be undone.
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
