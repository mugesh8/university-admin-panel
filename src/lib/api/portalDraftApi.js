import { API_BASE_URL } from '../env.js'
import { assertApiPermission } from './permissionGuard.js'

const DRAFT_BASE = '/api/v1/admin-drafts'

function authHeaders(token) {
  if (token && String(token).trim()) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

export async function saveAdminDraft({ applicationId, formValues, currentStepIndex, savedFromAction }, token) {
  assertApiPermission('applications', 'update')
  const res = await fetch(`${API_BASE_URL}${DRAFT_BASE}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ applicationId, formValues, currentStepIndex, savedFromAction }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Failed to save draft')
  }
  return data
}

export async function getAdminDraft(applicationId, token) {
  assertApiPermission('applications', 'read')
  const res = await fetch(`${API_BASE_URL}${DRAFT_BASE}/${encodeURIComponent(applicationId)}`, {
    headers: authHeaders(token),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Failed to fetch draft')
  }
  return data
}
