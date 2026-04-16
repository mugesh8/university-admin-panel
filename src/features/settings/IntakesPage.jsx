import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { intakesConfig } from '../../lib/mock-data/settings-config.js'

function statusTone(status) {
  if (status === 'Open') return 'success'
  if (status === 'Planned') return 'info'
  return 'warning'
}

export function IntakesPage() {
  const columns = [
    { key: 'name', header: 'Intake', sortable: true, sortType: 'string' },
    { key: 'startDate', header: 'Start date', sortable: true, sortType: 'date' },
    { key: 'applicationDeadline', header: 'Application deadline', sortable: true, sortType: 'date' },
    { key: 'capacity', header: 'Capacity', sortable: true, sortType: 'number', numeric: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortType: 'string',
      render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge>,
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
            Create intake
          </Button>
        }
      />
      <DataTable columns={columns} rows={intakesConfig} getRowKey={(r) => r.id} pageSize={10} />
    </div>
  )
}