const SESSION_KEY = 'mucm_admin_session'

const ALWAYS_ALLOWED_MODULES = new Set(['dashboard', 'reports'])

const LEVEL_WEIGHT = {
  none: 0,
  view: 1,
  edit: 2,
  full: 3,
}

const MODULE_ALIASES = {
  'support-tickets': 'support_tickets',
  support_tickets: 'support_tickets',
  roles_permissions: 'roles_permissions',
  'roles-permissions': 'roles_permissions',
}

function readSessionUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    return session && typeof session === 'object' ? session : null
  } catch {
    return null
  }
}

function normalizeRoleName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ' ')
}

export function isSuperAdminRole(roleName) {
  return normalizeRoleName(roleName) === 'super admin'
}

export function normalizeModuleId(moduleId) {
  const key = String(moduleId || '').trim()
  return MODULE_ALIASES[key] || key
}

function normalizeLevelFromFlags(flags) {
  if (!flags || typeof flags !== 'object') return 'none'
  if (flags.create || flags.delete || flags.alter) return 'full'
  if (flags.update) return 'edit'
  if (flags.read || flags.readall) return 'view'
  return 'none'
}

function normalizePermissionLevel(value) {
  if (!value) return 'none'
  if (typeof value === 'string') {
    const safe = value.trim().toLowerCase()
    if (safe === 'full' || safe === 'edit' || safe === 'view') return safe
    if (safe === 'none') return 'none'
    return 'none'
  }
  if (typeof value === 'object') return normalizeLevelFromFlags(value)
  return 'none'
}

export function actionToRequiredLevel(action) {
  const safe = String(action || '').trim().toLowerCase()
  if (safe === 'create' || safe === 'update' || safe === 'alter') return 'edit'
  if (safe === 'delete') return 'full'
  if (safe === 'read' || safe === 'readall') return 'view'
  return 'none'
}

export function hasModulePermission(user, moduleId, action = 'read') {
  const normalizedModuleId = normalizeModuleId(moduleId)
  if (!normalizedModuleId) return false
  if (ALWAYS_ALLOWED_MODULES.has(normalizedModuleId)) return true
  if (!user) return false
  if (isSuperAdminRole(user.role)) return true

  const permissions = user.permissions && typeof user.permissions === 'object' ? user.permissions : {}
  const userLevel = normalizePermissionLevel(permissions[normalizedModuleId])
  const required = actionToRequiredLevel(action)
  return LEVEL_WEIGHT[userLevel] >= LEVEL_WEIGHT[required]
}

export function hasCurrentSessionPermission(moduleId, action = 'read') {
  const user = readSessionUser()
  return hasModulePermission(user, moduleId, action)
}
