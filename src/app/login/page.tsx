'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Zap, ArrowLeft } from 'lucide-react'

// ─── Purple / black colour palette ───────────────────────────────────────────
const B  = '#09090b'   // near-black
const P  = '#1e0a4a'   // very dark purple
const M  = '#4c1d95'   // medium dark purple
const Gm = '#6d28d9'   // mid purple
const L  = '#7c5cfc'   // lavender
const La = '#a28ef9'   // light lavender
const W  = '#ffffff'   // white
const G  = '#ddd6fe'   // ghost lavender

type T = { bg: string; sh: string; c: string }
// 8 cols × 6 rows = 48 tiles, each with 4:5 aspect ratio
const TILES: T[] = [
  // Row 1
  { bg: B,  sh: 'big-circ', c: W  }, { bg: P,  sh: 'q-tr',    c: M  },
  { bg: M,  sh: 'q-bl',    c: L  }, { bg: B,  sh: 'none',    c: B  },
  { bg: B,  sh: 'none',    c: B  }, { bg: B,  sh: 'none',    c: B  },
  { bg: B,  sh: 'none',    c: B  }, { bg: P,  sh: 'half-l',  c: B  },
  // Row 2
  { bg: B,  sh: 'dots',    c: W  }, { bg: P,  sh: 'diamond', c: La },
  { bg: B,  sh: 'ring',    c: Gm }, { bg: B,  sh: 'none',    c: B  },
  { bg: M,  sh: 'diamond', c: P  }, { bg: P,  sh: 'slash',   c: Gm },
  { bg: B,  sh: 'none',    c: B  }, { bg: Gm, sh: 'slash',   c: M  },
  // Row 3
  { bg: B,  sh: 'none',    c: B  }, { bg: M,  sh: 'none',    c: M  },
  { bg: P,  sh: 'half-r',  c: B  }, { bg: B,  sh: 'big-circ',c: P  },
  { bg: P,  sh: 'none',    c: P  }, { bg: G,  sh: 'q-br',    c: La },
  { bg: B,  sh: 'plus',    c: W  }, { bg: M,  sh: 'circ',    c: P  },
  // Row 4
  { bg: P,  sh: 'tri',     c: M  }, { bg: B,  sh: 'square',  c: P  },
  { bg: B,  sh: 'none',    c: B  }, { bg: M,  sh: 'q-tl',    c: L  },
  { bg: B,  sh: 'none',    c: B  }, { bg: B,  sh: 'none',    c: B  },
  { bg: P,  sh: 'none',    c: P  }, { bg: L,  sh: 'ring',    c: B  },
  // Row 5
  { bg: B,  sh: 'square',  c: W  }, { bg: M,  sh: 'none',    c: M  },
  { bg: P,  sh: 'big-circ',c: M  }, { bg: B,  sh: 'q-tr',    c: P  },
  { bg: L,  sh: 'none',    c: L  }, { bg: M,  sh: 'diamond', c: B  },
  { bg: G,  sh: 'q-bl',    c: La }, { bg: P,  sh: 'diamond', c: M  },
  // Row 6
  { bg: B,  sh: 'big-circ',c: M  }, { bg: P,  sh: 'square',  c: La },
  { bg: M,  sh: 'slash',   c: B  }, { bg: M,  sh: 'diamond', c: P  },
  { bg: La, sh: 'dots',    c: B  }, { bg: W,  sh: 'q-br',    c: La },
  { bg: B,  sh: 'none',    c: B  }, { bg: P,  sh: 'tri',     c: Gm },
]

function Shape({ t, c }: { t: string; c: string }) {
  if (t === 'none') return null
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
      {t === 'big-circ'  && <circle cx="50" cy="50" r="50" fill={c} />}
      {t === 'circ'      && <circle cx="50" cy="50" r="36" fill={c} />}
      {t === 'ring'      && <circle cx="50" cy="50" r="34" fill="none" stroke={c} strokeWidth="12" />}
      {t === 'half-t'    && <path d="M 0 50 A 50 50 0 0 1 100 50 Z" fill={c} />}
      {t === 'half-b'    && <path d="M 0 50 A 50 50 0 0 0 100 50 Z" fill={c} />}
      {t === 'half-l'    && <path d="M 50 0 A 50 50 0 0 0 50 100 Z" fill={c} />}
      {t === 'half-r'    && <path d="M 50 0 A 50 50 0 0 1 50 100 Z" fill={c} />}
      {t === 'q-tl'      && <circle cx="0"   cy="0"   r="100" fill={c} />}
      {t === 'q-tr'      && <circle cx="100" cy="0"   r="100" fill={c} />}
      {t === 'q-bl'      && <circle cx="0"   cy="100" r="100" fill={c} />}
      {t === 'q-br'      && <circle cx="100" cy="100" r="100" fill={c} />}
      {t === 'diamond'   && <polygon points="50,10 90,50 50,90 10,50" fill={c} />}
      {t === 'slash'     && <polygon points="55,0 100,0 45,100 0,100" fill={c} />}
      {t === 'square'    && <rect x="22" y="22" width="56" height="56" fill={c} />}
      {t === 'tri'       && <polygon points="0,100 100,0 100,100" fill={c} />}
      {t === 'dots'      && [22,50,78].flatMap(x => [22,50,78].map(y =>
          <circle key={`${x}-${y}`} cx={x} cy={y} r="8" fill={c} />
      ))}
      {t === 'plus'      && <>
        <line x1="28" y1="72" x2="72" y2="28" stroke={c} strokeWidth="9" strokeLinecap="round" />
        <line x1="52" y1="28" x2="72" y2="28" stroke={c} strokeWidth="9" strokeLinecap="round" />
        <line x1="72" y1="28" x2="72" y2="48" stroke={c} strokeWidth="9" strokeLinecap="round" />
      </>}
    </svg>
  )
}

function GeometricGrid() {
  return (
    <div style={{ width: '100%', height: '100%', background: B }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', width: '100%' }}>
        {TILES.map((tile, i) => (
          <div key={i} style={{ background: tile.bg, overflow: 'hidden', aspectRatio: '4 / 5' }}>
            <Shape t={tile.sh} c={tile.c} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Login page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [form, setForm]       = useState({ email: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) toast.error(data.error || 'Login failed')
      else { toast.success('Welcome back!'); router.push('/dashboard'); router.refresh() }
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

      {/* ── Left: pure white form ── */}
      <div style={{ flex: '0 0 38%', minWidth: 340, background: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 32px' }}>
        {/* Back link */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', textDecoration: 'none', marginBottom: 'auto' }}>
          <ArrowLeft size={14} /> Back to home
        </Link>

        {/* Form body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 300, width: '100%', margin: '0 auto', paddingBottom: 48 }}>
          {/* Icon */}
          <div style={{ width: 36, height: 36, border: '1.5px solid #111827', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Zap size={16} color="#111827" />
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Sign in to your account</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 28px' }}>Please continue to sign in to your business account</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email" placeholder="Enter  your email" value={form.email} required
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={inp}
              onFocus={e => { e.currentTarget.style.border = '1px solid #a28ef9'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(162,142,249,.15)' }}
              onBlur={e  => { e.currentTarget.style.border = '1px solid #e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
            />

            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password} required
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
              {loading ? 'Signing in…' : 'Continue'}
            </button>
          </form>

          {/* OR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: 1 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
          </div>

          <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', margin: 0 }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#a28ef9', fontWeight: 700, textDecoration: 'none' }}>Create one free</Link>
          </p>
        </div>
      </div>

      {/* ── Right: geometric mosaic ── */}
      <div style={{ flex: 1, background: B, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <GeometricGrid />
      </div>
    </div>
  )
}
