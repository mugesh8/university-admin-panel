/**
 * Matches the student portal (`StepForm.jsx`): overall progress from current step index.
 * `stepNumber = currentStepIndex + 1`, `totalSteps = applicationSteps.length` (8).
 */
export const APPLICATION_FORM_TOTAL_STEPS = 8

export function getApplicationFormProgressPercent(currentStepIndex) {
  const stepNumber = Math.min(
    Math.max(Number(currentStepIndex) + 1, 1),
    APPLICATION_FORM_TOTAL_STEPS,
  )
  return Math.round((stepNumber / APPLICATION_FORM_TOTAL_STEPS) * 100)
}
