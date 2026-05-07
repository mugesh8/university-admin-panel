export const ADMIN_FORM_STORAGE_KEY = 'mucm-admin-application-form'
export const ADMIN_STEP_STORAGE_KEY = 'mucm-admin-current-step'
export const ADMIN_SUBMISSIONS_KEY = 'mucm-admin-submitted-applications'
export const ADMIN_ACTIVE_APPLICATION_KEY = 'mucm-admin-active-application'
export const ADMIN_STORAGE_RESET_MARKER_KEY = 'mucm-admin-storage-reset-v1'

export function getAdminApplicationStorageKeys(email) {
  const scope = String(email || '')
    .trim()
    .toLowerCase() || '_guest'
  return {
    form: `${ADMIN_FORM_STORAGE_KEY}::${scope}`,
    step: `${ADMIN_STEP_STORAGE_KEY}::${scope}`,
    submissions: `${ADMIN_SUBMISSIONS_KEY}::${scope}`,
    activeApplication: `${ADMIN_ACTIVE_APPLICATION_KEY}::${scope}`,
  }
}

export function clearAdminApplicationLocalDraft(email) {
  const k = getAdminApplicationStorageKeys(email)
  try {
    window.localStorage.removeItem(k.form)
    window.localStorage.removeItem(k.step)
    window.localStorage.removeItem(k.submissions)
    window.localStorage.removeItem(k.activeApplication)
  } catch {
    // ignore
  }
}
