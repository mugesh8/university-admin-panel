import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { DEMO_EMAIL, DEMO_OTP } from './demoCredentials.js'
import { useAuth } from './useAuth.js'
import { MUCM_CREST_URL } from '../../lib/brand.js'
import { diagnoseAdminLoginEmail } from '../../lib/api/adminAuthApi.js'

export function LoginPage() {
  const { verifyLoginOtpAndSignIn, requestLoginOtp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [codeNotice, setCodeNotice] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await verifyLoginOtpAndSignIn(email, otp)
      if (res.ok) navigate(from, { replace: true })
      else setError(res.message)
    } finally {
      setSubmitting(false)
    }
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL)
    setOtp(DEMO_OTP)
    setError('')
    setCodeNotice('')
  }

  async function handleSendCode() {
    setError('')
    setCodeNotice('')
    if (!email.trim()) {
      setCodeNotice('Enter your email first to request the code.')
      return
    }
    setSendingOtp(true)
    try {
      const data = await requestLoginOtp(email.trim())
      if (!data.success) {
        const baseMessage = data.message || 'Could not send the code.'
        const reasonCode = String(data.reason_code || '').trim().toLowerCase()
        if (reasonCode === 'admin_not_found') {
          setError('No admin account found for this email. Ask Super Admin to create your account.')
          return
        }
        if (reasonCode === 'admin_deleted') {
          setError('Your admin account has been removed. Ask Super Admin to recreate your account.')
          return
        }
        if (reasonCode === 'admin_inactive') {
          setError('Your admin account is inactive. Ask Super Admin to enable account access.')
          return
        }
        if (reasonCode === 'role_inactive') {
          setError('Your assigned role is inactive. Ask Super Admin to activate the role.')
          return
        }
        const normalized = baseMessage.trim().toLowerCase()
        if (normalized === 'this email is not authorized for admin login') {
          const diag = await diagnoseAdminLoginEmail(email.trim())
          if (diag.success) {
            if (diag.status === 'not_found') {
              setError('No admin account found for this email. Ask Super Admin to create your account.')
              return
            }
            if (diag.status === 'admin_inactive') {
              setError('Your admin account is inactive. Ask Super Admin to enable account access.')
              return
            }
            if (diag.status === 'role_inactive') {
              setError(
                diag.roleName
                  ? `Your role (${diag.roleName}) is inactive. Ask Super Admin to activate this role.`
                  : 'Your assigned role is inactive. Ask Super Admin to activate the role.',
              )
              return
            }
          }
        }
        setError(baseMessage)
        return
      }
      setCodeNotice('Verification code sent to your email.')
      if (data.dev_otp) {
        setOtp(String(data.dev_otp))
      }
    } finally {
      setSendingOtp(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-y-contain lg:flex-row lg:overflow-hidden">
      <aside className="relative flex min-h-[280px] shrink-0 flex-col overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#071427] via-[#0A1628] to-[#0f2742] text-white lg:min-h-0 lg:h-full lg:w-[42%] lg:min-w-[320px] lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,67,0.24),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_45%)]" />
        <div className="relative flex min-h-0 flex-1 flex-col justify-center px-8 py-10 lg:py-12">
          <div>
            <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Secure access</p>
              <p className="mt-1 text-sm text-white/75">University Admin</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] p-1 ring-1 ring-white/10">
              <img src={MUCM_CREST_URL} alt="MUCM" className="h-11 w-11 object-contain" />
            </div>
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Metropolitan University
            </p>
            <h1 className="mt-1 text-3xl leading-tight text-white [font-family:'DM_Serif_Display',serif]">
              College of Medicine
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              Welcome back. Sign in to the University Admin workspace to manage admissions, pipeline, and
              communications.
            </p>
          </div>
        </div>
        <p className="relative shrink-0 border-t border-white/10 px-8 py-4 text-xs text-white/45 lg:py-5">
          Secure access · Sign in with email code
        </p>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[radial-gradient(circle_at_top_right,#fff4d6_0%,#f7f6f3_35%,#eef2f7_100%)] px-4 py-12 lg:overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2 text-[#b98a22]">
            <Lock className="h-5 w-5" aria-hidden />
            <span className="text-sm font-semibold uppercase tracking-wide text-[#0A1628]/70">Admin panel</span>
          </div>
          <h2 className="text-2xl font-semibold text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
            Login to your account
          </h2>
          <p className="mt-1 text-sm text-[#0A1628]/55">
            Enter your email, request a code, then sign in with the code.
          </p>

          <Card className="mt-6 rounded-2xl border-[#0A1628]/10 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button type="button" variant="secondary" disabled={sendingOtp} onClick={handleSendCode}>
                  {sendingOtp ? 'Sending…' : 'Send code'}
                </Button>
                <p className="text-xs text-[#0A1628]/55">We only use your email to send this login code.</p>
              </div>
              <Input
                label="Verification code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="6-digit code"
                maxLength={6}
              />
              {codeNotice ? <p className="text-xs text-[#0A1628]/60">{codeNotice}</p> : null}
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
              <Button type="button" variant="ghost" className="w-full !text-xs" onClick={fillDemo}>
                Use demo credentials
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}