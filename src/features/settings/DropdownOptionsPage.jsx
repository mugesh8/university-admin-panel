import { useMemo } from 'react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { dropdownCategoriesConfig } from '../../lib/mock-data/settings-config.js'

export function DropdownOptionsPage() {
  const rows = useMemo(
    () =>
      dropdownCategoriesConfig.map((c) => ({
        id: c.id,
        category: c.category,
        description: c.description,
        optionCount: c.options.length,
        optionsPreview: c.options.slice(0, 6).join(', ') + (c.options.length > 6 ? '…' : ''),
      })),
    [],
  )

  const columns = [
    { key: 'category', header: 'Category', sortable: true, sortType: 'string' },
    { key: 'description', header: 'Description', sortable: true, sortType: 'string' },
    { key: 'optionCount', header: '# Options', sortable: true, sortType: 'number', numeric: true },
    {
      key: 'optionsPreview',
      header: 'Sample values',
      sortable: true,
      sortType: 'string',
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: () => (
        <Button type="button" variant="ghost" className="!py-1.5 !text-xs">
          Edit options
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button type="button" variant="secondary">
            Add category
          </Button>
        }
      />
      <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} pageSize={10} />
    </div>
  )
}