import { useMemo, useState } from 'react'
import { CheckCircle2, Megaphone, PieChart, RefreshCw, Users, XCircle } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { KpiCard } from '../../components/ui/KpiCard.jsx'
import { useEmailTemplatesStore } from '../../hooks/useEmailTemplatesStore.js'
import { useAuth } from '../auth/useAuth.js'
import { sendBrevoEmailBulk } from '../../lib/api/brevoApi.js'

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

const STATUS_OPTIONS = [
  'Applied',
  'Under Review',
  'Interview Scheduled',
  'Interview Completed',
  'Offer Made',
  'Enrolled',
  'Rejected',
  'Withdrawn',
]

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function BulkMessagesPage() {
  const { token } = useAuth()
  const { templates: emailTemplates, loading: templatesLoading, isBrevoMode } = useEmailTemplatesStore()
  const activeTemplates = useMemo(() => emailTemplates.filter((t) => t.active), [emailTemplates])

  const [programId, setProgramId] = useState('')
  const [intakeId, setIntakeId] = useState('')
  const [status, setStatus] = useState('')
  const [templateId, setTemplateId] = useState('')

  const [dryRunLoading, setDryRunLoading] = useState(false)
  const [dryRunResult, setDryRunResult] = useState(null) // { audienceCount }
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null) // { ok, message, detail }

  const selectedTemplate = useMemo(
    () => emailTemplates.find((t) => String(t.id) === String(templateId)) ?? null,
    [emailTemplates, templateId],
  )

  async function handleDryRun() {
    if (!templateId) return
    setDryRunLoading(true)
    setDryRunResult(null)
    setSendResult(null)
    try {
      const data = await sendBrevoEmailBulk(token, {
        template_id: selectedTemplate?.brevoId || Number(templateId),
        program_id: programId || undefined,
        intake_id: intakeId || undefined,
        status: status || undefined,
        dry_run: true,
      })
      setDryRunResult({ audienceCount: data.audienceCount ?? 0 })
    } catch (err) {
      setSendResult({ ok: false, message: err.message || 'Dry run failed' })
    } finally {
      setDryRunLoading(false)
    }
  }

  async function handleBulkSend(e) {
    e.preventDefault()
    if (!templateId || sending) return
    if (!selectedTemplate?.isBrevoTemplate) {
      setSendResult({ ok: false, message: 'Please select a Brevo template to send bulk emails.' })
      return
    }

    setSending(true)
    setSendResult(null)

    try {
      const data = await sendBrevoEmailBulk(token, {
        template_id: selectedTemplate.brevoId,
        program_id: programId || undefined,
        intake_id: intakeId || undefined,
        status: status || undefined,
        dry_run: false,
      })

      setSendResult({
        ok: true,
        message: `Bulk send complete!`,
        detail: `${data.sent ?? 0} sent, ${data.failed ?? 0} failed out of ${data.audienceCount ?? 0} recipients.`,
      })
      setDryRunResult(null)
    } catch (err) {
      setSendResult({ ok: false, message: err.message || 'Bulk send failed' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <PageHeader
        actions={
          <Button type="button" variant="secondary" disabled>
            Export CSV (log)
          </Button>
        }
      />

      {/* KPI row */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <KpiCard
          compact
          title="Active Brevo templates"
          subtitle="Ready to send"
          value={String(activeTemplates.length)}
        />
        <KpiCard
          compact
          title="Delivery engine"
          subtitle="Email provider"
          value={isBrevoMode ? 'Brevo' : 'Demo'}
        />
        <KpiCard
          compact
          title="Dry-run audience"
          subtitle="Last estimate"
          value={dryRunResult ? String(dryRunResult.audienceCount) : '—'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bulk composer */}
        <Card>
          <CardHeader
            title="Bulk composer"
            actions={
              selectedTemplate ? (
                <Badge tone="info">
                  <Users className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                  {selectedTemplate.name}
                </Badge>
              ) : null
            }
          />

          {!isBrevoMode && (
            <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
              Demo mode — bulk sends require a real admin account connected to Brevo.
            </div>
          )}

          <form onSubmit={handleBulkSend} className="space-y-4">
            {/* Audience filters */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Audience filters
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Program ID (optional)"
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  placeholder="Leave blank for all programs"
                />
                <Input
                  label="Intake ID (optional)"
                  value={intakeId}
                  onChange={(e) => setIntakeId(e.target.value)}
                  placeholder="Leave blank for all intakes"
                />
              </div>
              <div className="mt-3">
                <Select label="Pipeline status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Any status</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Template selector */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Brevo template
              </p>
              <Select label="Template" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                <option value="">Select a template…</option>
                {templatesLoading ? (
                  <option disabled>Loading templates…</option>
                ) : (
                  activeTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {t.isBrevoTemplate ? ` (Brevo #${t.brevoId})` : ''}
                    </option>
                  ))
                )}
              </Select>
            </div>

            {/* Result / dry-run banner */}
            {(sendResult || dryRunResult) && (
              <div
                className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ring-1 ${
                  sendResult?.ok === false
                    ? 'bg-red-50 text-red-800 ring-red-200'
                    : dryRunResult
                      ? 'bg-sky-50 text-sky-800 ring-sky-200'
                      : 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                }`}
              >
                {sendResult?.ok === false ? (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                )}
                <div>
                  <p className="font-semibold">
                    {sendResult
                      ? sendResult.message
                      : `Dry run: ${dryRunResult.audienceCount} recipient${dryRunResult.audienceCount !== 1 ? 's' : ''} match your filters`}
                  </p>
                  {sendResult?.detail && <p className="mt-0.5 text-xs opacity-80">{sendResult.detail}</p>}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                onClick={handleDryRun}
                disabled={!templateId || dryRunLoading || sending || !isBrevoMode}
              >
                {dryRunLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Users className="h-4 w-4" aria-hidden />
                )}
                {dryRunLoading ? 'Estimating…' : 'Preview audience'}
              </Button>
              <Button
                type="submit"
                disabled={!templateId || sending || dryRunLoading || !isBrevoMode || !selectedTemplate?.isBrevoTemplate}
              >
                {sending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Megaphone className="h-4 w-4" aria-hidden />
                )}
                {sending ? 'Sending…' : 'Send bulk email'}
              </Button>
            </div>

            <p className="text-xs text-[var(--color-text-muted)]">
              Each matched applicant receives an individual email via Brevo with merge fields resolved per recipient.
              Use &quot;Preview audience&quot; to check the count before sending.
            </p>
          </form>
        </Card>

        {/* Delivery info */}
        <Card className="border-[#0A1628]/10 bg-[#f8fafc]">
          <CardHeader
            title="Delivery & audit"
            actions={<PieChart className="h-5 w-5 text-[#0A1628]/60" aria-hidden />}
          />
          <ul className="space-y-3 text-sm text-[var(--color-text)]">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              <span>
                <span className="font-medium text-[var(--color-heading)]">Brevo delivery</span>{' '}
                <span className="text-[var(--color-text-muted)]">
                  — emails are dispatched individually via Brevo's transactional API with per-recipient merge params.
                </span>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              <span>
                <span className="font-medium text-[var(--color-heading)]">Merge fields</span>{' '}
                <span className="text-[var(--color-text-muted)]">
                  — applicant name, program, intake, application ID and pipeline stage are passed as{' '}
                  <code className="rounded bg-[var(--color-bg)] px-1 font-mono">{'{{params.xxx}}'}</code> variables.
                </span>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
              <span>
                <span className="font-medium text-[var(--color-heading)]">Brevo tracking</span>{' '}
                <span className="text-[var(--color-text-muted)]">
                  — delivery, open, click & bounce events are tracked in your Brevo dashboard automatically.
                </span>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden />
              <span>
                <span className="font-medium text-[var(--color-heading)]">Template design</span>{' '}
                <span className="text-[var(--color-text-muted)]">
                  — edit HTML/CSS templates directly in Brevo and click{' '}
                  <strong>Refresh</strong> on the Templates page to sync changes here.
                </span>
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
