import { applicationSteps } from './applicationSteps.js'

/** Student portal sections (excludes Review & Submit). */
export const portalFormSteps = applicationSteps.filter((s) => s.id !== 'reviewSubmit')

/** Tab value for a portal step — prefixed so it never clashes with admin tabs (e.g. `documents`). */
export function portalStepTabValue(stepId) {
  return `portal-${stepId}`
}
