import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../features/auth/useAuth.js'
import { announcements as seed } from '../lib/mock-data/scaffold.js'
import {
  createAnnouncement,
  deleteAnnouncement,
  fetchAnnouncements,
  updateAnnouncement,
} from '../lib/api/announcementsApi.js'

const STORAGE_KEY = 'mucm-announcements-v2'
const LEGACY_KEY = 'mucm-announcements-v1'
const DEMO_ADMIN_TOKEN = 'demo-admin-token'

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function initialFromSeed() {
  return deepClone(seed)
}

/**
 * @param {unknown} raw
 * @returns {object | null}
 */
function migrateAnnouncement(raw) {
  if (!raw || typeof raw !== 'object') return null
  const o = /** @type {Record<string, unknown>} */ (raw)
  if (typeof o.title !== 'string') return null

  if ('body' in o && 'targetProgramId' in o) {
    return {
      id: String(o.id ?? `an-${Date.now()}`),
      title: o.title,
      body: typeof o.body === 'string' ? o.body : '',
      targetProgramId: typeof o.targetProgramId === 'string' ? o.targetProgramId : '',
      targetIntakeId: typeof o.targetIntakeId === 'string' ? o.targetIntakeId : '',
      targetPipelineStageKey: typeof o.targetPipelineStageKey === 'string' ? o.targetPipelineStageKey : '',
      active: o.active !== false,
      updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : new Date().toISOString(),
    }
  }

  const legacyAudience = typeof o.audience === 'string' ? o.audience : ''
  return {
    id: String(o.id ?? `an-${Date.now()}`),
    title: o.title,
    body:
      legacyAudience && legacyAudience !== '—'
        ? `Earlier scope note: ${legacyAudience}. Add full announcement text below when editing.`
        : 'Add the full message applicants should see on their dashboard.',
    targetProgramId: '',
    targetIntakeId: '',
    targetPipelineStageKey: '',
    active: o.active !== false,
    updatedAt: new Date().toISOString(),
  }
}

function readInitialOrMigrate(fallback) {
  if (typeof window === 'undefined') return fallback

  try {
    const v2 = window.localStorage.getItem(STORAGE_KEY)
    if (v2) {
      const parsed = JSON.parse(v2)
      if (Array.isArray(parsed)) {
        const next = parsed.map(migrateAnnouncement).filter(Boolean)
        return next.length ? next : fallback
      }
    }

    const v1 = window.localStorage.getItem(LEGACY_KEY)
    if (v1) {
      const parsed = JSON.parse(v1)
      if (Array.isArray(parsed)) {
        const migrated = parsed.map(migrateAnnouncement).filter(Boolean)
        if (migrated.length) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
          return migrated
        }
      }
    }
  } catch {
    /* keep fallback */
  }

  return fallback
}

function deriveCounts(list) {
  const published = list.filter((a) => a.active).length
  return {
    all: list.length,
    published,
    archived: list.length - published,
  }
}

function backendEnabled(token) {
  return Boolean(token && token !== DEMO_ADMIN_TOKEN && String(token).trim().length > 0)
}

/**
 * Announcements: API when a real admin JWT is available; otherwise localStorage (demo / offline).
 * With API: loads optional aggregate counts for All / Published / Archived tabs (see mucm GET ?include_counts=true).
 */
export function useAnnouncementsStore() {
  const { token } = useAuth()
  const defaults = useMemo(() => initialFromSeed(), [])
  const useBackend = backendEnabled(token)

  const [announcements, setAnnouncements] = useState(() => {
    if (typeof window === 'undefined') return []
    if (backendEnabled(token)) return []
    return readInitialOrMigrate(defaults)
  })
  const [counts, setCounts] = useState(
    /** @type {{ all: number, published: number, archived: number } | null} */ (null),
  )
  const [loading, setLoading] = useState(() => backendEnabled(token))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const refreshAnnouncements = useCallback(
    async (opts = {}) => {
      if (!useBackend || !token) return { announcements: [], counts: { all: 0, published: 0, archived: 0 } }
      const silent = Boolean(opts.silent)
      if (!silent) {
        setLoading(true)
      }
      setError('')
      try {
        const { announcements: rows, counts: serverCounts } = await fetchAnnouncements(token, {
          includeCounts: true,
        })
        setAnnouncements(rows)
        const nextCounts = serverCounts ?? deriveCounts(rows)
        setCounts(nextCounts)
        return { announcements: rows, counts: nextCounts }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load announcements')
        setAnnouncements([])
        const empty = { all: 0, published: 0, archived: 0 }
        setCounts(empty)
        return { announcements: [], counts: empty }
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    },
    [useBackend, token],
  )

  useEffect(() => {
    if (!useBackend) {
      setAnnouncements(readInitialOrMigrate(defaults))
      setCounts(null)
      setLoading(false)
      setError('')
      return undefined
    }

    let cancelled = false
    setLoading(true)
    setError('')
    fetchAnnouncements(token, { includeCounts: true })
      .then(({ announcements: rows, counts: serverCounts }) => {
        if (!cancelled) {
          setAnnouncements(rows)
          setCounts(serverCounts ?? deriveCounts(rows))
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load announcements')
          setAnnouncements([])
          setCounts({ all: 0, published: 0, archived: 0 })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [useBackend, token, defaults])

  useEffect(() => {
    if (useBackend) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements))
    } catch {
      /* ignore quota */
    }
  }, [useBackend, announcements])

  useEffect(() => {
    if (useBackend) return
    setCounts(deriveCounts(announcements))
  }, [useBackend, announcements])

  const createOne = useCallback(
    async (payload) => {
      if (!useBackend || !token) {
        const id = `an-${Date.now()}`
        const now = new Date().toISOString()
        const row = { id, ...payload, updatedAt: now }
        setAnnouncements((prev) => [...prev, row])
        return row
      }
      setSaving(true)
      setError('')
      try {
        const created = await createAnnouncement(payload, token)
        await refreshAnnouncements({ silent: true })
        return created
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create announcement'
        setError(msg)
        throw err
      } finally {
        setSaving(false)
      }
    },
    [useBackend, token, refreshAnnouncements],
  )

  const updateOne = useCallback(
    async (id, payload) => {
      if (!useBackend || !token) {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...payload, updatedAt: new Date().toISOString() } : a)),
        )
        return
      }
      setSaving(true)
      setError('')
      try {
        await updateAnnouncement(id, payload, token)
        await refreshAnnouncements({ silent: true })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update announcement'
        setError(msg)
        throw err
      } finally {
        setSaving(false)
      }
    },
    [useBackend, token, refreshAnnouncements],
  )

  const removeOne = useCallback(
    async (id) => {
      if (!useBackend || !token) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id))
        return
      }
      setSaving(true)
      setError('')
      try {
        await deleteAnnouncement(id, token)
        await refreshAnnouncements({ silent: true })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete announcement'
        setError(msg)
        throw err
      } finally {
        setSaving(false)
      }
    },
    [useBackend, token, refreshAnnouncements],
  )

  return {
    announcements,
    setAnnouncements,
    counts,
    loading,
    saving,
    error,
    refreshAnnouncements,
    createOne,
    updateOne,
    removeOne,
  }
}
