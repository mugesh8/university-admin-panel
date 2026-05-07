import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'
import { hasModulePermission } from '../../lib/auth/adminPermissions.js'

export function PermissionRoute({ moduleId, action = 'read', fallbackTo = '/dashboard', children }) {
  const { user } = useAuth()
  const location = useLocation()
  const allowed = hasModulePermission(user, moduleId, action)
  if (!allowed) {
    return <Navigate to={fallbackTo} replace state={{ from: location.pathname }} />
  }
  return children
}
