import { useMemo, useState } from 'react'
import { CheckCircle2, Mail, RefreshCw, Send, XCircle } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { useEmailTemplatesStore } from '../../hooks/useEmailTemplatesStore.js'
import { useAuth } from '../auth/useAuth.js'
import { sendBrevoTemplateEmail, sendBrevoRawEmail } from '../../lib/api/brevoApi.js'

const textareaClass =
  'min-h-[220px] w-full rounded-xl border border-[#0A1628]/15 bg-white px-3 py-2.5 text-sm text-[#0A1628] placeholder:text-[#0A1628]/45 focus:border-[#D4A843]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/35'

export function ComposeEmailPage() {
  const { token } = useAuth()
  const { templates: emailTemplates, loading: templatesLoading, isBrevoMode } = useEmailTemplatesStore()
  const activeTemplates = useMemo(() => emailTemplates.filter((t) => t.active), [emailTemplates])

  const [templateId, setTemplateId] = useState('')
  const [toEmail, setToEmail] = useState('')
  const [toName, setToName] = useState('')
  const [applicationRef, setApplicationRef] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null) // { ok, message, detail }

  const selectedTemplate = useMemo(
    () => emailTemplates.find((t) => String(t.id) === String(templateId)) ?? null,
    [emailTemplates, templateId],
  )

  function handleTemplateChange(id) {
    setTemplateId(id)
    const t = emailTemplates.find((x) => String(x.id) === String(id))
    if (t) {
      setSubject(t.subject || '')
      setBody(t.body ?? t.bodyPreview ?? '')
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    if (sending) return

    const recipient = toEmail.trim()
    const appRef = applicationRef.trim()

    if (!recipient && !appRef) {
      setResult({ ok: false, message: 'Please enter a recipient email or an application reference number.' })
      return
    }

    setSending(true)
    setResult(null)

    try {
      if (isBrevoMode && selectedTemplate?.isBrevoTemplate && selectedTemplate?.brevoId) {
        // ── Brevo template send ────────────────────────────────────────────
        await sendBrevoTemplateEmail(token, {
          template_id: selectedTemplate.brevoId,
          to: recipient || undefined,
          to_name: toName.trim() || undefined,
          application_ref: appRef || undefined,
        })
        setResult({
          ok: true,
          message: 'Email sent via Brevo!',
          detail: `Template "${selectedTemplate.name}" dispatched${recipient ? ` to ${recipient}` : ''}.`,
        })
      } else if (isBrevoMode) {
        // ── Brevo raw send ─────────────────────────────────────────────────
        const sub = subject.trim()
        const bd = body.trim()
        if (!sub || !bd) {
          setResult({ ok: false, message: 'Please provide a subject and body for the email.' })
          setSending(false)
          return
        }
        await sendBrevoRawEmail(token, {
          to: recipient || undefined,
          to_name: toName.trim() || undefined,
          subject: sub,
          body: bd,
          application_ref: appRef || undefined,
        })
        setResult({
          ok: true,
          message: 'Email sent via Brevo!',
          detail: recipient ? `Sent to ${recipient}.` : 'Sent to applicant resolved from application reference.',
        })
      } else {
        // ── Demo / offline mode ────────────────────────────────────────────
        await new Promise((r) => setTimeout(r, 800))
        setResult({
          ok: true,
          message: 'Demo mode — email not actually sent.',
          detail: 'Connect a real admin account to send live emails via Brevo.',
        })
      }
    } catch (err) {
      setResult({ ok: false, message: err.message || 'Failed to send email. Please try again.' })
    } finally {
      setSending(false)
    }
  }

  function resetForm() {
    setTemplateId('')
    setToEmail('')
    setToName('')
    setApplicationRef('')
    setSubject('')
    setBody('')
    setResult(null)
  }

  return (
    <div>
      <PageHeader
        actions={
          <>
            <Button type="button" variant="secondary" onClick={resetForm} disabled={sending}>
              Clear
            </Button>
            <Button type="button" onClick={handleSend} disabled={sending}>
              <Send className="h-4 w-4" aria-hidden />
              {sending ? 'Sending…' : 'Send'}
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        {/* Result banner */}
        {result && (
          <div
            className={`flex items-start gap-3 rounded-xl px-4 py-4 text-sm ring-1 ${
              result.ok
                ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                : 'bg-red-50 text-red-800 ring-red-200'
            }`}
          >
            {result.ok ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <div>
              <p className="font-semibold">{result.message}</p>
              {result.detail && <p className="mt-0.5 text-xs opacity-80">{result.detail}</p>}
            </div>
            <button
              type="button"
              className="ml-auto shrink-0 opacity-60 hover:opacity-100"
              onClick={() => setResult(null)}
              aria-label="Dismiss"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Recipients & template */}
        <Card>
          <CardHeader title="Recipient & Template" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Recipient email"
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="student@example.com"
              hint="Leave blank to resolve from application reference"
            />
            <Input
              label="Recipient name (optional)"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Application reference (optional)"
              value={applicationRef}
              onChange={(e) => setApplicationRef(e.target.value)}
              placeholder="e.g. MU-2024-001"
              hint="Used to resolve student email & populate merge fields"
            />
            <div>
              <Select
                label="Brevo template"
                value={templateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
              >
                <option value="">— Blank / custom message —</option>
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
          </div>

          {/* Selected template preview */}
          {selectedTemplate && (
            <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Selected template
              </p>
              <div className="mt-1 flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-[var(--color-heading)]">{selectedTemplate.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{selectedTemplate.subject}</p>
                </div>
                {selectedTemplate.isBrevoTemplate && (
                  <span className="shrink-0 rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-200">
                    Brevo #{selectedTemplate.brevoId}
                  </span>
                )}
              </div>
              {selectedTemplate.isBrevoTemplate && (
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  ✓ This template will be sent via Brevo's delivery pipeline. Merge fields (applicant name, etc.) are
                  resolved server-side.
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Custom message (shown when no Brevo template selected, or in offline mode) */}
        {(!selectedTemplate?.isBrevoTemplate || !isBrevoMode) && (
          <Card>
            <CardHeader
              title="Custom Message"
              actions={
                !isBrevoMode && (
                  <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                    Demo mode — emails not sent
                  </span>
                )
              }
            />
            <div className="space-y-4">
              <Input
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Your application update — {{application_id}}"
              />
              <div>
                <label
                  htmlFor="compose-body"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-heading)]"
                >
                  Body
                </label>
                <textarea
                  id="compose-body"
                  className={textareaClass}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Compose your message… Use {{applicant_name}}, {{application_id}} etc. for merge fields."
                />
                <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
                  Merge fields like <code className="rounded bg-[var(--color-bg)] px-1 font-mono">{'{{applicant_name}}'}</code> are
                  replaced server-side when an application reference is provided.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Brevo template selected — info card */}
        {selectedTemplate?.isBrevoTemplate && isBrevoMode && (
          <Card>
            <CardHeader title="Merge fields & delivery" />
            <div className="space-y-3 text-sm text-[var(--color-text)]">
              <div className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                <span>
                  <span className="font-medium text-[var(--color-heading)]">Brevo handles delivery</span> — your API
                  key is used server-side. The email is rendered from your Brevo template design.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
                <span>
                  <span className="font-medium text-[var(--color-heading)]">Auto merge</span> — if you provide an
                  application reference, merge params (applicant name, program, intake, etc.) are resolved and passed
                  automatically as <code className="rounded bg-[var(--color-bg)] px-1 font-mono">{'{{params.xxx}}'}</code>.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                <span>
                  <span className="font-medium text-[var(--color-heading)]">Template subject & design</span> — these
                  come from Brevo. Edit the template directly in{' '}
                  <a
                    href={`https://app.brevo.com/template/edit/${selectedTemplate.brevoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    Brevo
                  </a>
                  .
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
