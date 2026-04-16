import { useCallback, useMemo, useState } from 'react'
import { DEMO_EMAIL, DEMO_OTP } from './demoCredentials.js'
import { AuthContext } from './authContext.js'

const SESSION_KEY = 'mucm_admin_demo_session'

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
    return s?.email ? { email: s.email, role: s.role ?? 'University Admin' } : null
  })

  const signIn = useCallback((email, otp) => {
    const normalized = email.trim().toLowerCase()
    if (normalized !== DEMO_EMAIL.toLowerCase() || otp !== DEMO_OTP) {
      return { ok: false, message: 'Invalid email or OTP. Use demo credentials.' }
    }
    const next = { email: DEMO_EMAIL, role: 'University Admin' }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setUser(next)
    return { ok: true }
  }, [])

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
    }),
    [user, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
