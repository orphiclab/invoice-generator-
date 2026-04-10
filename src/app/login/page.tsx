'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Zap, ArrowRight, FileText, CreditCard, Users } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Login failed')
      } else {
        toast.success('Welcome back!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#09090b', fontFamily: 'var(--font-fustat, sans-serif)' }}>

      {/* ── Left panel: geometric art ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(160deg, #09090b 0%, #13091f 60%, #1a0a2e 100%)' }}>

        {/* Geometric grid dots */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(162,142,249,0.12) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Large rotating rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[520px] h-[520px] rounded-full border border-purple-500/10 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-[380px] h-[380px] rounded-full border border-purple-500/15 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-[260px] h-[260px] rounded-full border border-purple-500/20 absolute -translate-x-1/2 -translate-y-1/2" />
          {/* Glowing center orb */}
          <div className="w-[140px] h-[140px] rounded-full absolute -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'radial-gradient(circle, rgba(162,142,249,0.6) 0%, rgba(124,92,252,0.3) 50%, transparent 100%)', filter: 'blur(12px)' }} />
          <div className="w-[80px] h-[80px] rounded-full absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a28ef9, #7c5cfc)' }}>
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Floating geometric squares */}
        <div className="absolute top-20 left-16 w-16 h-16 rotate-12 rounded-xl border border-purple-400/20"
          style={{ background: 'rgba(162,142,249,0.04)' }} />
        <div className="absolute top-32 left-44 w-8 h-8 rotate-45 rounded-sm border border-purple-400/30"
          style={{ background: 'rgba(162,142,249,0.06)' }} />
        <div className="absolute bottom-32 right-20 w-20 h-20 -rotate-12 rounded-2xl border border-purple-400/20"
          style={{ background: 'rgba(162,142,249,0.04)' }} />
        <div className="absolute bottom-48 left-24 w-10 h-10 rotate-45 rounded border border-purple-400/25"
          style={{ background: 'rgba(162,142,249,0.06)' }} />
        <div className="absolute top-1/3 right-16 w-6 h-6 rounded-full bg-purple-500/30" />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full bg-purple-400/40" />

        {/* Top logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a28ef9, #7c5cfc)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">InvoiceFlow</span>
        </div>

        {/* Bottom copy */}
        <div className="relative z-10">
          <p className="text-2xl font-bold text-white leading-snug mb-3">
            Professional invoicing<br />
            <span style={{ color: '#a28ef9' }}>made simple.</span>
          </p>
          <div className="flex flex-col gap-2.5 mt-5">
            {[
              { icon: FileText, text: 'Create & send invoices in 60 seconds' },
              { icon: CreditCard, text: 'Track payments & expenses effortlessly' },
              { icon: Users, text: 'Manage clients from one place' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(162,142,249,0.15)' }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: '#a28ef9' }} />
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative"
        style={{ background: '#09090b' }}>

        {/* Subtle top-right glow */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a28ef9 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #a28ef9, #7c5cfc)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">InvoiceFlow</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-2 block"
                style={{ color: 'rgba(255,255,255,0.4)' }}>Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                className="w-full h-11 px-4 rounded-xl text-sm text-white outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(162,142,249,0.5)'; e.currentTarget.style.background = 'rgba(162,142,249,0.05)' }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-2 block"
                style={{ color: 'rgba(255,255,255,0.4)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full h-11 px-4 pr-10 rounded-xl text-sm text-white outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => { e.currentTarget.style.border = '1px solid rgba(162,142,249,0.5)'; e.currentTarget.style.background = 'rgba(162,142,249,0.05)' }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 mt-2 transition-all duration-200 hover:opacity-90 hover:scale-[1.01] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #a28ef9 0%, #7c5cfc 100%)', boxShadow: '0 4px 24px rgba(124,92,252,0.4)' }}
            >
              {loading ? 'Signing in…' : (
                <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold hover:opacity-80 transition-opacity"
              style={{ color: '#a28ef9' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
