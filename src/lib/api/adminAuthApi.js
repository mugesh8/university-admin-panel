import { API_BASE_URL } from '../env.js'

const ADMIN_AUTH_PREFIXES = ['/api/v1/admin-auth', '/api/admin-auth']
const ADMINS_PREFIXES = ['/api/v1/admins', '/api/admins']
const ADMIN_ROLES_PREFIXES = ['/api/v1/admin-roles', '/api/admin-roles']

async function parseJson(res) {
  const text = await res.text()
  try {
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === 'object') {
      return { ...parsed, _status: res.status }
    }
    return { success: res.ok, message: 'Unexpected response from server', _status: res.status }
  } catch {
    return { success: false, message: text || 'Invalid response from server', _status: res.status }
  }
}

async function postJson(path, body) {
  let lastFailure = null
  for (const prefix of ADMIN_AUTH_PREFIXES) {
    const res = await fetch(`${API_BASE_URL}${prefix}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await parseJson(res)
    if (data?.success) return data
    if (!lastFailure) lastFailure = data
    if (res.status !== 404) return data
  }
  return lastFailure ?? { success: false, message: 'Unexpected response from server' }
}

async function requestWithFallback(paths, body) {
  let lastFailure = null
  for (const path of paths) {
    const data = await postJson(path, body)
    if (data?.success) return data
    if (!lastFailure) lastFailure = data
    if ((data?._status ?? 0) !== 404) return data
  }
  return lastFailure ?? { success: false, message: 'Unexpected response from server' }
}

export async function requestAdminOtp(email) {
  if (!API_BASE_URL) {
    return { success: false, message: 'Set VITE_API_BASE_URL to your MUCM API (e.g. http://localhost:3000).' }
  }
  return requestWithFallback(['/request-otp', '/send-otp'], { email })
}

export async function verifyAdminOtp(email, otp) {
  if (!API_BASE_URL) {
    return { success: false, message: 'Set VITE_API_BASE_URL to your MUCM API (e.g. http://localhost:3000).' }
  }
  return postJson('/verify-otp', { email, otp })
}

export async function fetchAdminMe(token) {
  if (!API_BASE_URL || !token) {
    return { success: false, message: 'Missing API URL or token' }
  }
  let lastFailure = null
  for (const prefix of ADMIN_AUTH_PREFIXES) {
    const res = await fetch(`${API_BASE_URL}${prefix}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await parseJson(res)
    if (data?.success) return data
    if (!lastFailure) lastFailure = data
    if ((data?._status ?? 0) !== 404) return data
  }
  return lastFailure ?? { success: false, message: 'Unexpected response from server' }
}

async function fetchJson(url, options) {
  const res = await fetch(url, options)
  return parseJson(res)
}

export async function diagnoseAdminLoginEmail(email) {
  if (!API_BASE_URL) return { success: false, message: 'Missing API URL' }
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) return { success: false, message: 'Email is required' }

  let admins = null
  for (const prefix of ADMINS_PREFIXES) {
    const data = await fetchJson(`${API_BASE_URL}${prefix}`, {})
    if (Array.isArray(data?.data)) {
      admins = data.data
      break
    }
  }
  if (!Array.isArray(admins)) {
    return { success: false, message: 'Could not validate admin account status.' }
  }

  const admin = admins.find((row) => String(row?.email || '').trim().toLowerCase() === normalizedEmail)
  if (!admin) {
    return { success: true, status: 'not_found' }
  }
  if (!admin.is_active) {
    return { success: true, status: 'admin_inactive' }
  }

  let roles = null
  for (const prefix of ADMIN_ROLES_PREFIXES) {
    const data = await fetchJson(`${API_BASE_URL}${prefix}`, {})
    if (Array.isArray(data?.data)) {
      roles = data.data
      break
    }
  }

  if (Array.isArray(roles)) {
    const role = roles.find((row) => String(row?.id || '') === String(admin.role_id || ''))
    if (role && role.is_active === false) {
      return { success: true, status: 'role_inactive', roleName: role.name || '' }
    }
  }

  return { success: true, status: 'ok' }
}

