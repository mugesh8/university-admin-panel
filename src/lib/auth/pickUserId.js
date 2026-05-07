/**
 * Resolve a stable string id from admin auth API responses (/verify-otp, /me).
 */
export function pickUserIdFromPayload(payload) {
  if (!payload || typeof payload !== 'object') return null

  const nested = [
    payload,
    payload.data,
    payload.user,
    payload.admin,
    payload.data?.user,
    payload.data?.admin,
  ]

  for (const obj of nested) {
    if (!obj || typeof obj !== 'object') continue
    const v = obj.id ?? obj.user_id ?? obj.userId
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      return String(v).trim()
    }
  }
  return null
}
