import { API_BASE_URL } from '../env.js'

const ADMIN_ROLES_BASE = `${API_BASE_URL}/api/v1/admin-roles`
const ADMINS_BASE = `${API_BASE_URL}/api/v1/admins`

async function parseJson(res) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { success: false, message: text || 'Invalid response from server' }
  }
}

function headers(token, includeJson = true) {
  const h = {}
  if (includeJson) h['Content-Type'] = 'application/json'
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

function requireApiBase() {
  if (!API_BASE_URL) {
    throw new Error('Set VITE_API_BASE_URL to your MUCM API (e.g. http://localhost:3000).')
  }
}

export async function fetchAdminRoles(token) {
  requireApiBase()
  const res = await fetch(ADMIN_ROLES_BASE, { headers: headers(token, false) })
  return parseJson(res)
}

export async function createAdminRole(payload, token) {
  requireApiBase()
  const res = await fetch(ADMIN_ROLES_BASE, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload),
  })
  return parseJson(res)
}

export async function updateAdminRole(id, payload, token) {
  requireApiBase()
  const res = await fetch(`${ADMIN_ROLES_BASE}/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(payload),
  })
  return parseJson(res)
}

export async function deleteAdminRole(id, token) {
  requireApiBase()
  const res = await fetch(`${ADMIN_ROLES_BASE}/${id}`, {
    method: 'DELETE',
    headers: headers(token, false),
  })
  return parseJson(res)
}

export async function fetchAdmins(token) {
  requireApiBase()
  const res = await fetch(ADMINS_BASE, { headers: headers(token, false) })
  return parseJson(res)
}

export async function createAdmin(payload, token) {
  requireApiBase()
  const res = await fetch(ADMINS_BASE, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload),
  })
  return parseJson(res)
}

export async function updateAdmin(id, payload, token) {
  requireApiBase()
  const res = await fetch(`${ADMINS_BASE}/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(payload),
  })
  return parseJson(res)
}

export async function deleteAdmin(id, token) {
  requireApiBase()
  const res = await fetch(`${ADMINS_BASE}/${id}`, {
    method: 'DELETE',
    headers: headers(token, false),
  })
  return parseJson(res)
}

export async function updateAdminPermissions(id, permissions, token) {
  requireApiBase()
  const res = await fetch(`${ADMINS_BASE}/${id}/permissions`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({ permissions }),
  })
  return parseJson(res)
}

