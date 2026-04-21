import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Send, Sparkles } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { applications } from '../../lib/mock-data/applications.js'
import { emailMergeFieldGroups } from '../../lib/mock-data/scaffold.js'
import { useEmailTemplatesStore } from '../../hooks/useEmailTemplatesStore.js'

const textareaClass =
  'min-h-[220px] w-full rounded-xl border border-[#0A1628]/15 bg-white px-3 py-2.5 text-sm text-[#0A1628] placeholder:text-[#0A1628]/45 focus:border-[#D4A843]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/35'

export function ComposeEmailPage() {
  const { templates: emailTemplates } = useEmailTemplatesStore()
  const activeTemplates = useMemo(() => emailTemplates.filter((t) => t.active), [emailTemplates])
  const [applicationId, setApplicationId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [toEmail, setToEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const selectedApp = useMemo(
    () => applications.find((a) => a.id === applicationId) ?? null,
    [applicationId],
  )

  function applyTemplate(id) {
    const t = emailTemplates.find((x) => x.id === id)
    if (!t) return
    setSubject(t.subject)
    setBody(t.body ?? t.bodyPreview ?? '')
  }

  function handleApplicationChange(id) {
    setApplicationId(id)
    const app = applications.find((a) => a.id === id)
    setToEmail(app?.email ?? '')
    if (templateId) applyTemplate(templateId)
  }

  function handleTemplateChange(id) {
    setTemplateId(id)
    if (id) applyTemplate(id)
  }

  function insertAtCursor(insert) {
    setBody((prev) => (prev ? `${prev}\n${insert}` : insert))
  }

  return (
    <div>
      <PageHeader
        actions={
          <>
            <Button type="button" variant="secondary">
              Save draft
            </Button>
            <Button type="button">
              <Send className="h-4 w-4" aria-hidden />
              Send
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader title="Recipients & template" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Application"
              value={applicationId}
              onChange={(e) => handleApplicationChange(e.target.value)}
            >
              <option value="">Select application…</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.name}
                </option>
              ))}
            </Select>
            <Input
              label="To (email)"
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="Resolved from application"
              readOnly={Boolean(selectedApp)}
              hint={selectedApp ? 'Locked while an application is selected (demo).' : 'Enter manually if needed.'}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Select label="Template" value={templateId} onChange={(e) => handleTemplateChange(e.target.value)}>
              <option value="">Blank message</option>
              {activeTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
            {selectedApp ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm">
                <p className="text-xs font-medium uppercase text-[var(--color-text-muted)]">Preview context</p>
                <p className="mt-1 font-medium text-[var(--color-heading)]">{selectedApp.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {selectedApp.program} · {selectedApp.intake} · {selectedApp.status}
                </p>
                <Link
                  className="mt-2 inline-block text-xs font-medium text-[var(--color-primary)] hover:underline"
                  to={`/applications/${encodeURIComponent(selectedApp.id)}`}
                >
                  Open application detail
                </Link>
              </div>
            ) : (
              <div className="flex items-end">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Select an application to auto-fill merge previews in production.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Message" />
          <div className="space-y-4">
            <Input
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. We received your application — {{application_id}}"
            />
            <div>
              <label htmlFor="compose-body" className="mb-1.5 block text-sm font-medium text-[var(--color-heading)]">
                Body
              </label>
              <textarea
                id="compose-body"
                className={textareaClass}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Compose your message…"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
