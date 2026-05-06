import { useEffect, useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Trash2, UserPlus, X } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { permissionLabel, rbacModules } from '../../lib/mock-data/roles-permissions.js'
import { countries } from '../../lib/application-form/countries.js'
import { useAuth } from '../auth/useAuth.js'
import {
  createAdmin,
  createAdminRole,
  deleteAdmin,
  deleteAdminRole,
  fetchAdmins,
  fetchAdminRoles,
  updateAdmin,
  updateAdminPermissions,
  updateAdminRole,
} from '../../lib/api/adminRbacApi.js'

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

export function RolesPermissionsPage() {
  const { token } = useAuth()
  const modules = rbacModules
  const [roles, setRoles] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('admin')

  const [viewRole, setViewRole] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [formName, setFormName] = useState('')
  const [formSummary, setFormSummary] = useState('')
  const [formActive, setFormActive] = useState(true)

  const [accountView, setAccountView] = useState(null)
  const [accountPermissionsView, setAccountPermissionsView] = useState(null)
  const [accountPermissionDraft, setAccountPermissionDraft] = useState({})
  const [accountFormOpen, setAccountFormOpen] = useState(false)
  const [accountEditingId, setAccountEditingId] = useState(null)
  const [accountDeleteTarget, setAccountDeleteTarget] = useState(null)
  const [accName, setAccName] = useState('')
  const [accEmail, setAccEmail] = useState('')
  const [accRegion, setAccRegion] = useState('')
  const [accRoleId, setAccRoleId] = useState('')
  const [accActive, setAccActive] = useState(true)

  const matrix = useMemo(() => {
    const firstByRole = {}
    for (const a of accounts) {
      if (!firstByRole[a.roleId] && a.permissions && typeof a.permissions === 'object') {
        firstByRole[a.roleId] = a.permissions
      }
    }
    const out = {}
    for (const role of roles) out[role.id] = firstByRole[role.id] || {}
    return out
  }, [accounts, roles])

  async function loadRbacData() {
    setLoading(true)
    setError('')
    try {
      const [rolesRes, adminsRes] = await Promise.all([fetchAdminRoles(token), fetchAdmins(token)])
      if (!rolesRes.success) throw new Error(rolesRes.message || 'Failed to load roles')
      if (!adminsRes.success) throw new Error(adminsRes.message || 'Failed to load admins')

      setRoles(
        (rolesRes.data || []).map((r) => ({
          id: r.id,
          name: r.name,
          summary: r.summary || '',
          active: Boolean(r.is_active),
          usersAssigned: Number(r.users_assigned || 0),
        })),
      )
      setAccounts(
        (adminsRes.data || []).map((a) => ({
          id: a.id,
          name: a.full_name || '',
          email: a.email || '',
          country: a.country || a.region || '',
          roleId: a.role_id,
          roleName: a.role?.name || '',
          active: Boolean(a.is_active),
          permissions: a.permissions && typeof a.permissions === 'object' ? a.permissions : {},
        })),
      )
    } catch (e) {
      setError(e.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRbacData()
  }, [token])

  function countAccountsForRole(roleId) {
    return accounts.filter((a) => a.roleId === roleId).length
  }

  function roleNameById(roleId) {
    const fromRole = roles.find((r) => r.id === roleId)?.name
    const fromAdmin = accounts.find((a) => a.roleId === roleId)?.roleName
    return fromRole ?? fromAdmin ?? roleId
  }

  const permissionPopupModules = modules
    .filter((m) => m.id !== 'users_logs')
    .sort((a, b) => {
      if (a.id === 'roles_permissions' && b.id === 'settings') return -1
      if (a.id === 'settings' && b.id === 'roles_permissions') return 1
      return 0
    })

  function crudForLevel(level) {
    if (level === 'full') return { create: true, read: true, update: true, delete: true }
    if (level === 'edit') return { create: false, read: true, update: true, delete: false }
    if (level === 'view') return { create: false, read: true, update: false, delete: false }
    return { create: false, read: false, update: false, delete: false }
  }

  function levelFromCrudFlags(flags) {
    if (flags.create || flags.delete) return 'full'
    if (flags.update) return 'edit'
    if (flags.read) return 'view'
    return 'none'
  }

  function openAccountPermissions(a) {
    const roleMatrix = a.permissions && typeof a.permissions === 'object' ? a.permissions : {}
    const draft = Object.fromEntries(
      permissionPopupModules.map((m) => {
        const level = roleMatrix[m.id] ?? 'none'
        return [m.id, crudForLevel(level)]
      }),
    )
    setAccountPermissionDraft(draft)
    setAccountPermissionsView(a)
  }

  function enableAllPermissions() {
    const allEnabled = Object.fromEntries(
      permissionPopupModules.map((m) => [
        m.id,
        { create: true, read: true, update: true, delete: true },
      ]),
    )
    setAccountPermissionDraft(allEnabled)
  }

  function toggleAccountCrud(moduleId, key, checked) {
    setAccountPermissionDraft((prev) => {
      const current = prev[moduleId] ?? { create: false, read: false, update: false, delete: false }
      const next = { ...current, [key]: checked }
      return { ...prev, [moduleId]: next }
    })
  }

  function toggleColumn(key, checked) {
    setAccountPermissionDraft((prev) => {
      const next = { ...prev }
      for (const m of permissionPopupModules) {
        next[m.id] = { ...(next[m.id] || { create: false, read: false, update: false, delete: false }), [key]: checked }
      }
      return next
    })
  }

  async function saveAccountPermissions() {
    if (!accountPermissionsView) return
    const nextRow = Object.fromEntries(
      permissionPopupModules.map((m) => {
        const flags = accountPermissionDraft[m.id] ?? { create: false, read: false, update: false, delete: false }
        return [m.id, levelFromCrudFlags(flags)]
      }),
    )
    const res = await updateAdminPermissions(accountPermissionsView.id, nextRow, token)
    if (!res.success) {
      setError(res.message || 'Failed to save permissions')
      return
    }
    await loadRbacData()
    setAccountPermissionsView(null)
  }

  function openAdd() {
    setEditingId(null)
    setFormName('')
    setFormSummary('')
    setFormActive(true)
    setFormOpen(true)
  }

  function openEdit(t) {
    setEditingId(t.id)
    setFormName(t.name)
    setFormSummary(t.summary)
    setFormActive(Boolean(t.active))
    setFormOpen(true)
  }

  async function saveForm(e) {
    e.preventDefault()
    const name = formName.trim()
    const summary = formSummary.trim()
    if (!name) return

    if (editingId) {
      const res = await updateAdminRole(editingId, { name, summary: summary || null, is_active: formActive }, token)
      if (!res.success) {
        setError(res.message || 'Failed to update role')
        return
      }
    } else {
      const res = await createAdminRole({ name, summary: summary || null, is_active: formActive }, token)
      if (!res.success) {
        setError(res.message || 'Failed to create role')
        return
      }
    }
    await loadRbacData()
    setFormOpen(false)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const rid = deleteTarget.id
    const res = await deleteAdminRole(rid, token)
    if (!res.success) {
      setError(res.message || 'Failed to delete role')
      return
    }
    await loadRbacData()
    if (viewRole?.id === rid) setViewRole(null)
    setDeleteTarget(null)
  }

  function openAccountAdd() {
    setAccountEditingId(null)
    setAccName('')
    setAccEmail('')
    setAccRegion('')
    setAccRoleId(roles[0]?.id ?? '')
    setAccActive(true)
    setAccountFormOpen(true)
  }

  function openAccountEdit(a) {
    setAccountEditingId(a.id)
    setAccName(a.name)
    setAccEmail(a.email)
    setAccRegion(a.country || '')
    setAccRoleId(a.roleId)
    setAccActive(Boolean(a.active))
    setAccountFormOpen(true)
  }

  async function saveAccount(e) {
    e.preventDefault()
    const name = accName.trim()
    const email = accEmail.trim()
    const region = accRegion.trim()
    if (!name || !email || !region || !accRoleId) return

    if (accountEditingId) {
      const res = await updateAdmin(
        accountEditingId,
        { full_name: name, email, country: region, role_id: accRoleId, is_active: accActive },
        token,
      )
      if (!res.success) {
        setError(res.message || 'Failed to update account')
        return
      }
    } else {
      const res = await createAdmin(
        { full_name: name, email, country: region, role_id: accRoleId, is_active: accActive },
        token,
      )
      if (!res.success) {
        setError(res.message || 'Failed to create account')
        return
      }
    }
    await loadRbacData()
    setAccountFormOpen(false)
  }

  async function confirmAccountDelete() {
    if (!accountDeleteTarget) return
    const res = await deleteAdmin(accountDeleteTarget.id, token)
    if (!res.success) {
      setError(res.message || 'Failed to delete account')
      return
    }
    await loadRbacData()
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
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}
      <PageHeader
        actions={
          <>
            {activeTab === 'admin' ? (
              <Button type="button" variant="secondary" onClick={openAccountAdd}>
                <UserPlus className="h-4 w-4" aria-hidden />
                Create role account
              </Button>
            ) : (
              <Button type="button" variant="primary" onClick={openAdd}>
                <Plus className="h-4 w-4" aria-hidden />
                Add role
              </Button>
            )}
          </>
        }
      />
      <div className="inline-flex rounded-xl border border-[#0A1628]/12 bg-white p-1">
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'admin' ? 'bg-[#0A1628] text-white' : 'text-[#0A1628] hover:bg-[#0A1628]/8'
          }`}
          onClick={() => setActiveTab('admin')}
        >
          Admin
        </button>
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'roles' ? 'bg-[#0A1628] text-white' : 'text-[#0A1628] hover:bg-[#0A1628]/8'
          }`}
          onClick={() => setActiveTab('roles')}
        >
          Admin roles
        </button>
      </div>

      {activeTab === 'roles' ? (
        <div className="space-y-3">
          <DataTable columns={roleColumns} rows={roles} getRowKey={(r) => r.id} pageSize={10} />
        </div>
      ) : (
        <div className="space-y-3">
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
                key: 'region',
                header: 'Country',
                sortable: true,
                sortType: 'string',
                render: (a) => <span className="text-sm text-[var(--color-text)]">{a.country || a.region || '-'}</span>,
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
                      className="!px-2 !py-1.5 !text-xs"
                      onClick={() => openAccountPermissions(a)}
                    >
                      Permissions
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
      )}
      {loading ? <p className="text-xs text-[var(--color-text-muted)]">Loading...</p> : null}

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
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-heading)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
              />
              Active
            </label>
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
              Passwords are managed by backend auth.
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
            <Select label="Region (Country)" value={accRegion} onChange={(e) => setAccRegion(e.target.value)} required>
              <option value="" disabled>
                Select a country
              </option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
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
              Authorized(can sign in)
            </label>
            <div className="flex flex-wrap justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              <Button type="button" variant="secondary" onClick={() => setAccountFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{accountEditingId ? 'Save account' : 'Create account'}</Button>
            </div>
          </form>
        </ModalBackdrop>
      ) : null}

      {accountPermissionsView ? (
        <ModalBackdrop
          wide
          title={`Permissions · ${accountPermissionsView.name}`}
          onClose={() => setAccountPermissionsView(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Role: <span className="font-semibold text-[var(--color-heading)]">{roleNameById(accountPermissionsView.roleId)}</span>
            </p>
            <div className="flex justify-end">
              <Button type="button" variant="secondary" size="sm" onClick={enableAllPermissions}>
                Check all permissions
              </Button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#0A1628]/10">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#0A1628]/10 bg-[var(--color-bg)]">
                    <th className="px-3 py-2.5 text-left font-semibold text-[var(--color-heading)]">Sidebar link</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-[var(--color-heading)]">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                          title="Toggle Create for all"
                          onChange={(e) => toggleColumn('create', e.target.checked)}
                        />
                        <span>Create</span>
                      </div>
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold text-[var(--color-heading)]">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                          title="Toggle Read for all"
                          onChange={(e) => toggleColumn('read', e.target.checked)}
                        />
                        <span>Read</span>
                      </div>
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold text-[var(--color-heading)]">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                          title="Toggle Update for all"
                          onChange={(e) => toggleColumn('update', e.target.checked)}
                        />
                        <span>Update</span>
                      </div>
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold text-[var(--color-heading)]">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                          title="Toggle Delete for all"
                          onChange={(e) => toggleColumn('delete', e.target.checked)}
                        />
                        <span>Delete</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {permissionPopupModules.map((m) => {
                    const access = accountPermissionDraft[m.id] ?? {
                      create: false,
                      read: false,
                      update: false,
                      delete: false,
                    }
                    return (
                      <tr key={m.id} className="border-b border-[#0A1628]/10 last:border-0">
                        <td className="px-3 py-2.5 text-[var(--color-heading)]">
                          <p className="font-medium">{m.label}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{m.description}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                            checked={access.create}
                            onChange={(e) => toggleAccountCrud(m.id, 'create', e.target.checked)}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                            checked={access.read}
                            onChange={(e) => toggleAccountCrud(m.id, 'read', e.target.checked)}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                            checked={access.update}
                            onChange={(e) => toggleAccountCrud(m.id, 'update', e.target.checked)}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-[#0A1628]/25 text-[#0A1628] focus:ring-[#D4A843]/50"
                            checked={access.delete}
                            onChange={(e) => toggleAccountCrud(m.id, 'delete', e.target.checked)}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Saving here updates the selected role permissions for all admins mapped to that role.
            </p>
            <div className="flex justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              <Button type="button" variant="secondary" onClick={() => setAccountPermissionsView(null)}>
                Close
              </Button>
              <Button type="button" onClick={saveAccountPermissions}>
                Save permissions
              </Button>
            </div>
          </div>
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
