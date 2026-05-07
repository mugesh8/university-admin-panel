import { API_BASE_URL } from '../env.js'
import { actionFromMethod, assertApiPermission } from './permissionGuard.js'

const BREVO_BASE = `${API_BASE_URL}/api/v1/brevo`

function authHeaders(token) {
  if (token && String(token).trim()) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

async function request(path = '', options = {}, token) {
  assertApiPermission('communications', actionFromMethod(options.method || 'GET'))
  if (!API_BASE_URL) {
    throw new Error('Set VITE_API_BASE_URL to your MUCM API (e.g. http://localhost:5000).')
  }
  const hasBody = options.body !== undefined
  const res = await fetch(`${BREVO_BASE}${path}`, {
    headers: {
      ...authHeaders(token),
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  })

  let body = null
  try {
    body = await res.json()
  } catch {
    body = null
  }

  if (!res.ok || body?.success === false) {
    throw new Error(body?.message || 'Brevo API request failed')
  }

  return body
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Templates                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Fetch Brevo templates from the backend.
 * @param {string} token
 * @param {{ status?: 'active'|'inactive', limit?: number, offset?: number }} [opts]
 * @returns {Promise<BrevoTemplate[]>}
 */
export async function fetchBrevoTemplates(token, opts = {}) {
  const params = new URLSearchParams()
  if (opts.status) params.set('status', opts.status)
  if (opts.limit) params.set('limit', String(opts.limit))
  if (opts.offset) params.set('offset', String(opts.offset))
  const qs = params.toString()
  const body = await request(qs ? `/templates?${qs}` : '/templates', { method: 'GET' }, token)
  return Array.isArray(body?.data) ? body.data : []
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Single send                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Send a Brevo template email to a single recipient.
 * @param {string} token
 * @param {{
 *   template_id: number,
 *   to?: string,
 *   to_name?: string,
 *   application_id?: string,
 *   application_ref?: string,
 *   params?: Record<string, string>
 * }} payload
 */
export async function sendBrevoTemplateEmail(token, payload) {
  const body = await request('/send', { method: 'POST', body: JSON.stringify(payload) }, token)
  return body?.data ?? {}
}

/**
 * Send a raw (custom subject + body) email via Brevo.
 * @param {string} token
 * @param {{
 *   to?: string,
 *   to_name?: string,
 *   subject: string,
 *   body: string,
 *   application_id?: string,
 *   application_ref?: string
 * }} payload
 */
export async function sendBrevoRawEmail(token, payload) {
  const body = await request('/send-raw', { method: 'POST', body: JSON.stringify(payload) }, token)
  return body?.data ?? {}
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Bulk send                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Send a Brevo template to a filtered audience of applicants.
 * @param {string} token
 * @param {{
 *   template_id: number,
 *   program_id?: string,
 *   intake_id?: string,
 *   status?: string,
 *   dry_run?: boolean
 * }} payload
 */
export async function sendBrevoEmailBulk(token, payload) {
  const body = await request('/send-bulk', { method: 'POST', body: JSON.stringify(payload) }, token)
  return body?.data ?? {}
}

/**
 * @typedef {Object} BrevoTemplate
 * @property {number} id
 * @property {string} name
 * @property {string} subject
 * @property {boolean} isActive
 * @property {string|null} createdAt
 * @property {string|null} modifiedAt
 * @property {string|null} htmlContentPreview
 * @property {string|null} tag
 */
