import { API_BASE_URL } from '../env.js'

const DEFAULT_APPLICATION_PREFIX = '/api/v1/applications'
const APPLICATION_PREFIX_CANDIDATES = [
  '/api/v1/applications',
  '/api/applications',
  '/applications',
  '/application',
]

function buildPrefixes(preferredPrefix) {
  const first = preferredPrefix || DEFAULT_APPLICATION_PREFIX
  const all = [first, ...APPLICATION_PREFIX_CANDIDATES]
  return [...new Set(all)].map((prefix) => prefix.replace(/\/+$/, '') || '/applications')
}

function authHeaders(token) {
  if (token && String(token).trim()) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

async function requestAcrossPrefixes({ method, path, payload, token, preferredPrefix }) {
  if (!API_BASE_URL) {
    throw new Error('Set VITE_API_BASE_URL to your MUCM API (e.g. http://localhost:3000).')
  }

  const prefixes = buildPrefixes(preferredPrefix)
  let lastError = null

  for (const prefix of prefixes) {
    const endpoint = `${API_BASE_URL}${prefix}${path}`
    let response
    let data = {}
    try {
      response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(token),
        },
        body: payload === undefined ? undefined : JSON.stringify(payload),
      })
      data = await response.json().catch(() => ({}))
    } catch {
      throw new Error('API server is unreachable. Please verify backend server and API base URL.')
    }

    if (response.ok && data.success !== false) {
      return { data, preferredPrefix: prefix }
    }
    if (response.status === 404) {
      lastError = new Error(data.message || 'Application endpoint not found.')
      continue
    }
    throw new Error(data.message || `Failed API request for ${path}`)
  }

  throw lastError || new Error('Application endpoint not found.')
}

export async function createApplication(payload, options = {}) {
  return requestAcrossPrefixes({
    method: 'POST',
    path: '',
    payload,
    token: options.token,
    preferredPrefix: options.preferredPrefix,
  })
}

export async function updateApplication(applicationRowId, payload, options = {}) {
  return requestAcrossPrefixes({
    method: 'PUT',
    path: `/${applicationRowId}`,
    payload,
    token: options.token,
    preferredPrefix: options.preferredPrefix,
  })
}

export async function fetchApplicationByApplicationId(applicationId, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('Set VITE_API_BASE_URL to your MUCM API (e.g. http://localhost:3000).')
  }

  const safeApplicationId = encodeURIComponent(String(applicationId || '').trim())
  if (!safeApplicationId) {
    return { application: null, preferredPrefix: options.preferredPrefix || DEFAULT_APPLICATION_PREFIX }
  }

  const prefixes = buildPrefixes(options.preferredPrefix)
  const query = options.full ? '?full=true' : ''
  for (const prefix of prefixes) {
    const endpoint = `${API_BASE_URL}${prefix}/by-application-id/${safeApplicationId}${query}`
    let response
    let data = {}
    try {
      response = await fetch(endpoint, { headers: authHeaders(options.token) })
      data = await response.json().catch(() => ({}))
    } catch {
      throw new Error('API server is unreachable. Please verify backend server and API base URL.')
    }

    if (response.ok && data.success !== false) {
      return {
        application: data.data || data.application || data,
        preferredPrefix: prefix,
      }
    }
    if (response.status === 404) {
      continue
    }
    throw new Error(data.message || 'Failed to fetch application.')
  }

  return { application: null, preferredPrefix: options.preferredPrefix || DEFAULT_APPLICATION_PREFIX }
}

export async function listApplications(options = {}) {
  const search = new URLSearchParams()
  if (options.status) search.set('status', options.status)
  if (options.program_id) search.set('program_id', options.program_id)
  if (options.intake_id) search.set('intake_id', options.intake_id)
  if (options.page) search.set('page', String(options.page))
  if (options.limit) search.set('limit', String(options.limit))

  const query = search.toString() ? `?${search.toString()}` : ''
  const response = await requestAcrossPrefixes({
    method: 'GET',
    path: `${query}`,
    token: options.token,
    preferredPrefix: options.preferredPrefix,
  })
  return {
    data: Array.isArray(response.data?.data) ? response.data.data : [],
    pagination: response.data?.pagination ?? null,
    preferredPrefix: response.preferredPrefix,
  }
}

export async function fetchApplicationByRowId(applicationRowId, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('Set VITE_API_BASE_URL to your MUCM API (e.g. http://localhost:3000).')
  }
  const safeId = encodeURIComponent(String(applicationRowId || '').trim())
  if (!safeId) {
    return { application: null, preferredPrefix: options.preferredPrefix || DEFAULT_APPLICATION_PREFIX }
  }

  const prefixes = buildPrefixes(options.preferredPrefix)
  const query = options.full ? '?full=true' : ''
  for (const prefix of prefixes) {
    const endpoint = `${API_BASE_URL}${prefix}/${safeId}${query}`
    let response
    let data = {}
    try {
      response = await fetch(endpoint, { headers: authHeaders(options.token) })
      data = await response.json().catch(() => ({}))
    } catch {
      throw new Error('API server is unreachable. Please verify backend server and API base URL.')
    }

    if (response.ok && data.success !== false) {
      return {
        application: data.data || data.application || data,
        preferredPrefix: prefix,
      }
    }
    if (response.status === 404) {
      continue
    }
    throw new Error(data.message || 'Failed to fetch application.')
  }

  return { application: null, preferredPrefix: options.preferredPrefix || DEFAULT_APPLICATION_PREFIX }
}

