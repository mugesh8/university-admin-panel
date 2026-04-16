import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { documentRequirementsConfig } from '../../lib/mock-data/settings-config.js'

export function DocRequirementsPage() {
  const columns = [
    { key: 'name', header: 'Document', sortable: true, sortType: 'string' },
    {
      key: 'required',
      header: 'Required',
      sortable: true,
      sortType: 'number',
      sortValue: (r) => (r.required ? 1 : 0),
      render: (r) =>
        r.required ? <Badge tone="warning">Required</Badge> : <Badge tone="default">Optional</Badge>,
    },
    { key: 'acceptedTypes', header: 'Accepted types', sortable: true, sortType: 'string' },
    { key: 'maxSizeMb', header: 'Max size (MB)', sortable: true, sortType: 'number', numeric: true },
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
            Add document type
          </Button>
        }
      />
      <DataTable columns={columns} rows={documentRequirementsConfig} getRowKey={(r) => r.id} pageSize={10} />
    </div>
  )
}