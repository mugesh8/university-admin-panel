import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { faqItems } from '../../lib/mock-data/scaffold.js'

export function FaqPage() {
  return (
    <div>
      <PageHeader actions={<Button>Add FAQ</Button>} />
      <ul className="space-y-3">
        {faqItems.map((f) => (
          <Card key={f.id} className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Badge tone="info">{f.category}</Badge>
              <h3 className="mt-2 font-semibold text-[var(--color-heading)]">{f.question}</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" type="button" className="!py-1.5 text-xs">
                Preview
              </Button>
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
