import { useMemo } from 'react'
import { usePersistentState } from './usePersistentState.js'
import { adminUsers as seedAdminUsers } from '../lib/mock-data/scaffold.js'
import {
  rbacModules,
  rbacRoles as seedRoles,
  rolePermissionMatrix as seedMatrix,
} from '../lib/mock-data/roles-permissions.js'

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function initialState() {
  return {
    roles: deepClone(seedRoles),
    matrix: deepClone(seedMatrix),
    accounts: deepClone(seedAdminUsers),
  }
}

export function normalizeAccount(u, roles) {
  let roleId = u.roleId
  if (!roleId && u.role) {
    const byName = roles.find((r) => r.name === u.role)
    roleId = byName?.id
  }
  if (!roleId && roles.length) roleId = roles[0].id

  return {
    id: u.id,
    name: String(u.name ?? ''),
    email: String(u.email ?? ''),
    roleId,
    active: u.active !== false,
  }
}

/**
 * Ensure every role has a full matrix row, stale rows removed, and admin accounts normalized.
 */
export function normalizeRbacState(raw) {
  if (!raw || typeof raw !== 'object') return initialState()

  const roles = Array.isArray(raw.roles) ? deepClone(raw.roles) : deepClone(seedRoles)
  let matrix =
    raw.matrix && typeof raw.matrix === 'object' ? deepClone(raw.matrix) : deepClone(seedMatrix)

  const roleIds = new Set(roles.map((r) => r.id))
  matrix = Object.fromEntries(Object.entries(matrix).filter(([id]) => roleIds.has(id)))

  for (const r of roles) {
    const row = { ...(matrix[r.id] ?? {}) }
    for (const m of rbacModules) {
      if (row[m.id] === undefined) row[m.id] = 'none'
    }
    matrix[r.id] = row
  }

  const accountsRaw = Array.isArray(raw.accounts) ? raw.accounts : deepClone(seedAdminUsers)
  const fallbackRoleId = roles[0]?.id
  const accounts = accountsRaw.map((u) => normalizeAccount(u, roles)).map((a) => ({
    ...a,
    roleId: roleIds.has(a.roleId) ? a.roleId : fallbackRoleId ?? a.roleId,
  }))

  return { roles, matrix, accounts }
}

/**
 * Mock persistence for roles, permission matrix, and admin accounts (localStorage).
 */
export function useRbacStore() {
  const defaults = useMemo(() => initialState(), [])
  const [raw, setRaw] = usePersistentState('mucm-rbac-v1', defaults)
  const { roles, matrix, accounts } = useMemo(() => normalizeRbacState(raw), [raw])

  function setRbacState(updater) {
    setRaw((prev) => {
      const base = normalizeRbacState(prev)
      const next = typeof updater === 'function' ? updater(base) : updater
      return normalizeRbacState(next)
    })
  }

  return { roles, matrix, accounts, setRbacState, rbacModules }
}
