import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../features/auth/useAuth.js'
import { emailTemplates as seed } from '../lib/mock-data/scaffold.js'
import { fetchBrevoTemplates } from '../lib/api/brevoApi.js'

const DEMO_ADMIN_TOKEN = 'demo-admin-token'

function normalizeBrevoTemplate(t) {
  return {
    id: String(t.id),
    brevoId: Number(t.id),
    name: t.name || '',
    subject: t.subject || '',
    category: t.tag || 'Other',
    body: t.htmlContentPreview || '',
    bodyPreview: (t.htmlContentPreview || '').slice(0, 220),
    mergeFields: ['{{applicant_name}}'],
    active: t.isActive !== false,
    lastEdited: t.modifiedAt ? String(t.modifiedAt).slice(0, 10) : (t.createdAt ? String(t.createdAt).slice(0, 10) : null),
    isBrevoTemplate: true,
  }
}

function normalizeSeedTemplate(t) {
  return {
    ...t,
    body: t.body ?? t.bodyPreview ?? '',
    isBrevoTemplate: false,
  }
}

function initialFromSeed() {
  return JSON.parse(JSON.stringify(seed)).map(normalizeSeedTemplate)
}

function backendEnabled(token) {
  return Boolean(token && token !== DEMO_ADMIN_TOKEN && String(token).trim().length > 0)
}

/**
 * Email Templates store that fetches real Brevo templates when a valid admin token
 * is available, and falls back to seeded mock data for demo / offline mode.
 *
 * Exposes:
 *   - templates     : normalized template list
 *   - loading       : initial fetch in progress
 *   - saving        : mutation in progress
 *   - error         : last error message
 *   - refresh()     : re-fetch templates from Brevo
 */
export function useEmailTemplatesStore() {
  const { token } = useAuth()
  const useBackend = backendEnabled(token)
  const seedDefaults = useMemo(() => initialFromSeed(), [])

  const [templates, setTemplates] = useState(() => {
    if (typeof window === 'undefined') return []
    if (backendEnabled(token)) return []   // will be loaded from API
    return initialFromSeed()
  })
  const [loading, setLoading] = useState(() => backendEnabled(token))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(
    async (opts = {}) => {
      if (!useBackend || !token) return
      const silent = Boolean(opts.silent)
      if (!silent) setLoading(true)
      setError('')
      try {
        const rows = await fetchBrevoTemplates(token, { status: 'active', limit: 100 })
        const normalized = rows.map(normalizeBrevoTemplate)
        setTemplates(normalized)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load Brevo templates'
        setError(msg)
        console.error('[Brevo] fetch templates:', msg)
        // Graceful fallback — keep existing data if any, otherwise use seed
        setTemplates((prev) => (prev.length ? prev : seedDefaults))
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [useBackend, token, seedDefaults],
  )

  // Load on mount / when token changes
  useEffect(() => {
    if (!useBackend) {
      setTemplates(initialFromSeed())
      setLoading(false)
      setError('')
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    fetchBrevoTemplates(token, { status: 'active', limit: 100 })
      .then((rows) => {
        if (!cancelled) {
          setTemplates(rows.map(normalizeBrevoTemplate))
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load Brevo templates'
          setError(msg)
          console.error('[Brevo] fetch templates:', msg)
          setTemplates(seedDefaults)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [useBackend, token, seedDefaults])

  return {
    templates,
    setTemplates,
    loading,
    saving,
    setSaving,
    error,
    setError,
    refresh,
    isBrevoMode: useBackend,
  }
}
