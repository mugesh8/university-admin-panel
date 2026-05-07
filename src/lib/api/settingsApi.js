import { API_BASE_URL } from '../env.js'
import { actionFromMethod, assertApiPermission } from './permissionGuard.js'

const SETTINGS_BASE = `${API_BASE_URL}/api/v1/settings`

function authHeaders(token) {
  if (token && String(token).trim()) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

/** @param {string | null | undefined} tenantId */
function tenantQs(tenantId) {
  const t = tenantId && String(tenantId).trim()
  return t ? `?tenant_id=${encodeURIComponent(t)}` : ''
}

function normalizeProgram(row) {
  if (!row) return null
  return {
    id: String(row.id),
    tenant_id: row.tenant_id ?? null,
    name: String(row.name ?? '').trim(),
    code: String(row.code ?? '').trim(),
    durationYears: Number(row.durationYears ?? row.duration_years) || 0,
    level: row.level == null || row.level === '' ? '—' : String(row.level),
    description: row.description == null || row.description === '' ? '—' : String(row.description),
    capacity: Number(row.capacity) || 0,
    active: row.active !== false,
    subPrograms: Array.isArray(row.subPrograms) ? row.subPrograms : [],
  }
}

function normalizeIntake(row) {
  if (!row) return null
  return {
    id: String(row.id),
    tenant_id: row.tenant_id ?? null,
    program_id: row.program_id != null ? String(row.program_id) : '',
    name: String(row.name ?? '').trim(),
    startDate: row.startDate != null && row.startDate !== '' ? String(row.startDate) : '—',
    applicationDeadline:
      row.applicationDeadline != null && row.applicationDeadline !== '' ? String(row.applicationDeadline) : '—',
    capacity: Number(row.capacity) || 0,
    status: String(row.status ?? 'Open').trim() || 'Open',
  }
}

function normalizeFeeRule(row) {
  if (!row) return null
  return {
    id: String(row.id),
    tenant_id: row.tenant_id ?? null,
    program_id: row.program_id != null ? String(row.program_id) : '',
    intake_id: row.intake_id != null ? String(row.intake_id) : '',
    programCode: String(row.programCode ?? row.program_code ?? '—').trim() || '—',
    intakeName: String(row.intakeName ?? row.intake_name ?? '—').trim() || '—',
    feeType: String(row.feeType ?? row.fee_type ?? '').trim(),
    amount: String(row.amount ?? row.amount_text ?? '0'),
    currency: String(row.currency ?? 'USD').trim() || 'USD',
    refundPolicy: String(row.refundPolicy ?? row.refund_policy ?? '—').trim() || '—',
  }
}

function normalizeDocReq(row) {
  if (!row) return null
  return {
    id: String(row.id),
    tenant_id: row.tenant_id ?? null,
    name: String(row.name ?? '').trim(),
    required: Boolean(row.required),
    acceptedTypes: String(row.acceptedTypes ?? row.accepted_types ?? 'PDF').trim() || 'PDF',
    maxSizeMb: Math.max(1, Number(row.maxSizeMb ?? row.max_size_mb) || 10),
  }
}

function normalizePipeline(row) {
  if (!row) return null
  const sla = row.slaDays ?? row.sla_days
  return {
    id: String(row.id),
    tenant_id: row.tenant_id ?? null,
    order: Math.max(1, Number(row.order ?? row.stage_order) || 1),
    stageKey: String(row.stageKey ?? row.stage_key ?? '').trim(),
    displayName: String(row.displayName ?? row.display_name ?? '').trim(),
    slaDays: sla === '' || sla == null ? null : Math.max(0, Number(sla) || 0),
    notificationTemplate:
      row.notificationTemplate != null && row.notificationTemplate !== ''
        ? String(row.notificationTemplate)
        : row.notification_template != null && row.notification_template !== ''
          ? String(row.notification_template)
          : '—',
    active: row.active !== false,
  }
}

function normalizeDropdownCategory(row) {
  if (!row) return null
  const opts = Array.isArray(row.options) ? row.options.map((o) => String(o).trim()).filter(Boolean) : []
  return {
    id: String(row.id),
    tenant_id: row.tenant_id ?? null,
    category: String(row.category ?? '').trim(),
    description:
      row.description == null || String(row.description).trim() === '' ? '—' : String(row.description).trim(),
    options: opts,
  }
}

async function request(path, options = {}, token) {
  assertApiPermission('settings', actionFromMethod(options.method || 'GET'))
  if (!API_BASE_URL) {
    throw new Error('Set VITE_API_BASE_URL to your MUCM API (e.g. http://localhost:3000).')
  }
  const hasBody = options.body !== undefined
  const res = await fetch(`${SETTINGS_BASE}${path}`, {
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
    throw new Error(body?.message || `Settings request failed (${res.status})`)
  }

  return body
}

export async function fetchPrograms(token, tenantId) {
  const body = await request(`/programs${tenantQs(tenantId)}`, { method: 'GET' }, token)
  return Array.isArray(body?.data) ? body.data.map(normalizeProgram).filter(Boolean) : []
}

export async function fetchIntakes(token, tenantId) {
  const body = await request(`/intakes${tenantQs(tenantId)}`, { method: 'GET' }, token)
  return Array.isArray(body?.data) ? body.data.map(normalizeIntake).filter(Boolean) : []
}

export async function fetchFeeRules(token, tenantId) {
  const body = await request(`/fee-rules${tenantQs(tenantId)}`, { method: 'GET' }, token)
  return Array.isArray(body?.data) ? body.data.map(normalizeFeeRule).filter(Boolean) : []
}

export async function fetchDocumentRequirements(token, tenantId) {
  const body = await request(`/document-requirements${tenantQs(tenantId)}`, { method: 'GET' }, token)
  return Array.isArray(body?.data) ? body.data.map(normalizeDocReq).filter(Boolean) : []
}

export async function fetchPipelineStages(token, tenantId) {
  const body = await request(`/pipeline-stages${tenantQs(tenantId)}`, { method: 'GET' }, token)
  return Array.isArray(body?.data) ? body.data.map(normalizePipeline).filter(Boolean) : []
}

export async function fetchDropdownCategories(token, tenantId) {
  const body = await request(`/dropdown-categories${tenantQs(tenantId)}`, { method: 'GET' }, token)
  return Array.isArray(body?.data) ? body.data.map(normalizeDropdownCategory).filter(Boolean) : []
}

export async function createProgram(payload, token) {
  const body = await request(
    '/programs',
    {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        code: payload.code,
        durationYears: payload.durationYears,
        level: payload.level === '—' || payload.level == null || payload.level === '' ? null : payload.level,
        description: payload.description === '—' || payload.description == null || payload.description === '' ? null : payload.description,
        capacity: payload.capacity,
        active: payload.active !== false,
        subPrograms: Array.isArray(payload.subPrograms) ? payload.subPrograms : [],
        tenant_id: payload.tenant_id ?? payload.tenantId ?? undefined,
      }),
    },
    token,
  )
  return normalizeProgram(body?.data ?? {})
}

export async function updateProgram(id, payload, token) {
  const body = await request(
    `/programs/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        name: payload.name,
        code: payload.code,
        durationYears: payload.durationYears,
        level: payload.level === '—' || payload.level == null || payload.level === '' ? null : payload.level,
        description: payload.description === '—' || payload.description == null || payload.description === '' ? null : payload.description,
        capacity: payload.capacity,
        active: payload.active,
        subPrograms: Array.isArray(payload.subPrograms) ? payload.subPrograms : [],
        tenant_id: payload.tenant_id ?? payload.tenantId ?? undefined,
      }),
    },
    token,
  )
  return normalizeProgram(body?.data ?? {})
}

export async function deleteProgram(id, token) {
  await request(`/programs/${id}`, { method: 'DELETE' }, token)
}

export async function createIntake(payload, token) {
  const body = await request(
    '/intakes',
    {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        startDate: payload.startDate === '—' || payload.startDate === '' ? null : payload.startDate,
        applicationDeadline:
          payload.applicationDeadline === '—' || payload.applicationDeadline === '' ? null : payload.applicationDeadline,
        capacity: payload.capacity,
        status: payload.status,
        program_id: payload.program_id || payload.programId || undefined,
        tenant_id: payload.tenant_id ?? payload.tenantId ?? undefined,
      }),
    },
    token,
  )
  return normalizeIntake(body?.data ?? {})
}

export async function updateIntake(id, payload, token) {
  const body = await request(
    `/intakes/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        name: payload.name,
        startDate: payload.startDate === '—' || payload.startDate === '' ? null : payload.startDate,
        applicationDeadline:
          payload.applicationDeadline === '—' || payload.applicationDeadline === '' ? null : payload.applicationDeadline,
        capacity: payload.capacity,
        status: payload.status,
        program_id: payload.program_id || payload.programId || undefined,
        tenant_id: payload.tenant_id ?? payload.tenantId ?? undefined,
      }),
    },
    token,
  )
  return normalizeIntake(body?.data ?? {})
}

export async function deleteIntake(id, token) {
  await request(`/intakes/${id}`, { method: 'DELETE' }, token)
}

export async function createFeeRule(payload, token) {
  const body = await request(
    '/fee-rules',
    {
      method: 'POST',
      body: JSON.stringify({
        programCode: payload.programCode,
        intakeName: payload.intakeName,
        feeType: payload.feeType,
        amount: payload.amount,
        currency: payload.currency,
        refundPolicy: payload.refundPolicy === '—' ? '' : payload.refundPolicy,
        program_id: payload.program_id || payload.programId,
        intake_id: payload.intake_id || payload.intakeId,
        tenant_id: payload.tenant_id ?? payload.tenantId ?? undefined,
        sort_order: payload.sort_order ?? payload.sortOrder ?? 0,
      }),
    },
    token,
  )
  return normalizeFeeRule(body?.data ?? {})
}

export async function updateFeeRule(id, payload, token) {
  const body = await request(
    `/fee-rules/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        programCode: payload.programCode,
        intakeName: payload.intakeName,
        feeType: payload.feeType,
        amount: payload.amount,
        currency: payload.currency,
        refundPolicy: payload.refundPolicy === '—' ? '' : payload.refundPolicy,
        program_id: payload.program_id || payload.programId,
        intake_id: payload.intake_id || payload.intakeId,
        tenant_id: payload.tenant_id ?? payload.tenantId ?? undefined,
        sort_order: payload.sort_order ?? payload.sortOrder,
      }),
    },
    token,
  )
  return normalizeFeeRule(body?.data ?? {})
}

export async function deleteFeeRule(id, token) {
  await request(`/fee-rules/${id}`, { method: 'DELETE' }, token)
}

export async function createDocumentRequirement(payload, token) {
  const body = await request(
    '/document-requirements',
    {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        required: payload.required !== false,
        acceptedTypes: payload.acceptedTypes,
        maxSizeMb: payload.maxSizeMb,
        tenant_id: payload.tenant_id ?? payload.tenantId ?? undefined,
      }),
    },
    token,
  )
  return normalizeDocReq(body?.data ?? {})
}

export async function updateDocumentRequirement(id, payload, token) {
  const body = await request(
    `/document-requirements/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        name: payload.name,
        required: payload.required,
        acceptedTypes: payload.acceptedTypes,
        maxSizeMb: payload.maxSizeMb,
        tenant_id: payload.tenant_id ?? payload.tenantId ?? undefined,
      }),
    },
    token,
  )
  return normalizeDocReq(body?.data ?? {})
}

export async function deleteDocumentRequirement(id, token) {
  await request(`/document-requirements/${id}`, { method: 'DELETE' }, token)
}

export async function createPipelineStage(payload, token) {
  const body = await request(
    '/pipeline-stages',
    {
      method: 'POST',
      body: JSON.stringify({
        stageKey: payload.stageKey,
        displayName: payload.displayName,
        order: payload.order,
        slaDays: payload.slaDays,
        notificationTemplate: payload.notificationTemplate,
        active: payload.active !== false,
        tenant_id: payload.tenant_id ?? payload.tenantId ?? undefined,
      }),
    },
    token,
  )
  return normalizePipeline(body?.data ?? {})
}

export async function updatePipelineStage(id, payload, token) {
  const body = await request(
    `/pipeline-stages/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        stageKey: payload.stageKey,
        displayName: payload.displayName,
        order: payload.order,
        slaDays: payload.slaDays,
        notificationTemplate: payload.notificationTemplate,
        active: payload.active,
        tenant_id: payload.tenant_id ?? payload.tenantId ?? undefined,
      }),
    },
    token,
  )
  return normalizePipeline(body?.data ?? {})
}

export async function deletePipelineStage(id, token) {
  await request(`/pipeline-stages/${id}`, { method: 'DELETE' }, token)
}

export async function createDropdownCategory(payload, token) {
  const body = await request(
    '/dropdown-categories',
    {
      method: 'POST',
      body: JSON.stringify({
        category: payload.category,
        description: payload.description === '—' ? '' : payload.description,
        options: payload.options,
        tenant_id: payload.tenant_id ?? payload.tenantId ?? undefined,
      }),
    },
    token,
  )
  return normalizeDropdownCategory(body?.data ?? {})
}

export async function updateDropdownCategory(id, payload, token) {
  const body = await request(
    `/dropdown-categories/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        category: payload.category,
        description: payload.description === '—' ? '' : payload.description,
        options: payload.options,
        tenant_id: payload.tenant_id ?? payload.tenantId ?? undefined,
      }),
    },
    token,
  )
  return normalizeDropdownCategory(body?.data ?? {})
}

export async function deleteDropdownCategory(id, token) {
  await request(`/dropdown-categories/${id}`, { method: 'DELETE' }, token)
}
