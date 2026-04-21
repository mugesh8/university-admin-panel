import { useMemo } from 'react'
import { usePersistentState } from './usePersistentState.js'
import {
  programsConfig,
  intakesConfig,
  feeStructureConfig,
  documentRequirementsConfig,
  pipelineStagesConfig,
  dropdownCategoriesConfig,
} from '../lib/mock-data/settings-config.js'

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

/**
 * Persisted settings masters (programs, intakes, fees, docs, pipeline, dropdowns).
 */
export function useSettingsStore() {
  const defaults = useMemo(() => initialState(), [])
  const [raw, setRaw] = usePersistentState('mucm-settings-v1', defaults)
  const state = useMemo(() => normalizeSettingsState(raw), [raw])

  function setSettingsState(updater) {
    setRaw((prev) => {
      const base = normalizeSettingsState(prev)
      const next = typeof updater === 'function' ? updater(base) : updater
      return normalizeSettingsState(next)
    })
  }

  return { ...state, setSettingsState }
}
