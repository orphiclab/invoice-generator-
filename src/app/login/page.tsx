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
    <div className="min-h-screen flex" style={{ fontFamily: 'var(--font-fustat, sans-serif)', background: '#edf0ed' }}>

      {/* ── Left panel: lavender gradient with geometry ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(145deg, #a28ef9 0%, #7c5cfc 55%, #6444e8 100%)' }}>

        {/* Dot grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.18) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Concentric rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-[480px] h-[480px] rounded-full border border-white/10 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-[360px] h-[360px] rounded-full border border-white/15 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-[240px] h-[240px] rounded-full border border-white/20 absolute -translate-x-1/2 -translate-y-1/2" />
          {/* Glow orb */}
          <div className="w-[120px] h-[120px] rounded-full absolute -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'rgba(255,255,255,0.15)', filter: 'blur(16px)' }} />
          {/* Center icon */}
          <div className="w-16 h-16 rounded-2xl absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
            <Zap className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Floating shapes */}
        <div className="absolute top-16 right-16 w-14 h-14 rounded-2xl rotate-12 border border-white/20" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute top-32 right-36 w-7 h-7 rounded-md rotate-45 border border-white/25" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="absolute bottom-28 left-16 w-18 h-18 rounded-2xl -rotate-6 border border-white/20" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="absolute bottom-44 right-20 w-10 h-10 rounded-xl rotate-12 border border-white/20" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute top-2/5 left-12 w-4 h-4 rounded-full bg-white/25" />
        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 rounded-full bg-white/30" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">InvoiceFlow</span>
        </div>

        {/* Bottom copy */}
        <div className="relative z-10">
          <p className="text-3xl font-extrabold text-white leading-snug mb-2">
            Professional<br />invoicing made<br />
            <span style={{ color: 'rgba(255,255,255,0.65)' }}>simple.</span>
          </p>
          <div className="flex flex-col gap-3 mt-6">
            {[
              { icon: FileText, text: 'Create & send invoices in 60 seconds' },
              { icon: CreditCard, text: 'Track payments & expenses effortlessly' },
              { icon: Users, text: 'Manage clients from one place' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{text}</span>
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

          <h1 className="text-3xl font-extrabold mb-1" style={{ color: '#111827' }}>Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: '#9ca3af' }}>Sign in to continue to InvoiceFlow</p>

          {/* Card */}
          <div className="bg-white rounded-2xl p-6 space-y-4" style={{ border: '1px solid #f0f2f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <form onSubmit={handleSubmit} className="space-y-4">

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
                  onFocus={e => { e.currentTarget.style.border = '1px solid #a28ef9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(162,142,249,0.12)' }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid #e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    className="w-full h-11 px-4 pr-10 rounded-xl text-sm outline-none transition-all"
                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }}
                    onFocus={e => { e.currentTarget.style.border = '1px solid #a28ef9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(162,142,249,0.12)' }}
                    onBlur={e => { e.currentTarget.style.border = '1px solid #e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
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
                {loading ? 'Signing in…' : <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          <p className="text-center text-sm mt-5" style={{ color: '#9ca3af' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold hover:opacity-80 transition-opacity" style={{ color: '#a28ef9' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
