'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, Users, ClipboardList, Receipt, X, Command } from 'lucide-react'

interface SearchResult {
  invoices: { id: string; invoiceNo: string; status: string; total: number; client: { name: string } }[]
  clients: { id: string; name: string; email: string; company?: string }[]
  estimates: { id: string; estimateNo: string; status: string; total: number; client: { name: string } }[]
  expenses: { id: string; title: string; amount: number; category: string }[]
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else { setQuery(''); setResults(null) }
  }, [open])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return }
    setLoading(true)
    try {
      const data = await fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r => r.json())
      setResults(data)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 250)
    return () => clearTimeout(t)
  }, [query, search])

  function navigate(href: string) { router.push(href); setOpen(false) }

  const hasResults = results && (
    results.invoices.length + results.clients.length + results.estimates.length + results.expenses.length > 0
  )

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all"
      style={{ color: 'hsl(215 20% 50%)', background: 'hsl(222 30% 12%)', border: '1px solid hsl(222 30% 18%)' }}>
      <Search className="w-3.5 h-3.5" />
      <span className="hidden sm:block text-xs">Search...</span>
      <span className="hidden sm:flex items-center gap-0.5 ml-1 text-[10px] px-1.5 py-0.5 rounded font-mono"
        style={{ background: 'rgba(139,92,246,0.2)', color: 'hsl(262 83% 75%)' }}>
        <Command className="w-2.5 h-2.5" />K
      </span>
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'hsl(222 40% 9%)', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: 'hsl(222 30% 14%)' }}>
          {loading
            ? <div className="w-4 h-4 rounded-full border-2 animate-spin flex-shrink-0" style={{ borderColor: 'hsl(262 83% 68%)', borderTopColor: 'transparent' }} />
            : <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(215 20% 40%)' }} />}
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search invoices, clients, estimates..."
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-600" />
          <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/10 transition-colors">
            <X className="w-3.5 h-3.5" style={{ color: 'hsl(215 20% 45%)' }} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {!query && (
            <div className="px-4 py-10 text-center text-sm" style={{ color: 'hsl(215 20% 35%)' }}>
              Type at least 2 characters to search
            </div>
          )}
          {query.length >= 2 && !loading && !hasResults && (
            <div className="px-4 py-10 text-center text-sm" style={{ color: 'hsl(215 20% 45%)' }}>
              No results for <span className="font-semibold text-white">"{query}"</span>
            </div>
          )}

          {results?.invoices && results.invoices.length > 0 && (
            <Section label="Invoices" icon={FileText} color="hsl(262 83% 68%)">
              {results.invoices.map(inv => (
                <ResultRow key={inv.id} onClick={() => navigate(`/invoices/${inv.id}`)}>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold font-mono" style={{ color: 'hsl(262 83% 75%)' }}>{inv.invoiceNo}</span>
                    <span className="text-xs ml-2" style={{ color: 'hsl(215 20% 45%)' }}>{inv.client.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">₹{inv.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  <StatusDot status={inv.status} />
                </ResultRow>
              ))}
            </Section>
          )}

          {results?.clients && results.clients.length > 0 && (
            <Section label="Clients" icon={Users} color="hsl(199 89% 48%)">
              {results.clients.map(c => (
                <ResultRow key={c.id} onClick={() => navigate('/clients')}>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-white">{c.name}</span>
                    {c.company && <span className="text-xs ml-2" style={{ color: 'hsl(215 20% 45%)' }}>{c.company}</span>}
                  </div>
                  <span className="text-xs" style={{ color: 'hsl(215 20% 40%)' }}>{c.email}</span>
                </ResultRow>
              ))}
            </Section>
          )}

          {results?.estimates && results.estimates.length > 0 && (
            <Section label="Estimates" icon={ClipboardList} color="hsl(38 92% 50%)">
              {results.estimates.map(est => (
                <ResultRow key={est.id} onClick={() => navigate(`/estimates/${est.id}`)}>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold font-mono" style={{ color: 'hsl(38 92% 60%)' }}>{est.estimateNo}</span>
                    <span className="text-xs ml-2" style={{ color: 'hsl(215 20% 45%)' }}>{est.client.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">₹{est.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </ResultRow>
              ))}
            </Section>
          )}

          {results?.expenses && results.expenses.length > 0 && (
            <Section label="Expenses" icon={Receipt} color="hsl(0 84% 60%)">
              {results.expenses.map(exp => (
                <ResultRow key={exp.id} onClick={() => navigate('/expenses')}>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-white">{exp.title}</span>
                    <span className="text-xs ml-2" style={{ color: 'hsl(215 20% 45%)' }}>{exp.category}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'hsl(0 84% 70%)' }}>-₹{exp.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </ResultRow>
              ))}
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t flex items-center gap-2" style={{ borderColor: 'hsl(222 30% 14%)' }}>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(139,92,246,0.15)', color: 'hsl(262 83% 72%)' }}>Esc</kbd>
          <span className="text-xs" style={{ color: 'hsl(215 20% 35%)' }}>to close</span>
          <span className="ml-auto text-xs" style={{ color: 'hsl(215 20% 35%)' }}>⌘K to open</span>
        </div>
      </div>
    </div>
  )
}

function Section({ label, icon: Icon, color, children }: { label: string; icon: React.ElementType; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid hsl(222 30% 13%)' }}>
        <Icon className="w-3 h-3" style={{ color }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'hsl(215 20% 40%)' }}>{label}</span>
      </div>
      {children}
    </div>
  )
}

function ResultRow({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.04] transition-colors">
      {children}
    </button>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PAID: 'hsl(142 76% 46%)', SENT: 'hsl(199 89% 48%)',
    DRAFT: 'hsl(215 20% 45%)', OVERDUE: 'hsl(0 84% 60%)'
  }
  return <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[status] ?? 'hsl(215 20% 45%)' }} />
}
