import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { announcements } from '../../lib/mock-data/scaffold.js'

export function AnnouncementsPage() {
  return (
    <div>
      <PageHeader actions={<Button>New announcement</Button>} />
      <ul className="space-y-3">
        {announcements.map((a) => (
          <Card key={a.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-[var(--color-heading)]">{a.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">{a.audience}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={a.active ? 'success' : 'default'}>{a.active ? 'Active' : 'Archived'}</Badge>
              <Button variant="secondary" type="button" className="!py-1.5 text-xs">
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </ul>
    </div>
  )
}
