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
      className="flex items-center gap-2 px-3 py-1.5 rounded-2xl text-sm transition-all hover:bg-gray-50"
      style={{ color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
      <Search className="w-3.5 h-3.5" />
      <span className="hidden sm:block text-xs">Search...</span>
      <span className="hidden sm:flex items-center gap-0.5 ml-1 text-[10px] px-1.5 py-0.5 rounded font-mono"
        style={{ background: 'rgba(162,142,249,0.15)', color: '#a28ef9' }}>
        <Command className="w-2.5 h-2.5" />K
      </span>
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: '#f3f4f6' }}>
          {loading
            ? <div className="w-4 h-4 rounded-full border-2 animate-spin flex-shrink-0" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
            : <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#9ca3af' }} />}
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search invoices, clients, estimates..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
            style={{ color: '#111827' }} />
          <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <X className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {!query && (
            <div className="px-4 py-10 text-center text-sm" style={{ color: '#9ca3af' }}>
              Type at least 2 characters to search
            </div>
          )}
          {query.length >= 2 && !loading && !hasResults && (
            <div className="px-4 py-10 text-center text-sm" style={{ color: '#9ca3af' }}>
              No results for <span className="font-semibold" style={{ color: '#111827' }}>"{query}"</span>
            </div>
          )}

          {results?.invoices && results.invoices.length > 0 && (
            <Section label="Invoices" icon={FileText} color="#a28ef9">
              {results.invoices.map(inv => (
                <ResultRow key={inv.id} onClick={() => navigate(`/invoices/${inv.id}`)}>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold font-mono" style={{ color: '#a28ef9' }}>{inv.invoiceNo}</span>
                    <span className="text-xs ml-2" style={{ color: '#9ca3af' }}>{inv.client.name}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#111827' }}>Rs {inv.total.toLocaleString('en-LK', { maximumFractionDigits: 0 })}</span>
                  <StatusDot status={inv.status} />
                </ResultRow>
              ))}
            </Section>
          )}

          {results?.clients && results.clients.length > 0 && (
            <Section label="Clients" icon={Users} color="#60a5fa">
              {results.clients.map(c => (
                <ResultRow key={c.id} onClick={() => navigate('/clients')}>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold" style={{ color: '#111827' }}>{c.name}</span>
                    {c.company && <span className="text-xs ml-2" style={{ color: '#9ca3af' }}>{c.company}</span>}
                  </div>
                  <span className="text-xs" style={{ color: '#9ca3af' }}>{c.email}</span>
                </ResultRow>
              ))}
            </Section>
          )}

          {results?.estimates && results.estimates.length > 0 && (
            <Section label="Estimates" icon={ClipboardList} color="#fbbf24">
              {results.estimates.map(est => (
                <ResultRow key={est.id} onClick={() => navigate(`/estimates/${est.id}`)}>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold font-mono" style={{ color: '#fbbf24' }}>{est.estimateNo}</span>
                    <span className="text-xs ml-2" style={{ color: '#9ca3af' }}>{est.client.name}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#111827' }}>Rs {est.total.toLocaleString('en-LK', { maximumFractionDigits: 0 })}</span>
                </ResultRow>
              ))}
            </Section>
          )}

          {results?.expenses && results.expenses.length > 0 && (
            <Section label="Expenses" icon={Receipt} color="#f87171">
              {results.expenses.map(exp => (
                <ResultRow key={exp.id} onClick={() => navigate('/expenses')}>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold" style={{ color: '#111827' }}>{exp.title}</span>
                    <span className="text-xs ml-2" style={{ color: '#9ca3af' }}>{exp.category}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#f87171' }}>-Rs {exp.amount.toLocaleString('en-LK', { maximumFractionDigits: 0 })}</span>
                </ResultRow>
              ))}
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t flex items-center gap-2" style={{ borderColor: '#f3f4f6' }}>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(162,142,249,0.12)', color: '#a28ef9' }}>Esc</kbd>
          <span className="text-xs" style={{ color: '#9ca3af' }}>to close</span>
          <span className="ml-auto text-xs" style={{ color: '#9ca3af' }}>⌘K to open</span>
        </div>
      </div>
    </div>
  )
}

function Section({ label, icon: Icon, color, children }: { label: string; icon: React.ElementType; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid #f9fafb' }}>
        <Icon className="w-3 h-3" style={{ color }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>{label}</span>
      </div>
      {children}
    </div>
  )
}

function ResultRow({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors">
      {children}
    </button>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PAID: '#4ade80', SENT: '#60a5fa', DRAFT: '#9ca3af', OVERDUE: '#f87171'
  }
  return <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[status] ?? '#9ca3af' }} />
}
