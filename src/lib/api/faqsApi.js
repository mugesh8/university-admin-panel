import { API_BASE_URL } from '../env.js'

const FAQS_BASE = `${API_BASE_URL}/api/v1/faqs`

function normalizeFaq(row) {
  return {
    id: row.id,
    categoryId: row.category_id ?? row.faq_category?.id ?? null,
    category: String(row.category ?? row.faq_category?.name ?? 'General').trim() || 'General',
    question: String(row.question ?? '').trim(),
    answer: String(row.answer ?? '').trim(),
    active: row.is_published !== false,
    sortOrder: Number(row.sort_order ?? 0),
  }
}

async function request(path = '', options = {}) {
  const hasBody = options.body !== undefined
  const res = await fetch(`${FAQS_BASE}${path}`, {
    headers: hasBody
      ? {
          'Content-Type': 'application/json',
          ...(options.headers ?? {}),
        }
      : options.headers,
    ...options,
  })

  let body = null
  try {
    body = await res.json()
  } catch {
    body = null
  }

  if (!res.ok || body?.success === false) {
    throw new Error(body?.message || 'Failed to process FAQ request')
  }

  return body
}

export async function fetchFaqs() {
  const body = await request()
  return Array.isArray(body?.data) ? body.data.map(normalizeFaq) : []
}

export async function createFaq(payload) {
  const body = await request('', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return normalizeFaq(body?.data ?? {})
}

export async function updateFaq(id, payload) {
  const body = await request(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return normalizeFaq(body?.data ?? {})
}

export async function deleteFaq(id) {
  await request(`/${id}`, { method: 'DELETE' })
}
