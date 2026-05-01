import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchAdminMe,
  requestAdminOtp,
  verifyAdminOtp,
} from '../../lib/api/adminAuthApi.js'
import { fetchPortalMe, requestPortalOtp, verifyPortalOtp } from '../../lib/api/portalAuthApi.js'
import { requestSuperAdminOtp, verifySuperAdminOtp } from '../../lib/api/superAdminAuthApi.js'
import { AuthContext } from './authContext.js'
import { DEMO_EMAIL, DEMO_OTP } from './demoCredentials.js'

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const s = readSession()
    if (s?.token && s?.email) {
      return { email: s.email, role: s.role ?? 'Admin', token: s.token, authProvider: s.authProvider ?? null }
    }
    return null
  })

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
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
        }
        return
      }

      const portalData = await fetchPortalMe(s.token)
      if (!portalData.success) {
        if (cancelled) return
        const adminData = await fetchAdminMe(s.token)
        if (cancelled) return
        if (adminData.success) return
        sessionStorage.removeItem(SESSION_KEY)
        setUser(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const requestLoginOtp = useCallback(async (email) => {
    const normalized = email.trim().toLowerCase()
    if (normalized === DEMO_EMAIL) {
      return {
        success: true,
        message: 'Demo verification code sent.',
        dev_otp: DEMO_OTP,
      }
    }
    const adminData = await requestAdminOtp(normalized)
    if (adminData.success) return adminData
    // Login page must keep working even when admin-auth rejects non-admin emails.
    return requestPortalOtp(normalized)
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
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
      setUser(next)
      return { ok: true }
    }
    const adminData = await verifyAdminOtp(normalizedEmail, trimmedOtp)
    let data = adminData
    let authProvider = 'admin'
    if (!adminData.success) {
      // Always fall back for login flow when admin-auth verify fails.
      data = await verifyPortalOtp(normalizedEmail, trimmedOtp)
      authProvider = 'portal'
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
    const next = {
      email: payloadUser.email,
      role: payloadUser.role_name || 'Admin',
      token: payload.token,
      authProvider,
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
    const next = {
      email: payloadUser.email,
      role: payloadUser.role_name || 'Super Admin',
      token: payload.token,
      authProvider: 'superadmin',
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
