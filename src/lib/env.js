function trimTrailingSlash(url) {
  return typeof url === 'string' ? url.replace(/\/$/, '') : ''
}

/** Public app URL (from `VITE_APP_URL`). */
export const APP_URL = trimTrailingSlash(import.meta.env.VITE_APP_URL)

/** Backend API base URL (from `VITE_API_BASE_URL`). */
export const API_BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL)
