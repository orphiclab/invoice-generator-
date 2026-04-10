'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Zap, ArrowLeft } from 'lucide-react'

const B  = '#09090b'; const P  = '#1e0a4a'; const M  = '#4c1d95'
const Gm = '#6d28d9'; const L  = '#7c5cfc'; const La = '#a28ef9'
const W  = '#ffffff';  const G  = '#ddd6fe'

type T = { bg: string; sh: string; c: string }

// Mirror of login grid but with some variations
const TILES: T[] = [
  { bg: M,  sh: 'half-t',   c: P  }, { bg: B,  sh: 'slash',    c: M  },
  { bg: P,  sh: 'circ',     c: La }, { bg: B,  sh: 'none',     c: B  },
  { bg: Gm, sh: 'none',     c: Gm }, { bg: B,  sh: 'diamond',  c: P  },
  { bg: P,  sh: 'q-tl',     c: M  }, { bg: B,  sh: 'big-circ', c: P  },

  { bg: B,  sh: 'square',   c: Gm }, { bg: P,  sh: 'none',     c: P  },
  { bg: B,  sh: 'q-br',     c: M  }, { bg: M,  sh: 'dots',     c: P  },
  { bg: B,  sh: 'none',     c: B  }, { bg: P,  sh: 'half-r',   c: B  },
  { bg: B,  sh: 'diamond',  c: Gm }, { bg: M,  sh: 'ring',     c: L  },

  { bg: P,  sh: 'big-circ', c: M  }, { bg: B,  sh: 'none',     c: B  },
  { bg: M,  sh: 'slash',    c: P  }, { bg: B,  sh: 'q-tr',     c: P  },
  { bg: La, sh: 'none',     c: La }, { bg: B,  sh: 'tri',      c: M  },
  { bg: P,  sh: 'none',     c: P  }, { bg: G,  sh: 'q-bl',     c: La },

  { bg: B,  sh: 'ring',     c: L  }, { bg: M,  sh: 'square',   c: P  },
  { bg: B,  sh: 'none',     c: B  }, { bg: P,  sh: 'half-b',   c: B  },
  { bg: B,  sh: 'none',     c: B  }, { bg: Gm, sh: 'diamond',  c: M  },
  { bg: B,  sh: 'plus',     c: W  }, { bg: M,  sh: 'none',     c: M  },

  { bg: P,  sh: 'diamond',  c: Gm }, { bg: B,  sh: 'dots',     c: La },
  { bg: M,  sh: 'q-tr',     c: L  }, { bg: B,  sh: 'big-circ', c: M  },
  { bg: B,  sh: 'none',     c: B  }, { bg: P,  sh: 'none',     c: P  },
  { bg: B,  sh: 'tri',      c: P  }, { bg: L,  sh: 'q-br',     c: B  },

  { bg: B,  sh: 'big-circ', c: P  }, { bg: Gm, sh: 'slash',    c: M  },
  { bg: P,  sh: 'square',   c: La }, { bg: B,  sh: 'half-l',   c: P  },
  { bg: M,  sh: 'dots',     c: B  }, { bg: B,  sh: 'none',     c: B  },
  { bg: P,  sh: 'ring',     c: Gm }, { bg: M,  sh: 'diamond',  c: P  },
]

function Shape({ t, c }: { t: string; c: string }) {
  if (t === 'none') return null
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
      {t === 'big-circ' && <circle cx="50" cy="50" r="50" fill={c} />}
      {t === 'circ'     && <circle cx="50" cy="50" r="36" fill={c} />}
      {t === 'ring'     && <circle cx="50" cy="50" r="34" fill="none" stroke={c} strokeWidth="12" />}
      {t === 'half-t'   && <path d="M 0 50 A 50 50 0 0 1 100 50 Z" fill={c} />}
      {t === 'half-b'   && <path d="M 0 50 A 50 50 0 0 0 100 50 Z" fill={c} />}
      {t === 'half-l'   && <path d="M 50 0 A 50 50 0 0 0 50 100 Z" fill={c} />}
      {t === 'half-r'   && <path d="M 50 0 A 50 50 0 0 1 50 100 Z" fill={c} />}
      {t === 'q-tl'     && <circle cx="0"   cy="0"   r="100" fill={c} />}
      {t === 'q-tr'     && <circle cx="100" cy="0"   r="100" fill={c} />}
      {t === 'q-bl'     && <circle cx="0"   cy="100" r="100" fill={c} />}
      {t === 'q-br'     && <circle cx="100" cy="100" r="100" fill={c} />}
      {t === 'diamond'  && <polygon points="50,10 90,50 50,90 10,50" fill={c} />}
      {t === 'slash'    && <polygon points="55,0 100,0 45,100 0,100" fill={c} />}
      {t === 'square'   && <rect x="22" y="22" width="56" height="56" fill={c} />}
      {t === 'tri'      && <polygon points="0,100 100,0 100,100" fill={c} />}
      {t === 'dots'     && [22,50,78].flatMap(x => [22,50,78].map(y =>
          <circle key={`${x}-${y}`} cx={x} cy={y} r="8" fill={c} /> ))}
      {t === 'plus'     && <>
        <line x1="28" y1="72" x2="72" y2="28" stroke={c} strokeWidth="9" strokeLinecap="round" />
        <line x1="52" y1="28" x2="72" y2="28" stroke={c} strokeWidth="9" strokeLinecap="round" />
        <line x1="72" y1="28" x2="72" y2="48" stroke={c} strokeWidth="9" strokeLinecap="round" />
      </>}
    </svg>
  )
}

function GeometricGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(6, 1fr)', width: '100%', height: '100%' }}>
      {TILES.map((tile, i) => (
        <div key={i} style={{ background: tile.bg, overflow: 'hidden', width: '100%', height: '100%' }}>
          <Shape t={tile.sh} c={tile.c} />
        </div>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [form, setForm]       = useState({ name: '', email: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) toast.error(data.error || 'Registration failed')
      else { toast.success('Account created! Welcome 🎉'); router.push('/dashboard'); router.refresh() }
    } catch { toast.error('Something went wrong') }
    finally  { setLoading(false) }
  }

  const inp: React.CSSProperties = {
    width: '100%', height: '42px', padding: '0 12px',
    border: '1px solid #e5e7eb', borderRadius: '6px',
    fontSize: '14px', color: '#111827', outline: 'none',
    background: '#fff', display: 'block',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-fustat, system-ui, sans-serif)' }}>

      {/* ── Left: white form ── */}
      <div style={{ flex: '0 0 38%', minWidth: 340, background: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 32px' }}>
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', textDecoration: 'none', marginBottom: 'auto' }}>
          <ArrowLeft size={14} /> Back to sign in
        </Link>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 300, width: '100%', margin: '0 auto', paddingBottom: 48 }}>
          <div style={{ width: 36, height: 36, border: '1.5px solid #111827', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Zap size={16} color="#111827" />
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Create your account</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 28px' }}>Free forever · No credit card required</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text" placeholder="Full name" value={form.name} required
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inp}
              onFocus={e => { e.currentTarget.style.border = '1px solid #a28ef9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(162,142,249,.15)' }}
              onBlur={e  => { e.currentTarget.style.border = '1px solid #e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
            />
            <input
              type="email" placeholder="Enter your email" value={form.email} required
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={inp}
              onFocus={e => { e.currentTarget.style.border = '1px solid #a28ef9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(162,142,249,.15)' }}
              onBlur={e  => { e.currentTarget.style.border = '1px solid #e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
            />
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} placeholder="Password (min. 6 chars)" value={form.password} required
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ ...inp, paddingRight: 36 }}
                onFocus={e => { e.currentTarget.style.border = '1px solid #a28ef9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(162,142,249,.15)' }}
                onBlur={e  => { e.currentTarget.style.border = '1px solid #e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', height: 42, borderRadius: 6, border: 'none', background: '#111827', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4, opacity: loading ? 0.7 : 1, transition: 'opacity .2s' }}>
              {loading ? 'Creating account…' : 'Continue'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: 1 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
          </div>

          <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', margin: 0 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#a28ef9', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>

          <p style={{ fontSize: 11, color: '#d1d5db', textAlign: 'center', marginTop: 12 }}>
            By continuing you agree to our Terms &amp; Privacy Policy.
          </p>
        </div>
      </div>

      {/* ── Right: geometric mosaic ── */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: '100vh' }}>
        <GeometricGrid />
      </div>
    </div>
  )
}
