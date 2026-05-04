import { useMemo, useState } from 'react'
import { Eye, MessageSquare, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { FilterBar } from '../../components/ui/FilterBar.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { useSupportTicketsStore } from '../../hooks/useSupportTicketsStore.js'
import { useSupportTicketCategoriesStore } from '../../hooks/useSupportTicketCategoriesStore.js'
import { sendSupportTicketReplyEmail } from '../../lib/api/supportTicketsApi.js'

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
]

const replyTextareaClass =
  'min-h-[100px] w-full rounded-xl border border-[#0A1628]/15 bg-white px-3 py-2.5 text-sm text-[#0A1628] placeholder:text-[#0A1628]/45 focus:border-[#D4A843]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/35'

function statusTone(s) {
  if (s === 'open') return 'warning'
  if (s === 'resolved') return 'success'
  if (s === 'pending') return 'info'
  return 'default'
}

function formatWhen(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function statusLabel(status) {
  if (status === 'resolved') return 'Resolved'
  if (status === 'pending') return 'Pending'
  return 'Open'
}

function ModalBackdrop({ children, onClose, title, wide }) {
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
        aria-labelledby="support-modal-title"
        className={`max-h-[min(92vh,720px)] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-[#0A1628]/10 ${
          wide ? 'max-w-2xl' : 'max-w-lg'
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#0A1628]/10 px-5 py-4">
          <h2 id="support-modal-title" className="text-lg font-semibold text-[var(--color-heading)]">
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
        <div className="max-h-[calc(min(92vh,720px)-5rem)] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

export function SupportTicketsPage() {
  const navigate = useNavigate()
  const { tickets, loading, saving, error, refreshTickets, applyTicketPatch, removeTicket } = useSupportTicketsStore()
  const { supportTicketCategories } = useSupportTicketCategoriesStore()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const [detailId, setDetailId] = useState(null)
  const [replyDraft, setReplyDraft] = useState('')
  const [replySending, setReplySending] = useState(false)
  const [replyError, setReplyError] = useState('')
  const [replyNotice, setReplyNotice] = useState('')
  const [editTarget, setEditTarget] = useState(null)
  const [editStatus, setEditStatus] = useState('open')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const categories = useMemo(() => {
    const supportCategoryNames = supportTicketCategories
      .filter((category) => category.active)
      .map((category) => category.name)
      .filter(Boolean)
    const fromData = [...new Set(tickets.map((t) => t.category))].filter(Boolean)
    return [...new Set([...supportCategoryNames, ...fromData])].sort()
  }, [supportTicketCategories, tickets])

  const detailTicket = useMemo(() => tickets.find((t) => t.id === detailId) ?? null, [tickets, detailId])

  const filtered = useMemo(() => {
    let list = [...tickets]
    if (filterStatus) list = list.filter((t) => t.status === filterStatus)
    if (filterCategory) list = list.filter((t) => t.category === filterCategory)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          String(t.applicantEmail || '').toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      )
    }
    return list
  }, [tickets, search, filterStatus, filterCategory])

  function openDetail(id) {
    setDetailId(id)
    setReplyDraft('')
    setReplyError('')
    setReplyNotice('')
  }

  function closeDetail() {
    setDetailId(null)
    setReplyDraft('')
    setReplyError('')
    setReplyNotice('')
  }

  function openEdit(ticket) {
    setEditTarget(ticket)
    setEditStatus(ticket.status || 'open')
  }

  async function saveEditStatus(event) {
    event.preventDefault()
    if (!editTarget) return
    const statusValue = editStatus === 'resolved' ? 'Resolved' : editStatus === 'pending' ? 'In progress' : 'Open'
    try {
      await applyTicketPatch(editTarget.id, { status: statusValue })
      setEditTarget(null)
    } catch {
      // error is shown from store state
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await removeTicket(deleteTarget.id)
    } catch {
      return
    }
    if (detailId === deleteTarget.id) closeDetail()
    if (editTarget?.id === deleteTarget.id) setEditTarget(null)
    setDeleteTarget(null)
  }

  async function sendReply(e) {
    e.preventDefault()
    if (!detailTicket || !replyDraft.trim()) return
    const recipientEmail = String(detailTicket.applicantEmail || '').trim()
    if (!recipientEmail) {
      setReplyError('Applicant email is missing for this ticket.')
      return
    }

    const body = replyDraft.trim()
    setReplySending(true)
    setReplyError('')
    setReplyNotice('')
    try {
      await sendSupportTicketReplyEmail({
        ticketId: detailTicket.id,
        body,
      })
      await refreshTickets()
      setReplyDraft('')
      setReplyNotice(`Reply emailed to ${recipientEmail}.`)
    } catch (error) {
      setReplyError(error instanceof Error ? error.message : 'Failed to send reply email.')
    } finally {
      setReplySending(false)
    }
  }

  return (
    <div>
      <PageHeader
        actions={
          <Button type="button" onClick={() => navigate('/support-tickets/categories')}>
            <Plus className="h-4 w-4" aria-hidden />
            Add support ticket category
          </Button>
        }
      />

      <FilterBar className="mb-4 !shadow-none">
        <div className="min-w-[200px] flex-1">
          <Input
            label="Search"
            placeholder="ID, subject, email, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="min-w-[160px]">
          <Select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[160px]">
          <Select label="Category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </FilterBar>

      <div className="space-y-3">
        {loading ? (
          <Card className="py-10 text-center text-sm text-[var(--color-text-muted)]">Loading tickets...</Card>
        ) : filtered.length === 0 ? (
          <Card className="py-10 text-center text-sm text-[var(--color-text-muted)]">
            No tickets match your filters.
          </Card>
        ) : (
          filtered.map((t) => (
            <Card key={t.id} className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-[var(--color-text-muted)]">{t.id}</p>
                <h3 className="font-semibold text-[var(--color-heading)]">{t.subject}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {t.applicantEmail} · {t.category} · Updated {formatWhen(t.updatedAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={statusTone(t.status)}>{statusLabel(t.status)}</Badge>
                <Button type="button" variant="ghost" className="!py-1.5 text-xs" onClick={() => openDetail(t.id)}>
                  <Eye className="h-3.5 w-3.5" aria-hidden />
                  View
                </Button>
                <Button variant="secondary" type="button" className="!py-1.5 text-xs" onClick={() => openDetail(t.id)}>
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                  Reply
                </Button>
                <Button type="button" variant="secondary" className="!py-1.5 text-xs" onClick={() => openEdit(t)}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="!py-1.5 text-xs text-red-700 hover:bg-red-50"
                  onClick={() => setDeleteTarget(t)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      {detailTicket ? (
        <ModalBackdrop wide title={`Ticket ${detailTicket.id}`} onClose={closeDetail}>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-[var(--color-heading)]">{detailTicket.subject}</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {detailTicket.applicantEmail} · {detailTicket.category}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={statusTone(detailTicket.status)}>{statusLabel(detailTicket.status)}</Badge>
                <span className="text-xs text-[var(--color-text-muted)]">Last updated {formatWhen(detailTicket.updatedAt)}</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Conversation
              </p>
              <div className="max-h-[220px] space-y-2 overflow-y-auto rounded-xl border border-[#0A1628]/10 bg-[var(--color-bg)] p-3">
                {detailTicket.messages?.length ? (
                  detailTicket.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        m.from === 'admin'
                          ? 'ml-4 border border-[#D4A843]/30 bg-[#D4A843]/8'
                          : 'mr-4 border border-[#0A1628]/10 bg-white'
                      }`}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        {m.from === 'admin' ? 'Staff' : 'Applicant'} · {formatWhen(m.sentAt)}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[var(--color-text)]">{m.body}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)]">No messages yet. Send a reply below.</p>
                )}
              </div>
            </div>

            <form onSubmit={sendReply} className="space-y-2 border-t border-[#0A1628]/10 pt-4">
              <label htmlFor="reply-body" className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Reply to applicant
              </label>
              <p className="text-xs text-[var(--color-text-muted)]">
                This reply will be emailed to <span className="font-medium text-[var(--color-heading)]">{detailTicket.applicantEmail || '—'}</span>.
              </p>
              <textarea
                id="reply-body"
                className={replyTextareaClass}
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                placeholder="Type your reply…"
              />
              {replyError ? <p className="text-xs text-red-700">{replyError}</p> : null}
              {replyNotice ? <p className="text-xs text-emerald-700">{replyNotice}</p> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={closeDetail}>
                  Close
                </Button>
                <Button type="submit" disabled={!replyDraft.trim() || replySending || saving}>
                  {replySending ? 'Sending…' : 'Send reply'}
                </Button>
              </div>
            </form>
          </div>
        </ModalBackdrop>
      ) : null}

      {editTarget ? (
        <ModalBackdrop title={`Edit ticket ${editTarget.id}`} onClose={() => setEditTarget(null)}>
          <form onSubmit={saveEditStatus} className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              {editTarget.subject} · {editTarget.applicantEmail}
            </p>
            <Select label="Status" value={editStatus} onChange={(event) => setEditStatus(event.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <div className="flex justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              <Button type="button" variant="secondary" onClick={() => setEditTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                Save
              </Button>
            </div>
          </form>
        </ModalBackdrop>
      ) : null}

      {deleteTarget ? (
        <ModalBackdrop title="Delete ticket?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--color-text)]">
            Delete ticket <span className="font-mono font-semibold text-[var(--color-heading)]">{deleteTarget.id}</span>{' '}
            ({deleteTarget.subject})? This will be deleted permanently.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete} disabled={saving}>
              Delete
            </Button>
          </div>
        </ModalBackdrop>
      ) : null}
    </div>
  )
}
