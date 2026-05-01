import { API_BASE_URL } from '../env.js'

const PORTAL_AUTH_PREFIXES = ['/api/v1/auth', '/api/auth']

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
  for (const prefix of PORTAL_AUTH_PREFIXES) {
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

export async function requestPortalOtp(email) {
  if (!API_BASE_URL) {
    return { success: false, message: 'Set VITE_API_BASE_URL to your MUCM API (e.g. http://localhost:3000).' }
  }
  return postJson('/request-otp', { email })
}

export async function verifyPortalOtp(email, otp) {
  if (!API_BASE_URL) {
    return { success: false, message: 'Set VITE_API_BASE_URL to your MUCM API (e.g. http://localhost:3000).' }
  }
  return postJson('/verify-otp', { email, otp })
}

export async function fetchPortalMe(token) {
  if (!API_BASE_URL || !token) {
    return { success: false, message: 'Missing API URL or token' }
  }
  let lastFailure = null
  for (const prefix of PORTAL_AUTH_PREFIXES) {
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

