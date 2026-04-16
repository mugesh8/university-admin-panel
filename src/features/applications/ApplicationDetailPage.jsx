import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { User, FileStack, CreditCard, Mail, History, Database, Zap } from 'lucide-react'
import { usePageTitleContext } from '../../context/PageTitleContext.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Tabs, TabList, TabPanel, TabTrigger } from '../../components/ui/Tabs.jsx'
import { getApplicationById } from '../../lib/mock-data/applications.js'

export function ApplicationDetailPage() {
  const { id } = useParams()
  const app = getApplicationById(id ?? '')
  const { setPageTitleOverride } = usePageTitleContext()

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
            <Badge tone={app.crmLinked ? 'success' : 'warning'}>
              CRM {app.crmLinked ? 'linked' : 'not linked'}
            </Badge>
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

      <Tabs defaultValue="personal">
        <TabList>
          <TabTrigger value="personal">Personal details</TabTrigger>
          <TabTrigger value="academic">Academic & motivation</TabTrigger>
          <TabTrigger value="documents">Documents</TabTrigger>
          <TabTrigger value="financial">Financial</TabTrigger>
          <TabTrigger value="comms">Communication log</TabTrigger>
          <TabTrigger value="timeline">Activity timeline</TabTrigger>
          <TabTrigger value="crm">CRM data</TabTrigger>
          <TabTrigger value="actions">Actions</TabTrigger>
        </TabList>

        <TabPanel value="personal">
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Title" value={app.personal.title} />
            <DetailItem label="Date of birth" value={app.personal.dob} />
            <DetailItem label="Passport" value={app.personal.passport} />
            <DetailItem label="Address" value={app.personal.address} />
            <DetailItem label="Email" value={app.email} />
            <DetailItem label="Phone" value={app.phone} />
            <DetailItem label="Citizenship" value={app.citizenship} />
            <DetailItem label="Country" value={app.country} />
          </dl>
        </TabPanel>

        <TabPanel value="academic">
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Qualification" value={app.academic.qualification} />
            <DetailItem label="Institution" value={app.academic.institution} />
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase text-[var(--color-text-muted)]">Personal statement</dt>
              <dd className="mt-1 text-sm text-[var(--color-text)]">{app.academic.personalStatement}</dd>
            </div>
          </dl>
        </TabPanel>

        <TabPanel value="documents">
          {app.documents.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No documents in demo record.</p>
          ) : (
            <ul className="space-y-3">
              {app.documents.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
                >
                  <div className="flex items-center gap-2">
                    <FileStack className="h-5 w-5 text-[var(--color-text-muted)]" />
                    <span className="font-medium text-[var(--color-heading)]">{d.name}</span>
                    <Badge tone={d.status === 'verified' ? 'success' : 'warning'}>{d.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" className="!py-1.5 text-xs">
                      Verify
                    </Button>
                    <Button type="button" variant="secondary" className="!py-1.5 text-xs">
                      Reject
                    </Button>
                    <Button type="button" variant="secondary" className="!py-1.5 text-xs">
                      Request re-upload
                    </Button>
                  </div>
                  {d.officer ? (
                    <p className="w-full text-xs text-[var(--color-text-muted)]">
                      {d.officer} · {d.at}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </TabPanel>

        <TabPanel value="financial">
          <dl className="mb-4 grid gap-3 sm:grid-cols-2">
            <DetailItem label="Payment option" value={app.financial.payer} />
            <DetailItem label="Sponsor" value={app.financial.sponsorName ?? '—'} />
          </dl>
          <h4 className="mb-2 text-sm font-semibold text-[var(--color-heading)]">Payment history</h4>
          {app.financial.payments.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No payments recorded.</p>
          ) : (
            <ul className="text-sm">
              {app.financial.payments.map((p, i) => (
                <li key={i} className="border-b border-[var(--color-border)] py-2 last:border-0">
                  {p.type} — {p.amount} — {p.status} ({p.ref})
                </li>
              ))}
            </ul>
          )}
        </TabPanel>

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

        <TabPanel value="crm">
          {!app.crm ? (
            <p className="text-sm text-[var(--color-text-muted)]">No CRM correlation for this demo record.</p>
          ) : (
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Source" value={app.crm.source} />
              <DetailItem label="Channel" value={app.crm.channel} />
              <DetailItem label="Agent" value={app.crm.agent} />
              <DetailItem label="Interactions" value={String(app.crm.interactions)} />
              <DetailItem label="First contact" value={app.crm.firstContact} />
            </dl>
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

function DetailItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-[var(--color-text-muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm text-[var(--color-heading)]">{value}</dd>
    </div>
  )
}
