import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { SettingsModalBackdrop } from '../../components/settings/SettingsModal.jsx'
import { useSupportTicketCategoriesStore } from '../../hooks/useSupportTicketCategoriesStore.js'

export function SupportTicketCategoriesPage() {
  const navigate = useNavigate()
  const { supportTicketCategories, loading, saving, error, createCategory, editCategory, removeCategory } =
    useSupportTicketCategoriesStore()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [name, setName] = useState('')
  const [active, setActive] = useState(true)
  const [formError, setFormError] = useState('')

  const rows = useMemo(
    () =>
      supportTicketCategories.map((category) => ({
        id: category.id,
        name: category.name,
        status: category.active ? 'Active' : 'Hidden',
        _full: category,
      })),
    [supportTicketCategories],
  )

  function openAdd() {
    setEditingId(null)
    setName('')
    setActive(true)
    setFormError('')
    setFormOpen(true)
  }

  function openEdit(category) {
    setEditingId(category.id)
    setName(category.name)
    setActive(Boolean(category.active))
    setFormError('')
    setFormOpen(true)
  }

  async function saveForm(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    const duplicate = supportTicketCategories.find(
      (category) => category.id !== editingId && category.name.toLowerCase() === trimmedName.toLowerCase(),
    )
    if (duplicate) {
      setFormError('Support ticket category already exists.')
      return
    }

    if (editingId) {
      try {
        await editCategory(editingId, { name: trimmedName, active })
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to update support ticket category')
        return
      }
    } else {
      try {
        await createCategory({ name: trimmedName, active })
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to create support ticket category')
        return
      }
    }
    setFormOpen(false)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await removeCategory(deleteTarget.id)
    } catch {
      return
    }
    setDeleteTarget(null)
  }

  const columns = [
    { key: 'name', header: 'Category', sortable: true, sortType: 'string' },
    { key: 'status', header: 'Status', sortable: true, sortType: 'string' },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <Button type="button" variant="ghost" className="!px-2 !py-1.5 !text-xs" onClick={() => openEdit(row._full)}>
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="!px-2 !py-1.5 !text-xs text-red-700 hover:bg-red-50"
            onClick={() => setDeleteTarget(row._full)}
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
          <>
            <Button type="button" variant="ghost" onClick={() => navigate('/support-tickets')}>
              Back
            </Button>
            <Button type="button" variant="secondary" onClick={openAdd}>
              <Plus className="h-4 w-4" aria-hidden />
              Add support ticket category
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        pageSize={10}
        emptyMessage={loading ? 'Loading support ticket categories...' : 'No support ticket categories created yet.'}
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {formOpen ? (
        <SettingsModalBackdrop
          title={editingId ? 'Edit support ticket category' : 'Add support ticket category'}
          onClose={() => setFormOpen(false)}
        >
          <form onSubmit={saveForm} className="space-y-4">
            <Input label="Category name" value={name} onChange={(event) => setName(event.target.value)} required />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-heading)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
              />
              Active category
            </label>
            <div className="flex justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              {formError ? <p className="mr-auto text-sm text-red-700">{formError}</p> : null}
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>{editingId ? 'Save changes' : 'Create category'}</Button>
            </div>
          </form>
        </SettingsModalBackdrop>
      ) : null}

      {deleteTarget ? (
        <SettingsModalBackdrop title="Delete support ticket category?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--color-text)]">
            Delete <span className="font-semibold text-[var(--color-heading)]">{deleteTarget.name}</span>?
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete} disabled={saving}>
              Delete
            </Button>
          </div>
        </SettingsModalBackdrop>
      ) : null}
    </div>
  )
}
