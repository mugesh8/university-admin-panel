import { useMemo, useState } from 'react'
import { Archive, Pencil, Plus, Send, Trash2, X } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { useAnnouncementsStore } from '../../hooks/useAnnouncementsStore.js'
import { useSettingsStore } from '../../hooks/useSettingsStore.js'

const bodyTextareaClass =
  'min-h-[120px] w-full rounded-xl border border-[#0A1628]/15 bg-white px-3 py-2.5 text-sm text-[#0A1628] placeholder:text-[#0A1628]/45 focus:border-[#D4A843]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/35'

function ModalBackdrop({ children, onClose, title, wide, narrow }) {
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
        className={`max-h-[min(92vh,720px)] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-[#0A1628]/10 ${
          narrow ? 'max-w-md' : wide ? 'max-w-2xl' : 'max-w-lg'
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
        <div className="max-h-[calc(min(92vh,720px)-5rem)] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

function formatWhen(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function bodyPreview(text, max = 160) {
  const t = (text ?? '').replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trim()}…`
}

/**
 * @param {object} a
 * @param {{ id: string, name: string, active?: boolean }[]} programs
 * @param {{ id: string, name: string }[]} intakes
 * @param {{ stageKey: string, displayName: string, active?: boolean }[]} stages
 */
function targetingSummary(a, programs, intakes, stages) {
  const program = a.targetProgramId ? programs.find((p) => p.id === a.targetProgramId) : null
  const intake = a.targetIntakeId ? intakes.find((i) => i.id === a.targetIntakeId) : null
  const stage = a.targetPipelineStageKey
    ? stages.find((s) => s.stageKey === a.targetPipelineStageKey)
    : null

  if (!a.targetProgramId && !a.targetIntakeId && !a.targetPipelineStageKey) {
    return 'Target: All applicants'
  }

  const bits = []
  if (program) bits.push(program.name)
  if (intake) bits.push(intake.name)
  if (stage) bits.push(stage.displayName)
  return bits.length ? `Target: ${bits.join(' · ')}` : 'Target: (invalid selection — edit to fix)'
}

export function AnnouncementsPage() {
  const {
    announcements,
    counts,
    loading,
    saving,
    error,
    createOne,
    updateOne,
    removeOne,
  } = useAnnouncementsStore()
  const { programs, intakes, pipelineStages } = useSettingsStore()

  const programOptions = useMemo(() => programs.filter((p) => p.active !== false), [programs])
  const intakeOptions = useMemo(() => intakes, [intakes])
  const stageOptions = useMemo(
    () => [...pipelineStages].filter((s) => s.active !== false).sort((a, b) => a.order - b.order),
    [pipelineStages],
  )

  const sortedAnnouncements = useMemo(() => {
    return [...announcements].sort((a, b) => {
      const ta = new Date(a.updatedAt ?? 0).getTime()
      const tb = new Date(b.updatedAt ?? 0).getTime()
      return tb - ta
    })
  }, [announcements])

  const tabCounts = useMemo(() => {
    if (counts) return counts
    const published = sortedAnnouncements.filter((a) => a.active).length
    return {
      all: sortedAnnouncements.length,
      published,
      archived: sortedAnnouncements.length - published,
    }
  }, [counts, sortedAnnouncements])

  const [filter, setFilter] = useState('all')

  const visibleList = useMemo(() => {
    if (filter === 'active') return sortedAnnouncements.filter((a) => a.active)
    if (filter === 'archived') return sortedAnnouncements.filter((a) => !a.active)
    return sortedAnnouncements
  }, [sortedAnnouncements, filter])

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetProgramId, setTargetProgramId] = useState('')
  const [targetIntakeId, setTargetIntakeId] = useState('')
  const [targetPipelineStageKey, setTargetPipelineStageKey] = useState('')
  const [active, setActive] = useState(true)

  function openAdd() {
    setEditingId(null)
    setTitle('')
    setBody('')
    setTargetProgramId('')
    setTargetIntakeId('')
    setTargetPipelineStageKey('')
    setActive(true)
    setFormOpen(true)
  }

  function openEdit(a) {
    setEditingId(a.id)
    setTitle(a.title)
    setBody(a.body ?? '')
    setTargetProgramId(a.targetProgramId ?? '')
    setTargetIntakeId(a.targetIntakeId ?? '')
    setTargetPipelineStageKey(a.targetPipelineStageKey ?? '')
    setActive(Boolean(a.active))
    setFormOpen(true)
  }

  async function saveForm(e) {
    e.preventDefault()
    const t = title.trim()
    const b = body.trim()
    if (!t || !b) return

    const payload = {
      title: t,
      body: b,
      targetProgramId,
      targetIntakeId,
      targetPipelineStageKey,
      active,
    }

    try {
      if (editingId) {
        await updateOne(editingId, payload)
      } else {
        await createOne(payload)
      }
      setFormOpen(false)
    } catch {
      /* error surfaced via store */
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await removeOne(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      /* error surfaced via store */
    }
  }

  async function archiveOne(a) {
    try {
      await updateOne(a.id, {
        title: a.title,
        body: a.body ?? '',
        targetProgramId: a.targetProgramId ?? '',
        targetIntakeId: a.targetIntakeId ?? '',
        targetPipelineStageKey: a.targetPipelineStageKey ?? '',
        active: false,
      })
    } catch {
      /* error surfaced via store */
    }
  }

  async function publishOne(a) {
    try {
      await updateOne(a.id, {
        title: a.title,
        body: a.body ?? '',
        targetProgramId: a.targetProgramId ?? '',
        targetIntakeId: a.targetIntakeId ?? '',
        targetPipelineStageKey: a.targetPipelineStageKey ?? '',
        active: true,
      })
    } catch {
      /* error surfaced via store */
    }
  }

  const busy = loading || saving

  return (
    <div>
      <PageHeader
        actions={
          <Button type="button" onClick={openAdd} disabled={busy}>
            <Plus className="h-4 w-4" aria-hidden />
            New announcement
          </Button>
        }
      />

      {error ? (
        <Card className="mb-4 border-red-200 bg-red-50 py-3 text-sm text-red-900">{error}</Card>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant={filter === 'all' ? 'primary' : 'secondary'}
          className="!py-1.5 text-xs"
          disabled={busy}
          onClick={() => setFilter('all')}
        >
          All ({tabCounts.all})
        </Button>
        <Button
          type="button"
          variant={filter === 'active' ? 'primary' : 'secondary'}
          className="!py-1.5 text-xs"
          disabled={busy}
          onClick={() => setFilter('active')}
        >
          Published ({tabCounts.published})
        </Button>
        <Button
          type="button"
          variant={filter === 'archived' ? 'primary' : 'secondary'}
          className="!py-1.5 text-xs"
          disabled={busy}
          onClick={() => setFilter('archived')}
        >
          Archived ({tabCounts.archived})
        </Button>
      </div>

      <ul className="space-y-3">
        {loading ? (
          <Card className="py-10 text-center text-sm text-[var(--color-text-muted)]">Loading announcements…</Card>
        ) : visibleList.length === 0 ? (
          <Card className="py-10 text-center text-sm text-[var(--color-text-muted)]">
            {sortedAnnouncements.length === 0 ? (
              <>
                No announcements yet. Create one with{' '}
                <span className="font-medium text-[var(--color-heading)]">New announcement</span>.
              </>
            ) : (
              <>No announcements match this filter.</>
            )}
          </Card>
        ) : (
          visibleList.map((a) => (
            <Card key={a.id} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-[var(--color-heading)]">{a.title}</h3>
                  <Badge tone={a.active ? 'success' : 'default'}>
                    {a.active ? 'Published' : 'Archived'}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--color-text)]">{bodyPreview(a.body)}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {targetingSummary(a, programs, intakes, pipelineStages)}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Updated {formatWhen(a.updatedAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                {a.active ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="!py-1.5 text-xs"
                    disabled={saving}
                    onClick={() => archiveOne(a)}
                  >
                    <Archive className="h-3.5 w-3.5" aria-hidden />
                    Archive
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    className="!py-1.5 text-xs"
                    disabled={saving}
                    onClick={() => publishOne(a)}
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden />
                    Publish
                  </Button>
                )}
                <Button
                  variant="secondary"
                  type="button"
                  className="!py-1.5 text-xs"
                  disabled={saving}
                  onClick={() => openEdit(a)}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="!py-1.5 text-xs text-red-700 hover:bg-red-50"
                  disabled={saving}
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
        <ModalBackdrop
          wide
          title={editingId ? 'Edit announcement' : 'New announcement'}
          onClose={() => setFormOpen(false)}
        >
          <form onSubmit={saveForm} className="space-y-4">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div className="w-full">
              <label htmlFor="announcement-body" className="mb-1.5 block text-sm font-medium text-[var(--color-heading)]">
                Message
              </label>
              <textarea
                id="announcement-body"
                className={bodyTextareaClass}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Full text shown on the applicant dashboard."
                required
                rows={5}
              />
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Shown to applicants when this announcement matches their program, intake, and pipeline stage (if
                specified).
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Program"
                value={targetProgramId}
                onChange={(e) => setTargetProgramId(e.target.value)}
              >
                <option value="">Any program</option>
                {programOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <Select label="Intake" value={targetIntakeId} onChange={(e) => setTargetIntakeId(e.target.value)}>
                <option value="">Any intake</option>
                {intakeOptions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </Select>
              <Select
                className="sm:col-span-2"
                label="Pipeline stage (status group)"
                value={targetPipelineStageKey}
                onChange={(e) => setTargetPipelineStageKey(e.target.value)}
              >
                <option value="">Any stage</option>
                {stageOptions.map((s) => (
                  <option key={s.id} value={s.stageKey}>
                    {s.displayName}
                  </option>
                ))}
              </Select>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-heading)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Published (visible on applicant dashboard when targeting matches)
            </label>

            <div className="flex flex-wrap justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create announcement'}
              </Button>
            </div>
          </form>
        </ModalBackdrop>
      ) : null}

      {deleteTarget ? (
        <ModalBackdrop narrow title="Delete announcement?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--color-text)]">
            Delete <span className="font-semibold text-[var(--color-heading)]">{deleteTarget.title}</span>? This removes
            it from the list permanently. Use Archive to keep history without showing it to applicants.
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
