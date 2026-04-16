import { Card } from '../../components/ui/Card.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { supportTickets } from '../../lib/mock-data/scaffold.js'

export function SupportTicketsPage() {
  return (
    <div>
      <div className="space-y-3">
        {supportTickets.map((t) => (
          <Card key={t.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-[var(--color-text-muted)]">{t.id}</p>
              <h3 className="font-semibold text-[var(--color-heading)]">{t.subject}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                {t.applicant} · {t.category} · Updated {t.updated}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={t.status === 'open' ? 'warning' : 'success'}>{t.status}</Badge>
              <Button variant="secondary" type="button" className="!py-1.5 text-xs">
                Reply
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
