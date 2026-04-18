'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Zap, UserPlus } from 'lucide-react'

const testimonials = [
  {
    avatarSrc: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'Meera Kapoor',
    handle: '@meeradesigns',
    text: 'Started using InvoiceFlow a month ago. Already saved hours on billing. My clients love the professional look.',
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/75.jpg',
    name: 'Arjun Nair',
    handle: '@arjunbuilds',
    text: 'The free plan has everything I need. PDF export, WhatsApp sharing, client management — all in one place.',
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/women/68.jpg',
    name: 'Kavita Reddy',
    handle: '@kavitafreelance',
    text: 'Best invoicing tool for Indian freelancers. Simple, fast, and the revenue dashboard is incredibly useful.',
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!name || !email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Registration failed')
      } else {
        toast.success('Account created! Welcome 🎉')
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
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw] bg-background text-foreground">
      {/* Left column: sign-up form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">
              <span className="font-light text-foreground tracking-tighter">Create account</span>
            </h1>
            <p className="animate-element animate-delay-200 text-muted-foreground">
              Free forever · No credit card required · Start invoicing in 60 seconds
            </p>

            <form className="space-y-5" onSubmit={handleSignUp}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
                  <input name="name" type="text" placeholder="Enter your full name" required minLength={2} maxLength={50} className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none" />
                </div>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
                  <input name="email" type="email" placeholder="Enter your email address" required maxLength={100} className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none" />
                </div>
              </div>

              <div className="animate-element animate-delay-500">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password (min. 6 chars)" required minLength={6} maxLength={100} className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="animate-element animate-delay-600 w-full rounded-2xl py-4 font-semibold transition-all hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: 'rgba(255,255,255,0.97)', color: '#18181b' }}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center">
              <span className="w-full border-t border-border"></span>
              <span className="px-4 text-sm text-muted-foreground bg-background absolute">Or</span>
            </div>

            <p className="animate-element animate-delay-800 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-violet-400 hover:underline transition-colors font-medium">
                Sign in
              </Link>
            </p>

            <p className="animate-element animate-delay-900 text-center text-xs text-muted-foreground/60">
              By continuing you agree to our Terms &amp; Privacy Policy.
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      <section className="hidden md:block flex-1 relative p-4">
        <div
          className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1553877522-43269d4ea984?w=2160&q=80)` }}
        ></div>
        {testimonials.length > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
            <div className={`animate-testimonial animate-delay-1000 flex items-start gap-3 rounded-3xl bg-card/40 backdrop-blur-xl border border-white/10 p-5 w-64`}>
              <img src={testimonials[0].avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
              <div className="text-sm leading-snug">
                <p className="flex items-center gap-1 font-medium">{testimonials[0].name}</p>
                <p className="text-muted-foreground">{testimonials[0].handle}</p>
                <p className="mt-1 text-foreground/80">{testimonials[0].text}</p>
              </div>
            </div>
            {testimonials[1] && (
              <div className="hidden xl:flex">
                <div className={`animate-testimonial animate-delay-1200 flex items-start gap-3 rounded-3xl bg-card/40 backdrop-blur-xl border border-white/10 p-5 w-64`}>
                  <img src={testimonials[1].avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
                  <div className="text-sm leading-snug">
                    <p className="flex items-center gap-1 font-medium">{testimonials[1].name}</p>
                    <p className="text-muted-foreground">{testimonials[1].handle}</p>
                    <p className="mt-1 text-foreground/80">{testimonials[1].text}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
