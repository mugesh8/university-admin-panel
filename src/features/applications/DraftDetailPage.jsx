import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePageTitleContext } from '../../context/PageTitleContext.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Tabs, TabList, TabPanel, TabTrigger } from '../../components/ui/Tabs.jsx'
import { buildPortalFormValuesFromDraft } from '../../lib/application-form/buildPortalFormValuesFromApplication.js'
import { portalFormSteps, portalStepTabValue } from '../../lib/application-form/portalFormSteps.js'
import {
  APPLICATION_FORM_TOTAL_STEPS,
  getApplicationFormProgressPercent,
} from '../../lib/applicationFormProgress.js'
import { getDraftById } from '../../lib/mock-data/applicationDrafts.js'
import { ApplicationFormStepPanel } from './ApplicationFormStepPanel.jsx'

function formatSaved(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

function FieldRow({ label, value }) {
  const display = value === undefined || value === null || value === '' ? '—' : String(value)
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-[var(--color-border)]/60 py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{label}</dt>
      <dd className="text-sm text-[var(--color-heading)]">{display}</dd>
    </div>
  )
}

export function DraftDetailPage() {
  const { draftId } = useParams()
  const draft = getDraftById(draftId ?? '')
  const { setPageTitleOverride } = usePageTitleContext()
  const fv = draft?.formValues ?? {}
  const progressPercent = draft ? getApplicationFormProgressPercent(draft.currentStepIndex) : 0
  const portalFormValues = useMemo(() => (draft ? buildPortalFormValuesFromDraft(draft) : {}), [draft])

  useEffect(() => {
    if (!draft) {
      setPageTitleOverride('Draft not found')
    } else {
      setPageTitleOverride(draft.applicantName)
    }
    return () => setPageTitleOverride(null)
  }, [draft, setPageTitleOverride])

  if (!draft) {
    return (
      <div>
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">No demo record for this draft ID.</p>
        <Link to="/applications/drafts" className="text-[var(--color-primary)] hover:underline">
          Back to drafts
        </Link>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <>
            <Link to="/applications" className="hover:text-[var(--color-primary)]">
              Applications
            </Link>
            <span className="mx-1">/</span>
            <Link to="/applications/drafts" className="hover:text-[var(--color-primary)]">
              Drafts
            </Link>
            <span className="mx-1">/</span>
            <span>{draft.id}</span>
          </>
        }
        actions={
          <>
            <Badge tone="warning">Draft</Badge>
            <Badge tone="info">
              Step {draft.currentStepIndex + 1} of {APPLICATION_FORM_TOTAL_STEPS}
            </Badge>
            <Badge tone="success">{progressPercent}%</Badge>
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabList>
          <TabTrigger value="overview">Overview</TabTrigger>
          {portalFormSteps.map((step) => (
            <TabTrigger key={step.id} value={portalStepTabValue(step.id)}>
              {step.title}
            </TabTrigger>
          ))}
        </TabList>

        <TabPanel value="overview">
          <Card className="mb-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <h2 className="text-lg font-semibold text-[var(--color-heading)]">{draft.applicantName}</h2>
                <Badge tone="info">{draft.id}</Badge>
              </div>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Portal account: {draft.userEmail} · Last saved: {formatSaved(draft.lastSavedAt)}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Currently on: <span className="text-[var(--color-heading)]">{draft.currentStepTitle}</span>
              </p>
              <div className="mt-3 max-w-md">
                <div className="flex items-center justify-between text-xs font-medium text-[var(--color-text-muted)]">
                  <span>Overall progress</span>
                  <span className="text-[var(--color-heading)]">{progressPercent}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--color-border)]/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#D4A843] to-[#b98a22] transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-heading)]">Contact & identity</h3>
              <dl>
                <FieldRow label="Title" value={fv.title} />
                <FieldRow label="First name" value={fv.firstName} />
                <FieldRow label="Surname" value={fv.surname} />
                <FieldRow label="Email" value={fv.email ?? draft.email} />
                <FieldRow label="Mobile phone" value={fv.phoneMobile ?? draft.phone} />
                <FieldRow label="Citizenship" value={fv.citizenship ?? draft.citizenship} />
              </dl>
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-heading)]">Program & intake (saved so far)</h3>
              <dl>
                <FieldRow label="Program type" value={fv.programType} />
                <FieldRow label="Sub-program" value={fv.subProgram} />
                <FieldRow label="Preferred semester" value={fv.semester} />
                <FieldRow label="Preferred year" value={fv.year} />
                <FieldRow label="English proficiency" value={fv.englishProficiency} />
              </dl>
            </Card>
          </div>
        </TabPanel>

        {portalFormSteps.map((step) => (
          <TabPanel key={step.id} value={portalStepTabValue(step.id)}>
            <ApplicationFormStepPanel step={step} formValues={portalFormValues} />
          </TabPanel>
        ))}
      </Tabs>
    </div>
  )
}
