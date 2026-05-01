import { API_BASE_URL } from '../env.js'

const SUPERADMIN_AUTH_PREFIXES = ['/api/v1/superadmin-auth', '/api/superadmin-auth']

async function parseJson(res) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { success: false, message: text || 'Invalid response from server' }
  }
}

async function postJson(path, body) {
  let lastFailure = null
  for (const prefix of SUPERADMIN_AUTH_PREFIXES) {
    const res = await fetch(`${API_BASE_URL}${prefix}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await parseJson(res)
    if (data?.success) return data
    if (!lastFailure) lastFailure = data
  }
  return lastFailure ?? { success: false, message: 'Unexpected response from server' }
}

async function requestWithFallback(paths, body) {
  let lastFailure = null
  for (const path of paths) {
    const data = await postJson(path, body)
    if (data?.success) return data
    if (!lastFailure) lastFailure = data
  }
  if (lastFailure) return lastFailure
  return { success: false, message: 'Unexpected response from server' }
}

export async function requestSuperAdminOtp(email) {
  if (!API_BASE_URL) {
    return { success: false, message: 'Set VITE_API_BASE_URL to your MUCM API (e.g. http://localhost:3000).' }
  }
  return requestWithFallback(['/request-otp', '/send-otp'], { email })
}

export async function verifySuperAdminOtp(email, otp) {
  if (!API_BASE_URL) {
    return { success: false, message: 'Set VITE_API_BASE_URL to your MUCM API (e.g. http://localhost:3000).' }
  }
  return requestWithFallback(['/verify-otp', '/verify-otp-signup'], { email, otp })
}

export async function fetchSuperAdminMe(token) {
  if (!API_BASE_URL || !token) {
    return { success: false, message: 'Missing API URL or token' }
  }
  let lastFailure = null
  for (const prefix of SUPERADMIN_AUTH_PREFIXES) {
    const res = await fetch(`${API_BASE_URL}${prefix}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await parseJson(res)
    if (data?.success) return data
    if (!lastFailure) lastFailure = data
  }
  return lastFailure ?? { success: false, message: 'Unexpected response from server' }
}
