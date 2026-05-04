import { API_BASE_URL } from '../env.js'

const ANNOUNCEMENTS_BASE = `${API_BASE_URL}/api/v1/announcements`

function normalizeAnnouncement(row) {
  if (!row) return null
  return {
    id: row.id,
    title: String(row.title ?? '').trim(),
    body: String(row.body ?? '').trim(),
    targetProgramId: row.target_program_id != null ? String(row.target_program_id) : '',
    targetIntakeId: row.target_intake_id != null ? String(row.target_intake_id) : '',
    targetPipelineStageKey: row.target_pipeline_stage_key != null ? String(row.target_pipeline_stage_key) : '',
    active: row.is_active !== false,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  }
}

function authHeaders(token) {
  if (token && String(token).trim()) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

async function request(path = '', options = {}, token) {
  if (!API_BASE_URL) {
    throw new Error('Set VITE_API_BASE_URL to your MUCM API (e.g. http://localhost:3000).')
  }
  const hasBody = options.body !== undefined
  const res = await fetch(`${ANNOUNCEMENTS_BASE}${path}`, {
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
    throw new Error(body?.message || 'Announcement request failed')
  }

  return body
}

/** @param {{ includeCounts?: boolean, isActive?: boolean | null }} [options] */
export async function fetchAnnouncements(token, options = {}) {
  const params = new URLSearchParams()
  if (options.includeCounts) params.set('include_counts', 'true')
  if (options.isActive === true) params.set('is_active', 'true')
  if (options.isActive === false) params.set('is_active', 'false')
  const qs = params.toString()
  const body = await request(qs ? `?${qs}` : '', { method: 'GET' }, token)
  const announcements = Array.isArray(body?.data) ? body.data.map(normalizeAnnouncement).filter(Boolean) : []
  const c = body?.counts
  const counts =
    c && typeof c.all === 'number' && typeof c.published === 'number' && typeof c.archived === 'number'
      ? { all: c.all, published: c.published, archived: c.archived }
      : null
  return { announcements, counts }
}

export async function fetchAnnouncementById(id, token) {
  const body = await request(`/${id}`, { method: 'GET' }, token)
  return normalizeAnnouncement(body?.data ?? {})
}

export async function createAnnouncement(payload, token) {
  const body = await request(
    '',
    {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        body: payload.body,
        targetProgramId: payload.targetProgramId || undefined,
        targetIntakeId: payload.targetIntakeId || undefined,
        targetPipelineStageKey: payload.targetPipelineStageKey || undefined,
        active: payload.active !== false,
      }),
    },
    token,
  )
  return normalizeAnnouncement(body?.data ?? {})
}

export async function updateAnnouncement(id, payload, token) {
  const body = await request(
    `/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        title: payload.title,
        body: payload.body,
        targetProgramId: payload.targetProgramId ?? '',
        targetIntakeId: payload.targetIntakeId ?? '',
        targetPipelineStageKey: payload.targetPipelineStageKey ?? '',
        active: payload.active,
      }),
    },
    token,
  )
  return normalizeAnnouncement(body?.data ?? {})
}

export async function deleteAnnouncement(id, token) {
  await request(`/${id}`, { method: 'DELETE' }, token)
}
