import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { pipelineStagesConfig } from '../../lib/mock-data/settings-config.js'

export function PipelineStagesPage() {
  const columns = [
    { key: 'order', header: 'Order', sortable: true, sortType: 'number', numeric: true },
    { key: 'stageKey', header: 'Stage key', sortable: true, sortType: 'string' },
    { key: 'displayName', header: 'Display name', sortable: true, sortType: 'string' },
    {
      key: 'slaDays',
      header: 'SLA (days)',
      sortable: true,
      sortType: 'number',
      sortValue: (r) => r.slaDays ?? -1,
      render: (r) => <span className="tabular-nums">{r.slaDays ?? '—'}</span>,
    },
    {
      key: 'notificationTemplate',
      header: 'Notification template',
      sortable: true,
      sortType: 'string',
    },
    {
      key: 'active',
      header: 'Active',
      sortable: true,
      sortType: 'number',
      sortValue: (r) => (r.active ? 1 : 0),
      render: (r) => (r.active ? <Badge tone="success">Yes</Badge> : <Badge tone="warning">No</Badge>),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: () => (
        <Button type="button" variant="ghost" className="!py-1.5 !text-xs">
          Edit
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button type="button" variant="secondary">
            Add stage
          </Button>
        }
      />
      <DataTable columns={columns} rows={pipelineStagesConfig} getRowKey={(r) => r.id} pageSize={12} />
    </div>
  )
}