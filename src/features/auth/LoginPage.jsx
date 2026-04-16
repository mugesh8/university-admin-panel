import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { DEMO_EMAIL, DEMO_OTP } from './demoCredentials.js'
import { useAuth } from './useAuth.js'
import { MUCM_CREST_URL } from '../../lib/brand.js'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const res = signIn(email, otp)
    if (res.ok) navigate(from, { replace: true })
    else setError(res.message)
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL)
    setOtp(DEMO_OTP)
    setError('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-y-contain lg:flex-row lg:overflow-hidden">
      <aside className="relative flex min-h-[280px] shrink-0 flex-col justify-between overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#071427] via-[#0A1628] to-[#0f2742] px-8 py-10 text-white lg:min-h-0 lg:w-[42%] lg:min-w-[320px] lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,67,0.24),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_45%)]" />
        <div className="relative">
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Secure access</p>
            <p className="mt-1 text-sm text-white/75">University Admin</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] p-1 ring-1 ring-white/10">
            <img src={MUCM_CREST_URL} alt="MUCM crest" className="h-11 w-11 object-contain" />
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
        <p className="relative mt-10 text-xs text-white/45">Secure access · Demo environment</p>
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
          <p className="mt-1 text-sm text-[#0A1628]/55">Enter your email and OTP to continue.</p>

          <Card className="mt-6 rounded-2xl border-[#0A1628]/10 shadow-sm">
            <div className="mb-4 rounded-xl border border-[#D4A843]/35 bg-gradient-to-br from-[#fff7df] to-white px-3 py-2 text-xs text-[#7a5a14]">
              <p className="font-semibold">Demo credentials</p>
              <p>
                Email: <code className="font-mono">{DEMO_EMAIL}</code>
              </p>
              <p>
                OTP: <code className="font-mono">{DEMO_OTP}</code>
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@mucm.edu"
              />
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
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="submit" className="flex-1">
                  Login
                </Button>
                <Button type="button" variant="secondary" className="flex-1" onClick={fillDemo}>
                  Use demo credentials
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
