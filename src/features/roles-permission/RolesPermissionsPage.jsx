import { useState } from 'react'
import { Eye, Pencil, Plus, Trash2, UserPlus, X } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { permissionLabel } from '../../lib/mock-data/roles-permissions.js'
import { useRbacStore } from '../../hooks/useRbacStore.js'

const LEVEL_OPTIONS = [
  { value: 'none', label: '—' },
  { value: 'view', label: 'View' },
  { value: 'edit', label: 'Edit' },
  { value: 'full', label: 'Full' },
]

function levelTone(level) {
  if (level === 'full') return 'success'
  if (level === 'edit') return 'info'
  if (level === 'view') return 'warning'
  return 'default'
}

function ModalBackdrop({ children, onClose, title, wide }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rbac-modal-title"
        className={`max-h-[min(92vh,900px)] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-[#0A1628]/10 ${
          wide ? 'max-w-3xl' : 'max-w-lg'
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#0A1628]/10 px-5 py-4">
          <h2 id="rbac-modal-title" className="text-lg font-semibold text-[var(--color-heading)]">
            {title}
          </h2>
          <button
            type="button"
            className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[#0A1628]/8 hover:text-[var(--color-heading)]"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(min(92vh,900px)-5rem)] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

const textareaClass =
  'min-h-[72px] w-full rounded-xl border border-[#0A1628]/15 bg-white px-3 py-2.5 text-sm text-[#0A1628] placeholder:text-[#0A1628]/45 focus:border-[#D4A843]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/35'

function exportMatrixJson(roles, matrix, modules, accounts) {
  const payload = {
    exportedAt: new Date().toISOString(),
    roles,
    matrix,
    modules,
    adminAccounts: accounts,
  }
  const text = JSON.stringify(payload, null, 2)
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rbac-matrix-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function RolesPermissionsPage() {
  const { roles, matrix, accounts, setRbacState, rbacModules: modules } = useRbacStore()

  const [viewRole, setViewRole] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [formName, setFormName] = useState('')
  const [formSummary, setFormSummary] = useState('')
  const [formActive, setFormActive] = useState(true)
  const [formLevels, setFormLevels] = useState(() => Object.fromEntries(modules.map((m) => [m.id, 'none'])))

  const [accountView, setAccountView] = useState(null)
  const [accountFormOpen, setAccountFormOpen] = useState(false)
  const [accountEditingId, setAccountEditingId] = useState(null)
  const [accountDeleteTarget, setAccountDeleteTarget] = useState(null)
  const [accName, setAccName] = useState('')
  const [accEmail, setAccEmail] = useState('')
  const [accRoleId, setAccRoleId] = useState('')
  const [accActive, setAccActive] = useState(true)

  function countAccountsForRole(roleId) {
    return accounts.filter((a) => a.roleId === roleId).length
  }

  function roleNameById(roleId) {
    return roles.find((r) => r.id === roleId)?.name ?? roleId
  }

  function openAdd() {
    setEditingId(null)
    setFormName('')
    setFormSummary('')
    setFormActive(true)
    setFormLevels(Object.fromEntries(modules.map((m) => [m.id, 'none'])))
    setFormOpen(true)
  }

  function openEdit(t) {
    setEditingId(t.id)
    setFormName(t.name)
    setFormSummary(t.summary)
    setFormActive(Boolean(t.active))
    const row = matrix[t.id] ?? {}
    setFormLevels(
      Object.fromEntries(
        modules.map((m) => {
          const v = row[m.id]
          return [m.id, ['none', 'view', 'edit', 'full'].includes(v) ? v : 'none']
        }),
      ),
    )
    setFormOpen(true)
  }

  function saveForm(e) {
    e.preventDefault()
    const name = formName.trim()
    const summary = formSummary.trim()
    if (!name) return

    const row = { ...formLevels }

    if (editingId) {
      setRbacState((s) => ({
        ...s,
        roles: s.roles.map((r) =>
          r.id === editingId ? { ...r, name, summary, active: formActive } : r,
        ),
        matrix: { ...s.matrix, [editingId]: row },
      }))
    } else {
      const id = `role_${Date.now()}`
      setRbacState((s) => ({
        ...s,
        roles: [...s.roles, { id, name, summary, active: formActive, usersAssigned: 0 }],
        matrix: { ...s.matrix, [id]: row },
      }))
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    const rid = deleteTarget.id
    setRbacState((s) => ({
      ...s,
      roles: s.roles.filter((r) => r.id !== rid),
      matrix: Object.fromEntries(Object.entries(s.matrix).filter(([k]) => k !== rid)),
      accounts: s.accounts.filter((a) => a.roleId !== rid),
    }))
    if (viewRole?.id === rid) setViewRole(null)
    setDeleteTarget(null)
  }

  function openAccountAdd() {
    setAccountEditingId(null)
    setAccName('')
    setAccEmail('')
    setAccRoleId(roles[0]?.id ?? '')
    setAccActive(true)
    setAccountFormOpen(true)
  }

  function openAccountEdit(a) {
    setAccountEditingId(a.id)
    setAccName(a.name)
    setAccEmail(a.email)
    setAccRoleId(a.roleId)
    setAccActive(Boolean(a.active))
    setAccountFormOpen(true)
  }

  function saveAccount(e) {
    e.preventDefault()
    const name = accName.trim()
    const email = accEmail.trim()
    if (!name || !email || !accRoleId) return

    if (accountEditingId) {
      setRbacState((s) => ({
        ...s,
        accounts: s.accounts.map((a) =>
          a.id === accountEditingId ? { ...a, name, email, roleId: accRoleId, active: accActive } : a,
        ),
      }))
    } else {
      const id = `u_${Date.now()}`
      setRbacState((s) => ({
        ...s,
        accounts: [...s.accounts, { id, name, email, roleId: accRoleId, active: accActive }],
      }))
    }
    setAccountFormOpen(false)
  }

  function confirmAccountDelete() {
    if (!accountDeleteTarget) return
    setRbacState((s) => ({
      ...s,
      accounts: s.accounts.filter((a) => a.id !== accountDeleteTarget.id),
    }))
    if (accountView?.id === accountDeleteTarget.id) setAccountView(null)
    setAccountDeleteTarget(null)
  }

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
      sortValue: (r) => countAccountsForRole(r.id),
      render: (r) => (
        <span className="tabular-nums" title="Accounts assigned to this role">
          {countAccountsForRole(r.id)}
        </span>
      ),
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
      render: (r) => (
        <div className="flex flex-wrap items-center gap-1">
          <Button type="button" variant="ghost" className="!px-2 !py-1.5 !text-xs" onClick={() => setViewRole(r)}>
            <Eye className="h-3.5 w-3.5" aria-hidden />
            View
          </Button>
          <Button type="button" variant="ghost" className="!px-2 !py-1.5 !text-xs" onClick={() => openEdit(r)}>
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="!px-2 !py-1.5 !text-xs text-red-700 hover:bg-red-50"
            onClick={() => setDeleteTarget(r)}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[80rem] space-y-6">
      <PageHeader
        actions={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => exportMatrixJson(roles, matrix, modules, accounts)}
            >
              Export matrix
            </Button>
            <Button type="button" variant="secondary" onClick={openAccountAdd}>
              <UserPlus className="h-4 w-4" aria-hidden />
              Create role account
            </Button>
            <Button type="button" variant="primary" onClick={openAdd}>
              <Plus className="h-4 w-4" aria-hidden />
              Add role
            </Button>
          </>
        }
      />
      <div className="space-y-3">
        <DataTable columns={roleColumns} rows={roles} getRowKey={(r) => r.id} pageSize={10} />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-heading)]">Admin accounts</h2>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              Staff logins linked to a role. Counts in the roles table match these rows.
            </p>
          </div>
          <Button type="button" onClick={openAccountAdd}>
            <UserPlus className="h-4 w-4" aria-hidden />
            Create role account
          </Button>
        </div>
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Name',
              sortable: true,
              sortType: 'string',
              render: (a) => <span className="font-medium text-[var(--color-heading)]">{a.name}</span>,
            },
            {
              key: 'email',
              header: 'Email',
              sortable: true,
              sortType: 'string',
              render: (a) => <span className="text-sm text-[var(--color-text)]">{a.email}</span>,
            },
            {
              key: 'roleId',
              header: 'Role',
              sortable: true,
              sortType: 'string',
              sortValue: (a) => roleNameById(a.roleId),
              render: (a) => <Badge tone="info">{roleNameById(a.roleId)}</Badge>,
            },
            {
              key: 'active',
              header: 'Status',
              sortable: true,
              sortType: 'number',
              sortValue: (a) => (a.active ? 1 : 0),
              render: (a) => (
                <Badge tone={a.active ? 'success' : 'default'}>{a.active ? 'Active' : 'Inactive'}</Badge>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (a) => (
                <div className="flex flex-wrap gap-1">
                  <Button type="button" variant="ghost" className="!px-2 !py-1.5 !text-xs" onClick={() => setAccountView(a)}>
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    View
                  </Button>
                  <Button type="button" variant="ghost" className="!px-2 !py-1.5 !text-xs" onClick={() => openAccountEdit(a)}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="!px-2 !py-1.5 !text-xs text-red-700 hover:bg-red-50"
                    onClick={() => setAccountDeleteTarget(a)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          rows={accounts}
          getRowKey={(a) => a.id}
          pageSize={10}
          emptyMessage="No admin accounts yet. Create one to assign a user to a role."
        />
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
                {modules.map((m) => (
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
              {roles.map((role) => (
                <tr key={role.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="sticky left-0 z-10 bg-[var(--color-surface)] px-3 py-2.5 text-xs font-medium text-[var(--color-heading)]">
                    {role.name}
                  </td>
                  {modules.map((m) => {
                    const level = matrix[role.id]?.[m.id] ?? 'none'
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

      {viewRole ? (
        <ModalBackdrop wide title={viewRole.name} onClose={() => setViewRole(null)}>
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">{viewRole.summary}</p>
            <div className="flex flex-wrap gap-2">
              <Badge tone={viewRole.active ? 'success' : 'warning'}>{viewRole.active ? 'Active' : 'Inactive'}</Badge>
              <span className="text-xs text-[var(--color-text-muted)]">
                {countAccountsForRole(viewRole.id)} account{countAccountsForRole(viewRole.id) === 1 ? '' : 's'} for this role
              </span>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Module permissions
              </p>
              <div className="max-h-[320px] space-y-2 overflow-y-auto rounded-xl border border-[#0A1628]/10 bg-[var(--color-bg)] p-3">
                {modules.map((m) => {
                  const level = matrix[viewRole.id]?.[m.id] ?? 'none'
                  return (
                    <div key={m.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-[var(--color-heading)]">{m.label}</span>
                      <Badge tone={levelTone(level)}>{permissionLabel(level)}</Badge>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              <Button type="button" variant="secondary" onClick={() => setViewRole(null)}>
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const r = viewRole
                  setViewRole(null)
                  openEdit(r)
                }}
              >
                Edit role
              </Button>
            </div>
          </div>
        </ModalBackdrop>
      ) : null}

      {formOpen ? (
        <ModalBackdrop wide title={editingId ? 'Edit role' : 'Add role'} onClose={() => setFormOpen(false)}>
          <form onSubmit={saveForm} className="space-y-4">
            <Input label="Role name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            <div className="w-full">
              <label htmlFor="rbac-summary" className="mb-1.5 block text-sm font-medium text-[var(--color-heading)]">
                Description
              </label>
              <textarea
                id="rbac-summary"
                className={textareaClass}
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                placeholder="What this role is for…"
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              User count for this role is managed under <strong className="text-[var(--color-heading)]">Admin accounts</strong>{' '}
              (create or move accounts to this role).
            </p>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-heading)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
              />
              Active
            </label>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Permissions by module
              </p>
              <div className="max-h-[min(40vh,360px)] space-y-2 overflow-y-auto rounded-xl border border-[#0A1628]/10 bg-[var(--color-bg)] p-3">
                {modules.map((m) => (
                  <div key={m.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <span className="min-w-0 flex-1 text-sm font-medium text-[var(--color-heading)]">{m.label}</span>
                    <div className="min-w-[140px]">
                      <Select
                        label=""
                        value={formLevels[m.id] ?? 'none'}
                        onChange={(e) =>
                          setFormLevels((prev) => ({ ...prev, [m.id]: e.target.value }))
                        }
                        aria-label={`Permission for ${m.label}`}
                      >
                        {LEVEL_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? 'Save role' : 'Create role'}</Button>
            </div>
          </form>
        </ModalBackdrop>
      ) : null}

      {deleteTarget ? (
        <ModalBackdrop title="Delete role?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--color-text)]">
            Delete <span className="font-semibold text-[var(--color-heading)]">{deleteTarget.name}</span>?{' '}
            {countAccountsForRole(deleteTarget.id) > 0 ? (
              <>
                <span className="font-medium text-[var(--color-heading)]">
                  {countAccountsForRole(deleteTarget.id)} admin account(s)
                </span>{' '}
                linked to this role will also be removed.{' '}
              </>
            ) : null}
            This cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </ModalBackdrop>
      ) : null}

      {accountView ? (
        <ModalBackdrop title="Account" onClose={() => setAccountView(null)}>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Name</p>
              <p className="mt-1 font-medium text-[var(--color-heading)]">{accountView.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Email</p>
              <p className="mt-1 text-[var(--color-text)]">{accountView.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Role</p>
              <div className="mt-1">
                <Badge tone="info">{roleNameById(accountView.roleId)}</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Status</p>
              <div className="mt-1">
                <Badge tone={accountView.active ? 'success' : 'default'}>
                  {accountView.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Passwords are managed by your identity provider (demo: not stored in the browser).
            </p>
            <div className="flex justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              <Button type="button" variant="secondary" onClick={() => setAccountView(null)}>
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const a = accountView
                  setAccountView(null)
                  openAccountEdit(a)
                }}
              >
                Edit account
              </Button>
            </div>
          </div>
        </ModalBackdrop>
      ) : null}

      {accountFormOpen ? (
        <ModalBackdrop title={accountEditingId ? 'Edit account' : 'Create role account'} onClose={() => setAccountFormOpen(false)}>
          <form onSubmit={saveAccount} className="space-y-4">
            <Input label="Full name" value={accName} onChange={(e) => setAccName(e.target.value)} required />
            <Input
              type="email"
              label="Work email"
              value={accEmail}
              onChange={(e) => setAccEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Select label="Role" value={accRoleId} onChange={(e) => setAccRoleId(e.target.value)} required>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-heading)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                checked={accActive}
                onChange={(e) => setAccActive(e.target.checked)}
              />
              Active (can sign in)
            </label>
            {!accountEditingId ? (
              <p className="text-xs text-[var(--color-text-muted)]">
                An invite or temporary password would be sent by email in production (not simulated here).
              </p>
            ) : null}
            <div className="flex flex-wrap justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              <Button type="button" variant="secondary" onClick={() => setAccountFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{accountEditingId ? 'Save account' : 'Create account'}</Button>
            </div>
          </form>
        </ModalBackdrop>
      ) : null}

      {accountDeleteTarget ? (
        <ModalBackdrop title="Delete account?" onClose={() => setAccountDeleteTarget(null)}>
          <p className="text-sm text-[var(--color-text)]">
            Remove <span className="font-semibold text-[var(--color-heading)]">{accountDeleteTarget.email}</span> from admin
            access? This cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setAccountDeleteTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmAccountDelete}>
              Delete
            </Button>
          </div>
        </ModalBackdrop>
      ) : null}
    </div>
  )
}
