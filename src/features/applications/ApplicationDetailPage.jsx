import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { User, Mail, History, Database, Zap } from 'lucide-react'
import { usePageTitleContext } from '../../context/PageTitleContext.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Tabs, TabList, TabPanel, TabTrigger } from '../../components/ui/Tabs.jsx'
import { buildPortalFormValuesFromApplication } from '../../lib/application-form/buildPortalFormValuesFromApplication.js'
import { portalFormSteps, portalStepTabValue } from '../../lib/application-form/portalFormSteps.js'
import { getApplicationById } from '../../lib/mock-data/applications.js'
import { ApplicationFormStepPanel } from './ApplicationFormStepPanel.jsx'

export function ApplicationDetailPage() {
  const { id } = useParams()
  const app = getApplicationById(id ?? '')
  const { setPageTitleOverride } = usePageTitleContext()
  const portalFormValues = useMemo(() => (app ? buildPortalFormValuesFromApplication(app) : {}), [app])

  useEffect(() => {
    if (!app) {
      setPageTitleOverride('Application not found')
    } else {
      setPageTitleOverride(app.name)
    }
    return () => setPageTitleOverride(null)
  }, [app, setPageTitleOverride])

  if (!app) {
    return (
      <div>
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">No demo record for this ID.</p>
        <Link to="/applications" className="text-[var(--color-primary)] hover:underline">
          Back to applications
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
            <span>{app.id}</span>
          </>
        }
        actions={
          <>
            <Badge>{app.status}</Badge>
          </>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg)] text-[var(--color-text-muted)]">
            <User className="h-10 w-10" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-[var(--color-heading)]">{app.name}</h2>
              <Badge tone="info">{app.id}</Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {app.program} · {app.intake} · {app.daysInStage} days in current stage
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Officer: <span className="text-[var(--color-heading)]">{app.assignedOfficer}</span> · Lead source:{' '}
              {app.leadSource}
            </p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue={portalStepTabValue(portalFormSteps[0].id)}>
        <TabList>
          {portalFormSteps.map((step) => (
            <TabTrigger key={step.id} value={portalStepTabValue(step.id)}>
              {step.title}
            </TabTrigger>
          ))}
          <TabTrigger value="comms">Communication log</TabTrigger>
          <TabTrigger value="timeline">Activity timeline</TabTrigger>
          <TabTrigger value="actions">Actions</TabTrigger>
        </TabList>

        {portalFormSteps.map((step) => (
          <TabPanel key={step.id} value={portalStepTabValue(step.id)}>
            <ApplicationFormStepPanel step={step} formValues={portalFormValues} />
          </TabPanel>
        ))}

        <TabPanel value="comms">
          {app.communications.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No messages in demo.</p>
          ) : (
            <ul className="space-y-2">
              {app.communications.map((c) => (
                <li key={c.id} className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
                  <div>
                    <p className="font-medium text-[var(--color-heading)]">{c.subject}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {c.at} · Status: {c.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabPanel>

        <TabPanel value="timeline">
          {app.timeline.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No events.</p>
          ) : (
            <ul className="space-y-2">
              {app.timeline.map((t, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <History className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
                  <span>
                    <span className="font-medium text-[var(--color-heading)]">{t.actor}</span> — {t.action}{' '}
                    <span className="text-[var(--color-text-muted)]">({t.at})</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </TabPanel>

        <TabPanel value="actions">
          <div className="flex flex-wrap gap-2">
            <Button type="button">Change status</Button>
            <Button type="button" variant="secondary">
              Assign officer
            </Button>
            <Button type="button" variant="secondary">
              Schedule interview
            </Button>
            <Button type="button" variant="secondary">
              Send templated email
            </Button>
            <Button type="button" variant="secondary">
              Add internal note
            </Button>
            <Button type="button" variant="secondary">
              Generate offer letter
            </Button>
            <Button type="button" className="bg-[var(--color-accent)] hover:opacity-90">
              Enrol student
            </Button>
            <Button type="button" variant="secondary">
              <Database className="h-4 w-4" />
              Download all (ZIP)
            </Button>
            <Button type="button" variant="ghost">
              <Zap className="h-4 w-4" />
              Valid next stages only (enforced in production)
            </Button>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  )
}
