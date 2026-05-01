import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldPlus } from 'lucide-react'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { MUCM_CREST_URL } from '../../lib/brand.js'
import { useAuth } from './useAuth.js'

export function SuperAdminSignupPage() {
  const navigate = useNavigate()
  const { requestOtp, verifyOtpAndSignIn } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSendOtp(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!email.trim()) {
      setError('Enter your email first.')
      return
    }
    setSendingOtp(true)
    try {
      const data = await requestOtp(email.trim())
      if (!data.success) {
        setError(data.message || 'Could not send the code.')
        return
      }
      setMessage('A verification code has been sent to your email.')
      if (data.dev_otp) {
        setOtp(String(data.dev_otp))
      }
    } finally {
      setSendingOtp(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!email.trim() || !otp.trim()) {
      setError('Email and OTP are required.')
      return
    }
    setSubmitting(true)
    try {
      const res = await verifyOtpAndSignIn(email, otp)
      if (!res.ok) {
        setError(res.message || 'Signup failed.')
        return
      }
      navigate('/dashboard', { replace: true })
    } finally {
      setSubmitting(false)
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
              <p className="mt-1 text-sm text-white/75">Super Admin Sign in</p>
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
              Create a Super Admin account for full platform access.
            </p>
          </div>
        </div>
        <p className="relative shrink-0 border-t border-white/10 px-8 py-4 text-xs text-white/45 lg:py-5">
          Secure access · Sign in
        </p>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[radial-gradient(circle_at_top_right,#fff4d6_0%,#f7f6f3_35%,#eef2f7_100%)] px-4 py-12 lg:overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2 text-[#b98a22]">
            <ShieldPlus className="h-5 w-5" aria-hidden />
            <span className="text-sm font-semibold uppercase tracking-wide text-[#0A1628]/70">Admin panel</span>
          </div>
          <h2 className="text-2xl font-semibold text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
            Super Admin sign in
          </h2>
          <p className="mt-1 text-sm text-[#0A1628]/55">
            Send a code to your email, then enter it below to finish sign in.
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
                placeholder="superadmin@mucm.edu"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button type="button" variant="secondary" disabled={sendingOtp} onClick={handleSendOtp}>
                  {sendingOtp ? 'Sending…' : 'Send OTP'}
                </Button>
                <p className="text-xs text-[#0A1628]/55">We email you a one-time code to verify this address.</p>
              </div>
              <Input
                label="OTP"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="6-digit code"
                maxLength={6}
              />

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

              <div className="flex flex-col gap-2 sm:flex-row w-24">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
