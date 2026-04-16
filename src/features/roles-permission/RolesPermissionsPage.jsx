import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import {
  permissionLabel,
  rbacModules,
  rbacRoles,
  rolePermissionMatrix,
} from '../../lib/mock-data/roles-permissions.js'

function levelTone(level) {
  if (level === 'full') return 'success'
  if (level === 'edit') return 'info'
  if (level === 'view') return 'warning'
  return 'default'
}

export function RolesPermissionsPage() {
  const roleColumns = [
    {
      key: 'name',
      header: 'Role',
      sortable: true,
      sortType: 'string',
      render: (r) => (
        <div>
          <p className="font-semibold text-[var(--color-heading)]">{r.name}</p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{r.summary}</p>
        </div>
      ),
    },
    {
      key: 'usersAssigned',
      header: 'Users',
      sortable: true,
      sortType: 'number',
      numeric: true,
      render: (r) => <span className="tabular-nums">{r.usersAssigned}</span>,
    },
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
          Edit role
        </Button>
      ),
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[80rem] space-y-6">
      <PageHeader
        actions={
          <>
            <Button type="button" variant="secondary">
              Export matrix
            </Button>
            <Button type="button" variant="primary">
              Add role
            </Button>
          </>
        }
      />
      <div className="space-y-3">
        <DataTable columns={roleColumns} rows={rbacRoles} getRowKey={(r) => r.id} pageSize={10} />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-heading)]">Permission matrix</h2>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              Rows are roles; columns are modules. Full includes create/update/delete where applicable.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                <th className="sticky left-0 z-10 min-w-[140px] bg-[var(--color-bg)] px-3 py-3 font-semibold text-[var(--color-heading)]">
                  Role
                </th>
                {rbacModules.map((m) => (
                  <th
                    key={m.id}
                    className="min-w-[100px] px-2 py-3 text-center text-xs font-semibold leading-tight text-[var(--color-heading)]"
                    title={m.description}
                  >
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rbacRoles.map((role) => (
                <tr key={role.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="sticky left-0 z-10 bg-[var(--color-surface)] px-3 py-2.5 text-xs font-medium text-[var(--color-heading)]">
                    {role.name}
                  </td>
                  {rbacModules.map((m) => {
                    const level = rolePermissionMatrix[role.id]?.[m.id] ?? 'none'
                    const label = permissionLabel(level)
                    return (
                      <td key={m.id} className="px-1 py-2 text-center">
                        <Badge tone={levelTone(level)} className="!text-[10px]">
                          {label}
                        </Badge>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
