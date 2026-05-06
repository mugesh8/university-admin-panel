import { useCallback, useMemo, useState } from 'react'
import { ExternalLink, Eye, FileText, Pencil, Plus, RefreshCw, Send, Trash2, X } from 'lucide-react'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { FilterBar } from '../../components/ui/FilterBar.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { useEmailTemplatesStore } from '../../hooks/useEmailTemplatesStore.js'
import { useAuth } from '../auth/useAuth.js'
import { sendBrevoTemplateEmail } from '../../lib/api/brevoApi.js'

const CATEGORY_OPTIONS = ['Transactional', 'Reminders', 'Interview', 'Decisions', 'Fees', 'Other']

function categoryTone(cat) {
  if (cat === 'Transactional') return 'info'
  if (cat === 'Fees') return 'warning'
  if (cat === 'Decisions') return 'success'
  if (cat === 'Interview') return 'default'
  return 'default'
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
        aria-labelledby="email-template-modal-title"
        className={`max-h-[min(90vh,880px)] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-[#0A1628]/10 ${
          wide ? 'max-w-3xl' : 'max-w-lg'
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#0A1628]/10 px-5 py-4">
          <h2 id="email-template-modal-title" className="text-lg font-semibold text-[var(--color-heading)]">
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
        <div className="max-h-[calc(min(90vh,880px)-5rem)] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Quick-send modal                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

function QuickSendModal({ template, onClose, token }) {
  const [toEmail, setToEmail] = useState('')
  const [toName, setToName] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null) // { ok, message }

  async function handleSend(e) {
    e.preventDefault()
    if (!toEmail.trim()) return
    setSending(true)
    setResult(null)
    try {
      await sendBrevoTemplateEmail(token, {
        template_id: template.brevoId,
        to: toEmail.trim(),
        to_name: toName.trim() || undefined,
      })
      setResult({ ok: true, message: `Email sent to ${toEmail.trim()} ✓` })
    } catch (err) {
      setResult({ ok: false, message: err.message || 'Failed to send email' })
    } finally {
      setSending(false)
    }
  }

  return (
    <ModalBackdrop title={`Send: ${template.name}`} onClose={onClose}>
      {result ? (
        <div className="space-y-4">
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              result.ok
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                : 'bg-red-50 text-red-800 ring-1 ring-red-200'
            }`}
          >
            {result.message}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setResult(null)}>
              Send another
            </Button>
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            This will send Brevo template{' '}
            <span className="font-semibold text-[var(--color-heading)]">#{template.brevoId}</span> directly via Brevo.
            Merge variables (applicant name, etc.) are resolved on the server.
          </p>
          <Input
            label="Recipient email"
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            placeholder="student@example.com"
            required
          />
          <Input
            label="Recipient name (optional)"
            value={toName}
            onChange={(e) => setToName(e.target.value)}
            placeholder="e.g. John Doe"
          />
          <div className="flex flex-wrap justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
            <Button type="submit" disabled={sending || !toEmail.trim()}>
              <Send className="h-4 w-4" aria-hidden />
              {sending ? 'Sending…' : 'Send email'}
            </Button>
          </div>
        </form>
      )}
    </ModalBackdrop>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main page                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function EmailTemplatesPage() {
  const { token } = useAuth()
  const { templates, loading, error, refresh, isBrevoMode } = useEmailTemplatesStore()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [activeOnly, setActiveOnly] = useState('')

  const [viewTemplate, setViewTemplate] = useState(null)
  const [quickSendTemplate, setQuickSendTemplate] = useState(null)

  const categories = useMemo(() => {
    const fromData = [...new Set(templates.map((t) => t.category))].filter(Boolean)
    return [...new Set([...CATEGORY_OPTIONS, ...fromData])].sort()
  }, [templates])

  const rows = useMemo(() => {
    let list = [...templates]
    if (category) list = list.filter((t) => t.category === category)
    if (activeOnly === 'yes') list = list.filter((t) => t.active)
    if (activeOnly === 'no') list = list.filter((t) => !t.active)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q),
      )
    }
    return list.map((t) => ({ ...t, rowKey: t.id }))
  }, [templates, search, category, activeOnly])

  const columns = [
    {
      key: 'name',
      header: 'Template',
      sortable: true,
      sortType: 'string',
      render: (t) => (
        <div className="flex min-w-0 items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-[var(--color-heading)]">{t.name}</p>
              {t.isBrevoTemplate && (
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 ring-1 ring-indigo-200">
                  Brevo #{t.brevoId}
                </span>
              )}
            </div>
            <p className="line-clamp-2 text-xs text-[var(--color-text-muted)]">{t.bodyPreview}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category / Tag',
      sortable: true,
      sortType: 'string',
      render: (t) => <Badge tone={categoryTone(t.category)}>{t.category || '—'}</Badge>,
    },
    {
      key: 'subject',
      header: 'Subject line',
      sortable: true,
      sortType: 'string',
      render: (t) => <span className="text-sm text-[var(--color-text)]">{t.subject}</span>,
    },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      sortType: 'string',
      render: (t) => <Badge tone={t.active ? 'success' : 'default'}>{t.active ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'lastEdited',
      header: 'Last modified',
      sortable: true,
      sortType: 'date',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t) => (
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            className="!px-2 !py-1.5 text-xs"
            onClick={() => setViewTemplate(t)}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden />
            View
          </Button>
          {t.isBrevoTemplate && (
            <Button
              type="button"
              variant="secondary"
              className="!px-2 !py-1.5 text-xs"
              onClick={() => setQuickSendTemplate(t)}
            >
              <Send className="h-3.5 w-3.5" aria-hidden />
              Send
            </Button>
          )}
          {t.isBrevoTemplate && (
            <a
              href={`https://app.brevo.com/template/edit/${t.brevoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-bg)]"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Edit in Brevo
            </a>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <Card>
        <CardHeader
          title="Template Library"
          actions={
            <div className="flex items-center gap-2">
              {isBrevoMode && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => refresh()}
                  disabled={loading}
                  title="Refresh from Brevo"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
                  Refresh
                </Button>
              )}
              {isBrevoMode && (
                <a
                  href="https://app.brevo.com/template/list"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  New template in Brevo
                </a>
              )}
            </div>
          }
        />

        {/* Brevo mode banner */}
        {isBrevoMode && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800 ring-1 ring-indigo-200">
            <span className="font-semibold">Brevo connected.</span>
            <span>Showing real templates from your Brevo account. Edit designs directly in Brevo.</span>
            <a
              href="https://app.brevo.com/template/list"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 font-semibold hover:underline"
            >
              Open Brevo <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <FilterBar className="mb-4 !shadow-none">
          <div className="min-w-[200px] flex-1">
            <Input
              label="Search"
              placeholder="Template name or subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="min-w-[180px]">
            <Select label="Category / Tag" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-[160px]">
            <Select label="Visibility" value={activeOnly} onChange={(e) => setActiveOnly(e.target.value)}>
              <option value="">All</option>
              <option value="yes">Active only</option>
              <option value="no">Inactive only</option>
            </Select>
          </div>
        </FilterBar>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
              <p className="text-sm text-[var(--color-text-muted)]">Loading Brevo templates…</p>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            getRowKey={(r) => r.rowKey}
            pageSize={10}
            emptyMessage={
              isBrevoMode
                ? 'No active templates found in your Brevo account. Create one in Brevo and click Refresh.'
                : 'No templates match your filters.'
            }
          />
        )}
      </Card>

      {/* View modal */}
      {viewTemplate ? (
        <ModalBackdrop wide title="View template" onClose={() => setViewTemplate(null)}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Name</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="font-medium text-[var(--color-heading)]">{viewTemplate.name}</p>
                {viewTemplate.isBrevoTemplate && (
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-200">
                    Brevo #{viewTemplate.brevoId}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Category / Tag</p>
                <div className="mt-1">
                  <Badge tone={categoryTone(viewTemplate.category)}>{viewTemplate.category || '—'}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Status</p>
                <div className="mt-1">
                  <Badge tone={viewTemplate.active ? 'success' : 'default'}>
                    {viewTemplate.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Subject</p>
              <p className="mt-1 text-sm text-[var(--color-text)]">{viewTemplate.subject}</p>
            </div>
            {viewTemplate.isBrevoTemplate && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Preview (plain text)</p>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-[#0A1628]/10 bg-[var(--color-bg)] p-4 text-sm text-[var(--color-text)]">
                  {viewTemplate.bodyPreview || '(HTML email — preview not available here. View full template in Brevo.)'}
                </pre>
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setViewTemplate(null)}>
                Close
              </Button>
              {viewTemplate.isBrevoTemplate && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setViewTemplate(null)
                      setQuickSendTemplate(viewTemplate)
                    }}
                  >
                    <Send className="h-4 w-4" aria-hidden />
                    Quick send
                  </Button>
                  <a
                    href={`https://app.brevo.com/template/edit/${viewTemplate.brevoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Edit in Brevo
                  </a>
                </>
              )}
            </div>
          </div>
        </ModalBackdrop>
      ) : null}

      {/* Quick-send modal */}
      {quickSendTemplate ? (
        <QuickSendModal
          template={quickSendTemplate}
          token={token}
          onClose={() => setQuickSendTemplate(null)}
        />
      ) : null}
    </div>
  )
}
