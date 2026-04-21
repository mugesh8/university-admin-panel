import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { useAnnouncementsStore } from '../../hooks/useAnnouncementsStore.js'

function ModalBackdrop({ children, onClose, title, narrow }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-modal-title"
        className={`max-h-[min(90vh,640px)] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-[#0A1628]/10 ${
          narrow ? 'max-w-md' : 'max-w-lg'
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#0A1628]/10 px-5 py-4">
          <h2 id="announcement-modal-title" className="text-lg font-semibold text-[var(--color-heading)]">
            {title}
          </h2>
          <button
            type="button"
            className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[#0A1628]/8 hover:text-[var(--color-heading)]"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(min(90vh,640px)-5rem)] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

export function AnnouncementsPage() {
  const { announcements, setAnnouncements } = useAnnouncementsStore()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [title, setTitle] = useState('')
  const [audience, setAudience] = useState('')
  const [active, setActive] = useState(true)

  function openAdd() {
    setEditingId(null)
    setTitle('')
    setAudience('')
    setActive(true)
    setFormOpen(true)
  }

  function openEdit(a) {
    setEditingId(a.id)
    setTitle(a.title)
    setAudience(a.audience)
    setActive(Boolean(a.active))
    setFormOpen(true)
  }

  function saveForm(e) {
    e.preventDefault()
    const t = title.trim()
    const aud = audience.trim()
    if (!t) return

    if (editingId) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === editingId ? { ...a, title: t, audience: aud || '—', active } : a,
        ),
      )
    } else {
      const id = `an-${Date.now()}`
      setAnnouncements((prev) => [...prev, { id, title: t, audience: aud || '—', active }])
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setAnnouncements((prev) => prev.filter((a) => a.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div>
      <PageHeader
        actions={
          <Button type="button" onClick={openAdd}>
            <Plus className="h-4 w-4" aria-hidden />
            New announcement
          </Button>
        }
      />
      <ul className="space-y-3">
        {announcements.length === 0 ? (
          <Card className="py-10 text-center text-sm text-[var(--color-text-muted)]">
            No announcements yet. Create one with <span className="font-medium text-[var(--color-heading)]">New announcement</span>.
          </Card>
        ) : (
          announcements.map((a) => (
            <Card key={a.id} className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[var(--color-heading)]">{a.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{a.audience}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={a.active ? 'success' : 'default'}>{a.active ? 'Active' : 'Archived'}</Badge>
                <Button variant="secondary" type="button" className="!py-1.5 text-xs" onClick={() => openEdit(a)}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="!py-1.5 text-xs text-red-700 hover:bg-red-50"
                  onClick={() => setDeleteTarget(a)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </ul>

      {formOpen ? (
        <ModalBackdrop title={editingId ? 'Edit announcement' : 'New announcement'} onClose={() => setFormOpen(false)}>
          <form onSubmit={saveForm} className="space-y-4">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input
              label="Audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. September 2026 · All"
              hint="Short line shown under the title (intake, scope, etc.)."
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-heading)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Active (visible to applicants)
            </label>
            <div className="flex flex-wrap justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? 'Save changes' : 'Create announcement'}</Button>
            </div>
          </form>
        </ModalBackdrop>
      ) : null}

      {deleteTarget ? (
        <ModalBackdrop narrow title="Delete announcement?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--color-text)]">
            Delete <span className="font-semibold text-[var(--color-heading)]">{deleteTarget.title}</span>? This cannot
            be undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </ModalBackdrop>
      ) : null}
    </div>
  )
}
