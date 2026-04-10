'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Zap, ArrowRight, ShieldCheck, TrendingUp, Clock } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Registration failed')
      } else {
        toast.success('Account created! Welcome aboard 🎉')
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const focusStyle = { border: '1px solid #a28ef9', boxShadow: '0 0 0 3px rgba(162,142,249,0.12)' }
  const blurStyle  = { border: '1px solid #e5e7eb', boxShadow: 'none' }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'var(--font-fustat, sans-serif)', background: '#edf0ed' }}>

      {/* ── Left panel: lavender gradient ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(145deg, #a4f5a6 0%, #6ee7b7 40%, #a28ef9 100%)' }}>

        {/* Dot grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Concentric rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-[480px] h-[480px] rounded-full border border-white/15 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-[350px] h-[350px] rounded-full border border-white/20 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-[230px] h-[230px] rounded-full border border-white/25 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-[110px] h-[110px] rounded-full absolute -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'rgba(255,255,255,0.2)', filter: 'blur(14px)' }} />
          <div className="w-16 h-16 rounded-2xl absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
            <Zap className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Floating shapes */}
        <div className="absolute top-20 left-16 w-12 h-12 rounded-2xl rotate-12 border border-white/25" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="absolute top-36 left-40 w-7 h-7 rounded-lg rotate-45 border border-white/30" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <div className="absolute bottom-32 right-14 w-16 h-16 rounded-2xl -rotate-8 border border-white/20" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute bottom-48 left-20 w-9 h-9 rounded-xl rotate-20 border border-white/25" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="absolute top-1/3 right-12 w-4 h-4 rounded-full bg-white/30" />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full bg-white/35" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.3)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">InvoiceFlow</span>
        </div>

        {/* Bottom copy */}
        <div className="relative z-10">
          <p className="text-3xl font-extrabold text-white leading-snug mb-2">
            Start invoicing<br />
            <span style={{ color: 'rgba(255,255,255,0.65)' }}>in 60 seconds.</span>
          </p>
          <div className="flex flex-col gap-3 mt-6">
            {[
              { icon: ShieldCheck, text: 'Free forever — no credit card required' },
              { icon: TrendingUp, text: 'Track revenue, expenses & tax in one place' },
              { icon: Clock, text: 'Invoice clients & get paid faster' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.22)' }}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16" style={{ background: '#edf0ed' }}>
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #a28ef9, #7c5cfc)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight" style={{ color: '#111827' }}>InvoiceFlow</span>
          </div>

          <h1 className="text-3xl font-extrabold mb-1" style={{ color: '#111827' }}>Create your account</h1>
          <p className="text-sm mb-8" style={{ color: '#9ca3af' }}>Free forever · No credit card required</p>

          {/* Card */}
          <div className="bg-white rounded-2xl p-6 space-y-4" style={{ border: '1px solid #f0f2f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>Full name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
                  style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }}
                  onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>Email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
                  style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }}
                  onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    className="w-full h-11 px-4 pr-10 rounded-xl text-sm outline-none transition-all"
                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }}
                    onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 hover:scale-[1.01] disabled:opacity-60 mt-1"
                style={{ background: 'linear-gradient(135deg, #a28ef9 0%, #7c5cfc 100%)', boxShadow: '0 4px 16px rgba(124,92,252,0.35)' }}
              >
                {loading ? 'Creating account…' : <><span>Create free account</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          <p className="text-center text-sm mt-5" style={{ color: '#9ca3af' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-bold hover:opacity-80 transition-opacity" style={{ color: '#a28ef9' }}>
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs mt-3" style={{ color: '#d1d5db' }}>
            By creating an account, you agree to our Terms &amp; Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
