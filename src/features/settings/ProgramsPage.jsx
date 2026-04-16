import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { programsConfig } from '../../lib/mock-data/settings-config.js'

export function ProgramsPage() {
  const columns = [
    { key: 'name', header: 'Program', sortable: true, sortType: 'string' },
    { key: 'code', header: 'Code', sortable: true, sortType: 'string' },
    { key: 'durationYears', header: 'Duration (yrs)', sortable: true, sortType: 'number', numeric: true },
    { key: 'level', header: 'Level', sortable: true, sortType: 'string' },
    { key: 'capacity', header: 'Capacity', sortable: true, sortType: 'number', numeric: true },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      sortType: 'number',
      sortValue: (r) => (r.active ? 1 : 0),
      render: (r) => (r.active ? <Badge tone="success">Active</Badge> : <Badge tone="warning">Inactive</Badge>),
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
            Add program
          </Button>
        }
      />
      <DataTable columns={columns} rows={programsConfig} getRowKey={(r) => r.id} pageSize={10} />
    </div>
  )
}