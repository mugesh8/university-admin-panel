import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { SettingsModalBackdrop } from '../../components/settings/SettingsModal.jsx'
import { useFaqCategoriesStore } from '../../hooks/useFaqCategoriesStore.js'

export function FaqCategoriesPage() {
  const navigate = useNavigate()
  const { faqCategories, loading, saving, error, createCategory, editCategory, removeCategory } =
    useFaqCategoriesStore()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)
  const [formError, setFormError] = useState('')

  const rows = useMemo(
    () =>
      faqCategories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description || '—',
        status: c.active ? 'Active' : 'Hidden',
        _full: c,
      })),
    [faqCategories],
  )

  function openAdd() {
    setEditingId(null)
    setName('')
    setDescription('')
    setActive(true)
    setFormError('')
    setFormOpen(true)
  }

  function openEdit(c) {
    setEditingId(c.id)
    setName(c.name)
    setDescription(c.description || '')
    setActive(Boolean(c.active))
    setFormError('')
    setFormOpen(true)
  }

  async function saveForm(e) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    const duplicate = faqCategories.find(
      (c) => c.id !== editingId && c.name.toLowerCase() === trimmedName.toLowerCase(),
    )
    if (duplicate) {
      setFormError('FAQ category already exists.')
      return
    }

    if (editingId) {
      try {
        await editCategory(editingId, {
          name: trimmedName,
          description: description.trim() || null,
          is_active: active,
        })
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to update FAQ category')
        return
      }
    } else {
      try {
        await createCategory({
          name: trimmedName,
          description: description.trim() || null,
          is_active: active,
          sort_order: faqCategories.length,
        })
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to create FAQ category')
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
    { key: 'description', header: 'Description', sortable: true, sortType: 'string' },
    { key: 'status', header: 'Status', sortable: true, sortType: 'string' },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (r) => (
        <div className="flex flex-wrap gap-1">
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
          <>
            <Button type="button" variant="ghost" onClick={() => navigate('/faq')}>
              Back
            </Button>
            <Button type="button" variant="secondary" onClick={openAdd}>
              <Plus className="h-4 w-4" aria-hidden />
              Add FAQ category
            </Button>
          </>
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        pageSize={10}
        emptyMessage={loading ? 'Loading FAQ categories...' : 'No FAQ categories created yet.'}
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {formOpen ? (
        <SettingsModalBackdrop title={editingId ? 'Edit FAQ category' : 'Add FAQ category'} onClose={() => setFormOpen(false)}>
          <form onSubmit={saveForm} className="space-y-4">
            <Input label="Category name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short internal note"
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-heading)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Active category
            </label>
            <div className="flex justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              {formError ? <p className="mr-auto text-sm text-red-700">{formError}</p> : null}
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {editingId ? 'Save changes' : 'Create category'}
              </Button>
            </div>
          </form>
        </SettingsModalBackdrop>
      ) : null}

      {deleteTarget ? (
        <SettingsModalBackdrop title="Delete FAQ category?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--color-text)]">
            Delete <span className="font-semibold text-[var(--color-heading)]">{deleteTarget.name}</span>? FAQs in this
            category will be moved to <span className="font-semibold text-[var(--color-heading)]">Other</span>.
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
