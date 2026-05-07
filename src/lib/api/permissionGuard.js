import { hasCurrentSessionPermission, normalizeModuleId } from '../auth/adminPermissions.js'

function permissionDeniedMessage(moduleId, action) {
  const moduleLabel = String(moduleId || '').replace(/[_-]/g, ' ').trim() || 'resource'
  return `You do not have ${action} permission for ${moduleLabel}.`
}

export function actionFromMethod(method) {
  const safe = String(method || 'GET').toUpperCase()
  if (safe === 'POST') return 'create'
  if (safe === 'PUT' || safe === 'PATCH') return 'update'
  if (safe === 'DELETE') return 'delete'
  return 'readall'
}

export function assertApiPermission(moduleId, action) {
  const normalizedModuleId = normalizeModuleId(moduleId)
  if (hasCurrentSessionPermission(normalizedModuleId, action)) return
  throw new Error(permissionDeniedMessage(normalizedModuleId, action))
}
