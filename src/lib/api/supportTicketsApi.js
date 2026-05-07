import { API_BASE_URL } from '../env.js'
import { actionFromMethod, assertApiPermission } from './permissionGuard.js'

const SUPPORT_TICKETS_BASE = `${API_BASE_URL}/api/v1/support-tickets`

function normalizeStatus(value) {
  const safe = String(value || '').trim().toLowerCase()
  if (safe === 'resolved') return 'resolved'
  if (safe === 'in progress' || safe === 'pending') return 'pending'
  return 'open'
}

function normalizeTicket(row) {
  const createdAt = row.created_at || row.createdAt || null
  const adminRepliedAt = row.admin_replied_at || null
  const messages = []
  if (row.message) {
    messages.push({
      id: `${row.id}-applicant`,
      from: 'applicant',
      body: String(row.message),
      sentAt: createdAt,
    })
  }
  if (row.admin_reply_message) {
    messages.push({
      id: `${row.id}-admin`,
      from: 'admin',
      body: String(row.admin_reply_message),
      sentAt: adminRepliedAt || row.updated_at || createdAt,
    })
  }

  return {
    id: row.id,
    applicantEmail: String(row.applicantEmail || row.user_email || '').trim(),
    category: String(row.category || row.category_meta?.name || 'General').trim(),
    categoryId: row.category_id || row.category_meta?.id || null,
    status: normalizeStatus(row.status),
    subject: String(row.subject || '').trim(),
    question: String(row.message || '').trim(),
    createdAt,
    updatedAt: row.updated_at || createdAt,
    messages,
  }
}

async function request(path = '', options = {}) {
  assertApiPermission('support_tickets', actionFromMethod(options.method || 'GET'))
  const hasBody = options.body !== undefined
  const response = await fetch(`${SUPPORT_TICKETS_BASE}${path}`, {
    headers: hasBody
      ? {
          'Content-Type': 'application/json',
          ...(options.headers ?? {}),
        }
      : options.headers,
    ...options,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || 'Support ticket request failed.')
  }
  return payload
}

export async function fetchSupportTickets() {
  const payload = await request()
  return Array.isArray(payload?.data) ? payload.data.map(normalizeTicket) : []
}

export async function patchSupportTicket(id, body) {
  const payload = await request(`/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return normalizeTicket(payload?.data ?? {})
}

export async function deleteSupportTicket(id) {
  await request(`/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function sendSupportTicketReplyEmail({ ticketId, body }) {
  if (!API_BASE_URL) {
    throw new Error('Set VITE_API_BASE_URL before sending support ticket emails.')
  }
  // Backend already sends email when admin_reply_message is patched.
  return patchSupportTicket(ticketId, {
    status: 'In progress',
    admin_reply_message: String(body || '').trim(),
  })
}
