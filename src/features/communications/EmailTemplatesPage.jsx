import { useMemo, useState } from 'react'
import { Eye, FileText, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { FilterBar } from '../../components/ui/FilterBar.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { useEmailTemplatesStore } from '../../hooks/useEmailTemplatesStore.js'

const textareaClass =
  'min-h-[200px] w-full rounded-xl border border-[#0A1628]/15 bg-white px-3 py-2.5 text-sm text-[#0A1628] placeholder:text-[#0A1628]/45 focus:border-[#D4A843]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/35'

const CATEGORY_OPTIONS = ['Transactional', 'Reminders', 'Interview', 'Decisions', 'Fees', 'Other']

function categoryTone(cat) {
  if (cat === 'Transactional') return 'info'
  if (cat === 'Fees') return 'warning'
  if (cat === 'Decisions') return 'success'
  if (cat === 'Interview') return 'default'
  return 'default'
}

function parseMergeFields(str) {
  return str
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function normalizeMergeToken(f) {
  const s = String(f).trim()
  if (!s) return null
  if (s.startsWith('{{') && s.endsWith('}}')) return s
  return `{{${s.replace(/[{}]/g, '')}}}`
}

function formatMergeFieldsForInput(arr) {
  if (!Array.isArray(arr)) return ''
  return arr.map((f) => String(f).trim()).filter(Boolean).join(', ')
}

function deriveBodyPreview(body) {
  if (!body) return ''
  const t = body.trim()
  if (t.length <= 220) return t
  return `${t.slice(0, 217)}…`
}

function todayYmd() {
  return new Date().toISOString().slice(0, 10)
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

export function EmailTemplatesPage() {
  const { templates, setTemplates } = useEmailTemplatesStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [activeOnly, setActiveOnly] = useState('')

  const [viewTemplate, setViewTemplate] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('Transactional')
  const [formSubject, setFormSubject] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formMergeStr, setFormMergeStr] = useState('')
  const [formActive, setFormActive] = useState(true)

  const categories = useMemo(() => {
    const fromData = [...new Set(templates.map((t) => t.category))].filter(Boolean)
    const merged = [...new Set([...CATEGORY_OPTIONS, ...fromData])].sort()
    return merged
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
          t.category.toLowerCase().includes(q),
      )
    }
    return list.map((t) => ({ ...t, rowKey: t.id }))
  }, [templates, search, category, activeOnly])

  function openAdd() {
    setEditingId(null)
    setFormName('')
    setFormCategory('Transactional')
    setFormSubject('')
    setFormBody('')
    setFormMergeStr('')
    setFormActive(true)
    setFormOpen(true)
  }

  function openEdit(t) {
    setEditingId(t.id)
    setFormName(t.name)
    setFormCategory(t.category)
    setFormSubject(t.subject)
    setFormBody(t.body ?? t.bodyPreview ?? '')
    setFormMergeStr(formatMergeFieldsForInput(t.mergeFields))
    setFormActive(Boolean(t.active))
    setFormOpen(true)
  }

  function saveForm(e) {
    e.preventDefault()
    const name = formName.trim()
    const subject = formSubject.trim()
    const body = formBody.trim()
    if (!name || !subject) return

    const mergeFields = parseMergeFields(formMergeStr).map(normalizeMergeToken).filter(Boolean)
    const bodyPreview = deriveBodyPreview(body)

    if (editingId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                name,
                category: formCategory || 'Other',
                subject,
                body,
                bodyPreview,
                mergeFields: mergeFields.length ? mergeFields : ['{{applicant_name}}'],
                active: formActive,
                lastEdited: todayYmd(),
              }
            : t,
        ),
      )
    } else {
      const id = `t-${Date.now()}`
      setTemplates((prev) => [
        ...prev,
        {
          id,
          name,
          category: formCategory || 'Other',
          subject,
          body,
          bodyPreview,
          mergeFields: mergeFields.length ? mergeFields : ['{{applicant_name}}'],
          active: formActive,
          lastEdited: todayYmd(),
        },
      ])
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

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
            <p className="font-medium text-[var(--color-heading)]">{t.name}</p>
            <p className="line-clamp-2 text-xs text-[var(--color-text-muted)]">{t.bodyPreview}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      sortType: 'string',
      render: (t) => <Badge tone={categoryTone(t.category)}>{t.category}</Badge>,
    },
    {
      key: 'subject',
      header: 'Subject line',
      sortable: true,
      sortType: 'string',
      render: (t) => <span className="text-sm text-[var(--color-text)]">{t.subject}</span>,
    },
    {
      key: 'mergeFields',
      header: 'Merge fields',
      render: (t) => (
        <div className="flex max-w-[14rem] flex-wrap gap-1">
          {t.mergeFields.slice(0, 3).map((f) => (
            <span
              key={f}
              className="rounded-md bg-[var(--color-bg)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-heading)] ring-1 ring-[var(--color-border)]"
            >
              {String(f).replace(/[{}]/g, '')}
            </span>
          ))}
          {t.mergeFields.length > 3 ? (
            <span className="text-xs text-[var(--color-text-muted)]">+{t.mergeFields.length - 3}</span>
          ) : null}
        </div>
      ),
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
      header: 'Last edited',
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
          <Button type="button" variant="secondary" className="!px-2 !py-1.5 text-xs" onClick={() => openEdit(t)}>
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="!px-2 !py-1.5 text-xs text-red-700 hover:bg-red-50"
            onClick={() => setDeleteTarget(t)}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <Card>
        <CardHeader
          title="Library"
          actions={
            <Button type="button" onClick={openAdd}>
              <Plus className="h-4 w-4" aria-hidden />
              New template
            </Button>
          }
        />
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
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
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
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.rowKey}
          pageSize={8}
          emptyMessage="No templates match your filters."
        />
      </Card>

      {viewTemplate ? (
        <ModalBackdrop wide title="View template" onClose={() => setViewTemplate(null)}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Name</p>
              <p className="mt-1 font-medium text-[var(--color-heading)]">{viewTemplate.name}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Category</p>
                <div className="mt-1">
                  <Badge tone={categoryTone(viewTemplate.category)}>{viewTemplate.category}</Badge>
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
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Merge fields</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {viewTemplate.mergeFields.map((f) => (
                  <span
                    key={f}
                    className="rounded-md bg-[var(--color-bg)] px-2 py-0.5 font-mono text-xs text-[var(--color-heading)] ring-1 ring-[var(--color-border)]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Body</p>
              <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-[#0A1628]/10 bg-[var(--color-bg)] p-4 text-sm text-[var(--color-text)]">
                {viewTemplate.body ?? viewTemplate.bodyPreview}
              </pre>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setViewTemplate(null)}>
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const t = viewTemplate
                  setViewTemplate(null)
                  openEdit(t)
                }}
              >
                Edit template
              </Button>
            </div>
          </div>
        </ModalBackdrop>
      ) : null}

      {formOpen ? (
        <ModalBackdrop wide title={editingId ? 'Edit template' : 'New template'} onClose={() => setFormOpen(false)}>
          <form onSubmit={saveForm} className="space-y-4">
            <Input label="Template name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            <Select label="Category" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Input label="Subject line" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} required />
            <div className="w-full">
              <label htmlFor="tmpl-body" className="mb-1.5 block text-sm font-medium text-[var(--color-heading)]">
                Email body
              </label>
              <textarea
                id="tmpl-body"
                className={textareaClass}
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                placeholder="Use merge fields like {{applicant_name}} in the text."
              />
            </div>
            <Input
              label="Merge fields"
              value={formMergeStr}
              onChange={(e) => setFormMergeStr(e.target.value)}
              hint="Comma-separated (e.g. {{applicant_name}}, {{application_id}})"
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-heading)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
              />
              Active (visible in composer & bulk send)
            </label>
            <div className="flex flex-wrap justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? 'Save changes' : 'Create template'}</Button>
            </div>
          </form>
        </ModalBackdrop>
      ) : null}

      {deleteTarget ? (
        <ModalBackdrop title="Delete template?" onClose={() => setDeleteTarget(null)}>
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
        </ModalBackdrop>
      ) : null}
    </div>
  )
}
