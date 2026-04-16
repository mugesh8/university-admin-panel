import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { feeStructureConfig } from '../../lib/mock-data/settings-config.js'

export function FeeStructurePage() {
  const columns = [
    { key: 'programCode', header: 'Program', sortable: true, sortType: 'string' },
    { key: 'intakeName', header: 'Intake', sortable: true, sortType: 'string' },
    { key: 'feeType', header: 'Fee type', sortable: true, sortType: 'string' },
    { key: 'amount', header: 'Amount', sortable: true, sortType: 'string', numeric: true },
    { key: 'currency', header: 'Currency', sortable: true, sortType: 'string' },
    { key: 'refundPolicy', header: 'Refund policy', sortable: true, sortType: 'string' },
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
            Add fee rule
          </Button>
        }
      />
      <DataTable columns={columns} rows={feeStructureConfig} getRowKey={(r) => r.id} pageSize={10} />
    </div>
  )
}