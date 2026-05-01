import { API_BASE_URL } from '../env.js'

const FAQ_CATEGORIES_BASE = `${API_BASE_URL}/api/v1/faq-categories`

function normalizeCategory(row) {
  return {
    id: row.id,
    name: String(row.name ?? '').trim(),
    description: row.description ? String(row.description).trim() : '',
    active: row.is_active !== false,
    sortOrder: Number(row.sort_order ?? 0),
  }
}

async function request(path = '', options = {}) {
  const hasBody = options.body !== undefined
  const res = await fetch(`${FAQ_CATEGORIES_BASE}${path}`, {
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
    throw new Error(body?.message || 'Failed to process FAQ categories request')
  }

  return body
}

export async function fetchFaqCategories() {
  const body = await request()
  return Array.isArray(body?.data) ? body.data.map(normalizeCategory) : []
}

export async function createFaqCategory(payload) {
  const body = await request('', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return normalizeCategory(body?.data ?? {})
}

export async function updateFaqCategory(id, payload) {
  const body = await request(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return normalizeCategory(body?.data ?? {})
}

export async function deleteFaqCategory(id) {
  await request(`/${id}`, { method: 'DELETE' })
}
