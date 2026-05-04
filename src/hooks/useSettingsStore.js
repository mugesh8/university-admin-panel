import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { API_BASE_URL } from '../lib/env.js'
import {
  programsConfig,
  intakesConfig,
  feeStructureConfig,
  documentRequirementsConfig,
  pipelineStagesConfig,
  dropdownCategoriesConfig,
} from '../lib/mock-data/settings-config.js'
import { usePersistentState } from './usePersistentState.js'
import { useAuth } from '../features/auth/useAuth.js'
import * as settingsApi from '../lib/api/settingsApi.js'

const SettingsStoreContext = createContext(null)

const DEMO_ADMIN_TOKEN = 'demo-admin-token'

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function initialState() {
  return {
    programs: deepClone(programsConfig),
    intakes: deepClone(intakesConfig),
    feeStructure: deepClone(feeStructureConfig),
    documentRequirements: deepClone(documentRequirementsConfig),
    pipelineStages: deepClone(pipelineStagesConfig),
    dropdownCategories: deepClone(dropdownCategoriesConfig),
  }
}

export function normalizeSettingsState(raw) {
  const d = initialState()
  if (!raw || typeof raw !== 'object') return d
  return {
    programs: Array.isArray(raw.programs) ? deepClone(raw.programs) : d.programs,
    intakes: Array.isArray(raw.intakes) ? deepClone(raw.intakes) : d.intakes,
    feeStructure: Array.isArray(raw.feeStructure) ? deepClone(raw.feeStructure) : d.feeStructure,
    documentRequirements: Array.isArray(raw.documentRequirements)
      ? deepClone(raw.documentRequirements)
      : d.documentRequirements,
    pipelineStages: Array.isArray(raw.pipelineStages) ? deepClone(raw.pipelineStages) : d.pipelineStages,
    dropdownCategories: Array.isArray(raw.dropdownCategories)
      ? deepClone(raw.dropdownCategories)
      : d.dropdownCategories,
  }
}

function backendEnabled(token) {
  return Boolean(
    API_BASE_URL && token && token !== DEMO_ADMIN_TOKEN && String(token).trim().length > 0,
  )
}

const emptyApiState = {
  programs: [],
  intakes: [],
  feeStructure: [],
  documentRequirements: [],
  pipelineStages: [],
  dropdownCategories: [],
}

function useSettingsStoreImpl() {
  const { token } = useAuth()
  const useBackend = useMemo(() => backendEnabled(token), [token])
  const tenantId = null

  const defaults = useMemo(() => initialState(), [])
  const [raw, setRaw] = usePersistentState('mucm-settings-v1', defaults)
  const demoState = useMemo(() => normalizeSettingsState(raw), [raw])

  const [apiState, setApiState] = useState(emptyApiState)
  const [loading, setLoading] = useState(() => Boolean(useBackend && token))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const refreshFromApi = useCallback(async () => {
    if (!useBackend || !token) return
    setLoading(true)
    setError('')
    try {
      const [programs, intakes, feeStructure, documentRequirements, pipelineStages, dropdownCategories] =
        await Promise.all([
          settingsApi.fetchPrograms(token, tenantId),
          settingsApi.fetchIntakes(token, tenantId),
          settingsApi.fetchFeeRules(token, tenantId),
          settingsApi.fetchDocumentRequirements(token, tenantId),
          settingsApi.fetchPipelineStages(token, tenantId),
          settingsApi.fetchDropdownCategories(token, tenantId),
        ])
      setApiState({
        programs,
        intakes,
        feeStructure,
        documentRequirements,
        pipelineStages,
        dropdownCategories,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
      setApiState(emptyApiState)
    } finally {
      setLoading(false)
    }
  }, [useBackend, token, tenantId])

  useEffect(() => {
    if (!useBackend) {
      setApiState(emptyApiState)
      setLoading(false)
      setError('')
      return undefined
    }
    let cancelled = false
    ;(async () => {
      if (!cancelled) await refreshFromApi()
    })()
    return () => {
      cancelled = true
    }
  }, [useBackend, refreshFromApi])

  const setSettingsState = useCallback(
    (updater) => {
      if (useBackend) return
      setRaw((prev) => {
        const base = normalizeSettingsState(prev)
        const next = typeof updater === 'function' ? updater(base) : updater
        return normalizeSettingsState(next)
      })
    },
    [useBackend, setRaw],
  )

  const wrapSave = useCallback(
    async (fn) => {
      if (!useBackend || !token) return
      setSaving(true)
      setError('')
      try {
        await fn()
        await refreshFromApi()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Request failed')
        throw err
      } finally {
        setSaving(false)
      }
    },
    [useBackend, token, refreshFromApi],
  )

  const saveProgram = useCallback(
    async (editingId, row) => {
      if (!useBackend) {
        const n = row.name.trim()
        const c = row.code.trim()
        if (!n || !c) return
        const payload = {
          name: n,
          code: c,
          durationYears: Math.max(0, Number(row.durationYears) || 0),
          level: row.level?.trim() || '—',
          capacity: Math.max(0, Number(row.capacity) || 0),
          active: row.active !== false,
        }
        if (editingId) {
          setSettingsState((s) => ({
            ...s,
            programs: s.programs.map((p) => (p.id === editingId ? { ...p, ...payload } : p)),
          }))
        } else {
          setSettingsState((s) => ({
            ...s,
            programs: [...s.programs, { id: `p_${Date.now()}`, ...payload }],
          }))
        }
        return
      }
      await wrapSave(async () => {
        const lv = row.level != null ? String(row.level).trim() : ''
        const payload = {
          name: row.name.trim(),
          code: row.code.trim(),
          durationYears: Math.max(0, Number(row.durationYears) || 0),
          level: !lv || lv === '—' ? null : lv,
          capacity: Math.max(0, Number(row.capacity) || 0),
          active: row.active !== false,
        }
        if (editingId) await settingsApi.updateProgram(editingId, payload, token)
        else await settingsApi.createProgram(payload, token)
      })
    },
    [useBackend, setSettingsState, wrapSave, token],
  )

  const removeProgram = useCallback(
    async (id) => {
      if (!useBackend) {
        setSettingsState((s) => ({ ...s, programs: s.programs.filter((p) => p.id !== id) }))
        return
      }
      await wrapSave(async () => {
        await settingsApi.deleteProgram(id, token)
      })
    },
    [useBackend, setSettingsState, wrapSave, token],
  )

  const saveIntake = useCallback(
    async (editingId, row) => {
      if (!useBackend) {
        const n = row.name.trim()
        if (!n) return
        const payload = {
          name: n,
          program_id: row.programId || row.program_id || '',
          startDate: row.startDate?.trim() || '—',
          applicationDeadline: row.applicationDeadline?.trim() || '—',
          capacity: Math.max(0, Number(row.capacity) || 0),
          status: row.status,
        }
        if (editingId) {
          setSettingsState((s) => ({
            ...s,
            intakes: s.intakes.map((x) => (x.id === editingId ? { ...x, ...payload } : x)),
          }))
        } else {
          setSettingsState((s) => ({
            ...s,
            intakes: [...s.intakes, { id: `i_${Date.now()}`, ...payload }],
          }))
        }
        return
      }
      await wrapSave(async () => {
        const sd = row.startDate != null && row.startDate !== '—' ? String(row.startDate).trim() : ''
        const ad =
          row.applicationDeadline != null && row.applicationDeadline !== '—'
            ? String(row.applicationDeadline).trim()
            : ''
        const payload = {
          name: row.name.trim(),
          startDate: sd || null,
          applicationDeadline: ad || null,
          capacity: Math.max(0, Number(row.capacity) || 0),
          status: row.status,
          programId: row.programId || row.program_id || undefined,
        }
        if (editingId) await settingsApi.updateIntake(editingId, payload, token)
        else await settingsApi.createIntake(payload, token)
      })
    },
    [useBackend, setSettingsState, wrapSave, token],
  )

  const removeIntake = useCallback(
    async (id) => {
      if (!useBackend) {
        setSettingsState((s) => ({ ...s, intakes: s.intakes.filter((x) => x.id !== id) }))
        return
      }
      await wrapSave(async () => {
        await settingsApi.deleteIntake(id, token)
      })
    },
    [useBackend, setSettingsState, wrapSave, token],
  )

  const saveFeeRule = useCallback(
    async (editingId, row) => {
      if (!useBackend) {
        if (!row.feeType?.trim()) return
        const payload = {
          programCode: row.programCode?.trim() || '—',
          intakeName: row.intakeName?.trim() || '—',
          feeType: row.feeType.trim(),
          amount: row.amount?.trim() || '0',
          currency: row.currency?.trim() || 'USD',
          refundPolicy: row.refundPolicy?.trim() || '—',
        }
        if (editingId) {
          setSettingsState((s) => ({
            ...s,
            feeStructure: s.feeStructure.map((x) => (x.id === editingId ? { ...x, ...payload } : x)),
          }))
        } else {
          setSettingsState((s) => ({
            ...s,
            feeStructure: [...s.feeStructure, { id: `f_${Date.now()}`, ...payload }],
          }))
        }
        return
      }
      await wrapSave(async () => {
        const payload = {
          programCode: row.programCode?.trim() || '—',
          intakeName: row.intakeName?.trim() || '—',
          feeType: row.feeType.trim(),
          amount: row.amount?.trim() || '0',
          currency: row.currency?.trim() || 'USD',
          refundPolicy: row.refundPolicy?.trim() || '—',
        }
        if (editingId) await settingsApi.updateFeeRule(editingId, payload, token)
        else await settingsApi.createFeeRule(payload, token)
      })
    },
    [useBackend, setSettingsState, wrapSave, token],
  )

  const removeFeeRule = useCallback(
    async (id) => {
      if (!useBackend) {
        setSettingsState((s) => ({ ...s, feeStructure: s.feeStructure.filter((x) => x.id !== id) }))
        return
      }
      await wrapSave(async () => {
        await settingsApi.deleteFeeRule(id, token)
      })
    },
    [useBackend, setSettingsState, wrapSave, token],
  )

  const saveDocumentRequirement = useCallback(
    async (editingId, row) => {
      if (!useBackend) {
        const n = row.name.trim()
        if (!n) return
        const payload = {
          name: n,
          required: row.required !== false,
          acceptedTypes: row.acceptedTypes?.trim() || 'PDF',
          maxSizeMb: Math.max(1, Number(row.maxSizeMb) || 10),
        }
        if (editingId) {
          setSettingsState((s) => ({
            ...s,
            documentRequirements: s.documentRequirements.map((x) => (x.id === editingId ? { ...x, ...payload } : x)),
          }))
        } else {
          setSettingsState((s) => ({
            ...s,
            documentRequirements: [...s.documentRequirements, { id: `d_${Date.now()}`, ...payload }],
          }))
        }
        return
      }
      await wrapSave(async () => {
        const payload = {
          name: row.name.trim(),
          required: row.required !== false,
          acceptedTypes: row.acceptedTypes?.trim() || 'PDF',
          maxSizeMb: Math.max(1, Number(row.maxSizeMb) || 10),
        }
        if (editingId) await settingsApi.updateDocumentRequirement(editingId, payload, token)
        else await settingsApi.createDocumentRequirement(payload, token)
      })
    },
    [useBackend, setSettingsState, wrapSave, token],
  )

  const removeDocumentRequirement = useCallback(
    async (id) => {
      if (!useBackend) {
        setSettingsState((s) => ({
          ...s,
          documentRequirements: s.documentRequirements.filter((x) => x.id !== id),
        }))
        return
      }
      await wrapSave(async () => {
        await settingsApi.deleteDocumentRequirement(id, token)
      })
    },
    [useBackend, setSettingsState, wrapSave, token],
  )

  const savePipelineStage = useCallback(
    async (editingId, row) => {
      if (!useBackend) {
        const dn = row.displayName.trim()
        const sk = row.stageKey.trim()
        if (!dn || !sk) return
        const payload = {
          order: Math.max(1, Number(row.order) || 1),
          stageKey: sk.replace(/\s+/g, '_').toLowerCase(),
          displayName: dn,
          slaDays: row.slaDays,
          notificationTemplate: row.notificationTemplate?.trim() || '—',
          active: row.active !== false,
        }
        if (editingId) {
          setSettingsState((s) => ({
            ...s,
            pipelineStages: s.pipelineStages.map((x) => (x.id === editingId ? { ...x, ...payload } : x)),
          }))
        } else {
          setSettingsState((s) => ({
            ...s,
            pipelineStages: [...s.pipelineStages, { id: `s_${Date.now()}`, ...payload }],
          }))
        }
        return
      }
      await wrapSave(async () => {
        const payload = {
          stageKey: row.stageKey.trim().replace(/\s+/g, '_').toLowerCase(),
          displayName: row.displayName.trim(),
          order: Math.max(1, Number(row.order) || 1),
          slaDays: row.slaDays,
          notificationTemplate: row.notificationTemplate?.trim() || '—',
          active: row.active !== false,
        }
        if (editingId) await settingsApi.updatePipelineStage(editingId, payload, token)
        else await settingsApi.createPipelineStage(payload, token)
      })
    },
    [useBackend, setSettingsState, wrapSave, token],
  )

  const removePipelineStage = useCallback(
    async (id) => {
      if (!useBackend) {
        setSettingsState((s) => ({
          ...s,
          pipelineStages: s.pipelineStages.filter((x) => x.id !== id),
        }))
        return
      }
      await wrapSave(async () => {
        await settingsApi.deletePipelineStage(id, token)
      })
    },
    [useBackend, setSettingsState, wrapSave, token],
  )

  const saveDropdownCategory = useCallback(
    async (editingId, row) => {
      if (!useBackend) {
        const cat = row.category.trim()
        if (!cat || !Array.isArray(row.options) || row.options.length === 0) return
        const payload = {
          category: cat,
          description: row.description?.trim() || '—',
          options: row.options,
        }
        if (editingId) {
          setSettingsState((s) => ({
            ...s,
            dropdownCategories: s.dropdownCategories.map((x) => (x.id === editingId ? { ...x, ...payload } : x)),
          }))
        } else {
          setSettingsState((s) => ({
            ...s,
            dropdownCategories: [...s.dropdownCategories, { id: `dd_${Date.now()}`, ...payload }],
          }))
        }
        return
      }
      await wrapSave(async () => {
        const payload = {
          category: row.category.trim(),
          description: row.description?.trim() || '—',
          options: row.options,
        }
        if (editingId) await settingsApi.updateDropdownCategory(editingId, payload, token)
        else await settingsApi.createDropdownCategory(payload, token)
      })
    },
    [useBackend, setSettingsState, wrapSave, token],
  )

  const removeDropdownCategory = useCallback(
    async (id) => {
      if (!useBackend) {
        setSettingsState((s) => ({
          ...s,
          dropdownCategories: s.dropdownCategories.filter((x) => x.id !== id),
        }))
        return
      }
      await wrapSave(async () => {
        await settingsApi.deleteDropdownCategory(id, token)
      })
    },
    [useBackend, setSettingsState, wrapSave, token],
  )

  const clearError = useCallback(() => setError(''), [])

  const snapshot = useBackend ? apiState : demoState

  return useMemo(
    () => ({
      ...snapshot,
      useBackend,
      loading,
      saving,
      error,
      clearError,
      refreshSettings: refreshFromApi,
      setSettingsState,
      saveProgram,
      removeProgram,
      saveIntake,
      removeIntake,
      saveFeeRule,
      removeFeeRule,
      saveDocumentRequirement,
      removeDocumentRequirement,
      savePipelineStage,
      removePipelineStage,
      saveDropdownCategory,
      removeDropdownCategory,
    }),
    [
      snapshot,
      useBackend,
      loading,
      saving,
      error,
      clearError,
      refreshFromApi,
      setSettingsState,
      saveProgram,
      removeProgram,
      saveIntake,
      removeIntake,
      saveFeeRule,
      removeFeeRule,
      saveDocumentRequirement,
      removeDocumentRequirement,
      savePipelineStage,
      removePipelineStage,
      saveDropdownCategory,
      removeDropdownCategory,
    ],
  )
}

export function SettingsStoreProvider({ children }) {
  const value = useSettingsStoreImpl()
  return createElement(SettingsStoreContext.Provider, { value }, children)
}

export function useSettingsStore() {
  const ctx = useContext(SettingsStoreContext)
  if (!ctx) {
    throw new Error('useSettingsStore must be used within SettingsStoreProvider')
  }
  return ctx
}
