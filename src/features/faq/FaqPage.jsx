import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { FilterBar } from '../../components/ui/FilterBar.jsx'
import { useFaqItemsStore } from '../../hooks/useFaqItemsStore.js'
import { useFaqCategoriesStore } from '../../hooks/useFaqCategoriesStore.js'
import { sanitizeFaqHtml, stripHtml } from '../../lib/faqContent.js'

const formStepOptions = [
  { key: 'personalDetails', label: 'Personal Details' },
  { key: 'emergencyContact', label: 'Emergency Contact' },
  { key: 'academicBackground', label: 'Academic Background' },
  { key: 'experienceMotivation', label: 'Experience & Motivation' },
  { key: 'disclosures', label: 'Disclosures' },
  { key: 'documents', label: 'Documents' },
  { key: 'financialSupport', label: 'Financial Support' },
  { key: 'reviewSubmit', label: 'Review & Submit' },
]

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
        aria-labelledby="faq-modal-title"
        className={`max-h-[min(90vh,720px)] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-[#0A1628]/10 ${
          wide ? 'max-w-2xl' : 'max-w-lg'
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#0A1628]/10 px-5 py-4">
          <h2 id="faq-modal-title" className="text-lg font-semibold text-[var(--color-heading)]">
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
        <div className="max-h-[calc(min(90vh,720px)-5rem)] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

function RichTextEditor({ value, onChange }) {
  const safeHtml = sanitizeFaqHtml(value)
  function applyCommand(command, argument = null) {
    document.execCommand(command, false, argument)
  }

  function handleLink() {
    const url = window.prompt('Enter URL (https://...)')
    if (!url) return
    applyCommand('createLink', url.trim())
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" className="!py-1.5 !text-xs" onClick={() => applyCommand('bold')}>
          Bold
        </Button>
        <Button type="button" variant="secondary" className="!py-1.5 !text-xs" onClick={() => applyCommand('italic')}>
          Italic
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="!py-1.5 !text-xs"
          onClick={() => applyCommand('insertUnorderedList')}
        >
          Bullet List
        </Button>
        <Button type="button" variant="secondary" className="!py-1.5 !text-xs" onClick={handleLink}>
          Link
        </Button>
      </div>
      <div
        contentEditable
        suppressContentEditableWarning
        className="min-h-[180px] w-full rounded-xl border border-[#0A1628]/15 bg-white px-3 py-2.5 text-sm text-[#0A1628] focus:border-[#D4A843]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/35"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
      />
    </div>
  )
}

export function FaqPage() {
  const navigate = useNavigate()
  const { faqItems, loading, saving, error, createFaqItem, editFaqItem, removeFaqItem } = useFaqItemsStore()
  const { faqCategories } = useFaqCategoriesStore()

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [activeOnly, setActiveOnly] = useState('')

  const [previewItem, setPreviewItem] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [formCategory, setFormCategory] = useState('Admissions')
  const [formQuestion, setFormQuestion] = useState('')
  const [formAnswer, setFormAnswer] = useState('')
  const [formContextSteps, setFormContextSteps] = useState([])
  const [formActive, setFormActive] = useState(true)
  const [formError, setFormError] = useState('')

  const categories = useMemo(() => {
    return faqCategories.filter((c) => c.active).map((c) => c.name).filter(Boolean)
  }, [faqCategories])

  const filtered = useMemo(() => {
    let list = [...faqItems]
    if (filterCategory) list = list.filter((f) => f.category === filterCategory)
    if (activeOnly === 'yes') list = list.filter((f) => f.active)
    if (activeOnly === 'no') list = list.filter((f) => !f.active)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          stripHtml(f.answer || '').toLowerCase().includes(q) ||
          (f.contextSteps || []).some((step) => String(step).toLowerCase().includes(q)),
      )
    }
    return list
  }, [faqItems, search, filterCategory, activeOnly])

  function openAdd() {
    setEditingId(null)
    setFormCategory(categories[0] || '')
    setFormQuestion('')
    setFormAnswer('')
    setFormContextSteps([])
    setFormActive(true)
    setFormError('')
    setFormOpen(true)
  }

  function openEdit(f) {
    setEditingId(f.id)
    setFormCategory(f.category)
    setFormQuestion(f.question)
    setFormAnswer(f.answer ?? '')
    setFormContextSteps(Array.isArray(f.contextSteps) ? f.contextSteps : [])
    setFormActive(Boolean(f.active))
    setFormError('')
    setFormOpen(true)
  }

  async function saveForm(e) {
    e.preventDefault()
    const question = formQuestion.trim()
    const answer = sanitizeFaqHtml(formAnswer)
    if (!question || !answer) return
    const matchedCategory = faqCategories.find((c) => c.name === formCategory)

    if (editingId) {
      try {
        await editFaqItem(editingId, {
          category_id: matchedCategory?.id,
          category: formCategory || 'General',
          question,
          answer,
          context_steps: formContextSteps,
          is_published: formActive,
        })
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to update FAQ')
        return
      }
    } else {
      try {
        await createFaqItem({
          category_id: matchedCategory?.id,
          category: formCategory || 'General',
          question,
          answer,
          context_steps: formContextSteps,
          sort_order: faqItems.length,
          is_published: formActive,
        })
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to create FAQ')
        return
      }
    }
    setFormOpen(false)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await removeFaqItem(deleteTarget.id)
    } catch {
      return
    }
    if (previewItem?.id === deleteTarget.id) setPreviewItem(null)
    setDeleteTarget(null)
  }

  async function moveFaq(item, direction) {
    const currentIndex = faqItems.findIndex((entry) => entry.id === item.id)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= faqItems.length) return
    const targetItem = faqItems[targetIndex]
    try {
      await editFaqItem(item.id, { sort_order: targetItem.sortOrder })
      await editFaqItem(targetItem.id, { sort_order: item.sortOrder })
    } catch {
      // store already exposes error state
    }
  }

  return (
    <div>
      <PageHeader
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => navigate('/faq/categories')}>
              <Plus className="h-4 w-4" aria-hidden />
              Add FAQ category
            </Button>
            <Button type="button" onClick={openAdd}>
              <Plus className="h-4 w-4" aria-hidden />
              Add FAQ
            </Button>
          </>
        }
      />

      <FilterBar className="mb-4 !shadow-none">
        <div className="min-w-[200px] flex-1">
          <Input
            label="Search"
            placeholder="Question, category, answer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
        <div className="min-w-[160px]">
          <Select label="Status" value={activeOnly} onChange={(e) => setActiveOnly(e.target.value)}>
            <option value="">All</option>
            <option value="yes">Published</option>
            <option value="no">Hidden</option>
          </Select>
        </div>
      </FilterBar>

      <ul className="space-y-3">
        {loading ? (
          <Card className="py-10 text-center text-sm text-[var(--color-text-muted)]">Loading FAQs...</Card>
        ) : filtered.length === 0 ? (
          <Card className="py-10 text-center text-sm text-[var(--color-text-muted)]">
            No FAQs match your filters.
          </Card>
        ) : (
          filtered.map((f) => (
            <Card key={f.id} className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Badge tone="info">{f.category}</Badge>
                <h3 className="mt-2 font-semibold text-[var(--color-heading)]">{f.question}</h3>
                {Array.isArray(f.contextSteps) && f.contextSteps.length > 0 ? (
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">Shown on steps: {f.contextSteps.join(', ')}</p>
                ) : null}
                {!f.active ? (
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">Hidden from applicants</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" className="!py-1.5 text-xs" onClick={() => moveFaq(f, 'up')}>
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                  Up
                </Button>
                <Button type="button" variant="secondary" className="!py-1.5 text-xs" onClick={() => moveFaq(f, 'down')}>
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                  Down
                </Button>
                <Button type="button" variant="secondary" className="!py-1.5 text-xs" onClick={() => setPreviewItem(f)}>
                  <Eye className="h-3.5 w-3.5" aria-hidden />
                  Preview
                </Button>
                <Button type="button" variant="secondary" className="!py-1.5 text-xs" onClick={() => openEdit(f)}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="!py-1.5 text-xs text-red-700 hover:bg-red-50"
                  onClick={() => setDeleteTarget(f)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </ul>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      {previewItem ? (
        <ModalBackdrop wide title="Preview" onClose={() => setPreviewItem(null)}>
          <div className="space-y-4">
            <div>
              <Badge tone="info">{previewItem.category}</Badge>
              <h3 className="mt-3 text-lg font-semibold text-[var(--color-heading)]">{previewItem.question}</h3>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Answer</p>
              <div
                className="mt-2 text-sm leading-relaxed text-[var(--color-text)]"
                dangerouslySetInnerHTML={{ __html: sanitizeFaqHtml(previewItem.answer) || '—' }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-[#0A1628]/10 pt-4">
              <Badge tone={previewItem.active ? 'success' : 'default'}>
                {previewItem.active ? 'Published' : 'Hidden'}
              </Badge>
              <div className="ml-auto flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setPreviewItem(null)}>
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const item = previewItem
                    setPreviewItem(null)
                    openEdit(item)
                  }}
                >
                  Edit FAQ
                </Button>
              </div>
            </div>
          </div>
        </ModalBackdrop>
      ) : null}

      {formOpen ? (
        <ModalBackdrop wide title={editingId ? 'Edit FAQ' : 'Add FAQ'} onClose={() => setFormOpen(false)}>
          <form onSubmit={saveForm} className="space-y-4">
            <Select label="Category" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
              {categories.length === 0 ? (
                <option value="">No categories available</option>
              ) : null}
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Input label="Question" value={formQuestion} onChange={(e) => setFormQuestion(e.target.value)} required />
            <div className="w-full">
              <p className="mb-1.5 block text-sm font-medium text-[var(--color-heading)]">Answer</p>
              <RichTextEditor value={formAnswer} onChange={setFormAnswer} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--color-heading)]">Show only on specific form steps (optional)</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {formStepOptions.map((option) => {
                  const checked = formContextSteps.includes(option.key)
                  return (
                    <label key={option.key} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-heading)]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                        checked={checked}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setFormContextSteps((prev) => [...new Set([...prev, option.key])])
                          } else {
                            setFormContextSteps((prev) => prev.filter((item) => item !== option.key))
                          }
                        }}
                      />
                      {option.label}
                    </label>
                  )
                })}
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-heading)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
              />
              Published (visible to applicants)
            </label>
            <div className="flex flex-wrap justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              {formError ? <p className="mr-auto text-sm text-red-700">{formError}</p> : null}
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {editingId ? 'Save changes' : 'Create FAQ'}
              </Button>
            </div>
          </form>
        </ModalBackdrop>
      ) : null}

      {deleteTarget ? (
        <ModalBackdrop title="Delete FAQ?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--color-text)]">
            Delete this question:{' '}
            <span className="font-semibold text-[var(--color-heading)]">{deleteTarget.question}</span>? This cannot be
            undone.
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
