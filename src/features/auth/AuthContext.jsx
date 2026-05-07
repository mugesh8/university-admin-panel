import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchAdminMe,
  requestAdminOtp,
  verifyAdminOtp,
} from '../../lib/api/adminAuthApi.js'
import { fetchPortalMe } from '../../lib/api/portalAuthApi.js'
import { requestSuperAdminOtp, verifySuperAdminOtp } from '../../lib/api/superAdminAuthApi.js'
import { AuthContext } from './authContext.js'
import { DEMO_EMAIL, DEMO_OTP } from './demoCredentials.js'
import { pickUserIdFromPayload } from '../../lib/auth/pickUserId.js'
import {
  ADMIN_FORM_STORAGE_KEY,
  ADMIN_STEP_STORAGE_KEY,
  ADMIN_SUBMISSIONS_KEY,
  ADMIN_ACTIVE_APPLICATION_KEY,
} from '../../lib/adminApplicationStorageKeys.js'

const SESSION_KEY = 'mucm_admin_session'

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function persistSessionPatch(patch) {
  try {
    const s = readSession() || {}
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...s, ...patch }))
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const s = readSession()
    if (s?.token && s?.email) {
      return {
        email: s.email,
        role: s.role ?? 'Admin',
        permissions: s.permissions && typeof s.permissions === 'object' ? s.permissions : {},
        token: s.token,
        authProvider: s.authProvider ?? null,
        userId: s.userId ?? undefined,
      }
    }
    return null
  })

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    // Legacy global keys only. Per-email drafts (mucm-admin-*::scope) stay in localStorage — same as
    // appli-portal — so step 1+ progress reappears after the same admin logs in again.
    window.localStorage.removeItem(ADMIN_FORM_STORAGE_KEY)
    window.localStorage.removeItem(ADMIN_STEP_STORAGE_KEY)
    window.localStorage.removeItem(ADMIN_SUBMISSIONS_KEY)
    window.localStorage.removeItem(ADMIN_ACTIVE_APPLICATION_KEY)
    window.localStorage.removeItem('mucm-admin-last-user-email')
    setUser(null)
  }, [])

  useEffect(() => {
    const s = readSession()
    if (!s?.token) return
    let cancelled = false
    ;(async () => {
      const provider = s.authProvider
      if (provider === 'portal') {
        const portalData = await fetchPortalMe(s.token)
        if (cancelled) return
        if (!portalData.success) {
          sessionStorage.removeItem(SESSION_KEY)
          setUser(null)
        }
        return
      }
      if (provider === 'admin') {
        const adminData = await fetchAdminMe(s.token)
        if (cancelled) return
        if (!adminData.success) {
          sessionStorage.removeItem(SESSION_KEY)
          setUser(null)
        } else {
          const uid = pickUserIdFromPayload(adminData)
          const nextPermissions =
            adminData?.data?.permissions && typeof adminData.data.permissions === 'object'
              ? adminData.data.permissions
              : {}
          const nextRole = adminData?.data?.role_name || undefined
          if (uid) {
            setUser((prev) => {
              if (!prev?.token) return prev
              const next = {
                ...prev,
                userId: uid,
                ...(nextRole ? { role: nextRole } : {}),
                permissions: nextPermissions,
              }
              persistSessionPatch({
                userId: uid,
                ...(nextRole ? { role: nextRole } : {}),
                permissions: nextPermissions,
              })
              return next
            })
          } else {
            setUser((prev) => {
              if (!prev?.token) return prev
              const next = {
                ...prev,
                ...(nextRole ? { role: nextRole } : {}),
                permissions: nextPermissions,
              }
              persistSessionPatch({
                ...(nextRole ? { role: nextRole } : {}),
                permissions: nextPermissions,
              })
              return next
            })
          }
        }
        return
      }

      const portalData = await fetchPortalMe(s.token)
      if (!portalData.success) {
        if (cancelled) return
        const adminData = await fetchAdminMe(s.token)
        if (cancelled) return
        if (adminData.success) {
          const uid = pickUserIdFromPayload(adminData)
          const nextPermissions =
            adminData?.data?.permissions && typeof adminData.data.permissions === 'object'
              ? adminData.data.permissions
              : {}
          const nextRole = adminData?.data?.role_name || undefined
          if (uid) {
            setUser((prev) => {
              if (!prev?.token) return prev
              const next = {
                ...prev,
                userId: uid,
                ...(nextRole ? { role: nextRole } : {}),
                permissions: nextPermissions,
              }
              persistSessionPatch({
                userId: uid,
                ...(nextRole ? { role: nextRole } : {}),
                permissions: nextPermissions,
              })
              return next
            })
          } else {
            setUser((prev) => {
              if (!prev?.token) return prev
              const next = {
                ...prev,
                ...(nextRole ? { role: nextRole } : {}),
                permissions: nextPermissions,
              }
              persistSessionPatch({
                ...(nextRole ? { role: nextRole } : {}),
                permissions: nextPermissions,
              })
              return next
            })
          }
          return
        }
        sessionStorage.removeItem(SESSION_KEY)
        setUser(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!user?.token || user.authProvider !== 'admin') return
    let cancelled = false

    async function refreshAdminSession() {
      const adminData = await fetchAdminMe(user.token)
      if (cancelled || !adminData?.success) return

      const nextRole = adminData?.data?.role_name || user.role || 'Admin'
      const nextPermissions =
        adminData?.data?.permissions && typeof adminData.data.permissions === 'object'
          ? adminData.data.permissions
          : {}
      const uid = pickUserIdFromPayload(adminData)

      setUser((prev) => {
        if (!prev?.token) return prev
        const next = {
          ...prev,
          role: nextRole,
          permissions: nextPermissions,
          ...(uid ? { userId: uid } : {}),
        }
        persistSessionPatch({
          role: nextRole,
          permissions: nextPermissions,
          ...(uid ? { userId: uid } : {}),
        })
        return next
      })
    }

    const intervalId = window.setInterval(refreshAdminSession, 15000)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshAdminSession()
      }
    }
    window.addEventListener('focus', refreshAdminSession)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshAdminSession)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [user?.token, user?.authProvider, user?.role])

  const requestLoginOtp = useCallback(async (email) => {
    const normalized = email.trim().toLowerCase()
    if (normalized === DEMO_EMAIL) {
      return {
        success: true,
        message: 'Demo verification code sent.',
        dev_otp: DEMO_OTP,
      }
    }
    return requestAdminOtp(normalized)
  }, [])

  const verifyLoginOtpAndSignIn = useCallback(async (email, otp) => {
    const normalizedEmail = email.trim().toLowerCase()
    const trimmedOtp = String(otp || '').trim()
    if (normalizedEmail === DEMO_EMAIL && trimmedOtp === DEMO_OTP) {
      const next = {
        email: DEMO_EMAIL,
        role: 'Admin',
        token: 'demo-admin-token',
        authProvider: 'demo',
        userId: 'demo-admin',
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
      setUser(next)
      return { ok: true }
    }
    const adminData = await verifyAdminOtp(normalizedEmail, trimmedOtp)
    const data = adminData
    const authProvider = 'admin'
    if (!adminData.success) {
      return { ok: false, message: adminData.message || 'Invalid email or OTP' }
    }
    if (!data.success) {
      return {
        ok: false,
        message: data.message || 'Invalid email or OTP',
      }
    }
    const payload = data.data ?? {}
    const payloadUser = payload.user ?? {}
    if (!payload?.token || !payloadUser?.email) {
      return { ok: false, message: 'Invalid response from server' }
    }
    const uid = pickUserIdFromPayload(payload) || pickUserIdFromPayload({ user: payloadUser })
    const next = {
      email: payloadUser.email,
      role: payloadUser.role_name || 'Admin',
      permissions: payloadUser.permissions && typeof payloadUser.permissions === 'object' ? payloadUser.permissions : {},
      token: payload.token,
      authProvider,
      ...(uid ? { userId: uid } : {}),
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setUser(next)
    return { ok: true }
  }, [])

  const requestOtp = useCallback(async (email) => {
    const normalized = email.trim().toLowerCase()
    return requestSuperAdminOtp(normalized)
  }, [])

  const verifyOtpAndSignIn = useCallback(async (email, otp) => {
    const normalizedEmail = email.trim().toLowerCase()
    const trimmedOtp = String(otp || '').trim()
    const data = await verifySuperAdminOtp(normalizedEmail, trimmedOtp)
    if (!data.success) {
      return { ok: false, message: data.message || 'Invalid email or OTP' }
    }
    const payload = data.data ?? {}
    const payloadUser = payload.user ?? {}
    if (!payload?.token || !payloadUser?.email) {
      return { ok: false, message: 'Invalid response from server' }
    }
    const uid = pickUserIdFromPayload(payload) || pickUserIdFromPayload({ user: payloadUser })
    const next = {
      email: payloadUser.email,
      role: payloadUser.role_name || 'Super Admin',
      permissions: payloadUser.permissions && typeof payloadUser.permissions === 'object' ? payloadUser.permissions : {},
      token: payload.token,
      authProvider: 'superadmin',
      ...(uid ? { userId: uid } : {}),
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setUser(next)
    return { ok: true }
  }, [])

  const value = useMemo(
    () => ({
      user,
      token: user?.token ?? null,
      isAuthenticated: Boolean(user?.token),
      signOut,
      requestLoginOtp,
      verifyLoginOtpAndSignIn,
      requestOtp,
      verifyOtpAndSignIn,
    }),
    [user, signOut, requestLoginOtp, verifyLoginOtpAndSignIn, requestOtp, verifyOtpAndSignIn],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
