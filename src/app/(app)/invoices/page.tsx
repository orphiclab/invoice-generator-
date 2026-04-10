'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, FileText, Trash2, Eye, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/StatusBadge'
import { toast } from 'sonner'

type Status = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'

interface Invoice {
  id: string; invoiceNo: string; status: Status
  total: number; dueDate: string; issueDate: string
  client: { name: string; company?: string }
}

const ALL_STATUSES: (Status | 'ALL')[] = ['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE']

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL')

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/invoices')
    const data = await res.json()
    setInvoices(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = invoices.filter((inv) => {
    const matchStatus = filter === 'ALL' || inv.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || inv.invoiceNo.toLowerCase().includes(q) || inv.client?.name?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  async function deleteInvoice(id: string) {
    if (!confirm('Delete this invoice?')) return
    const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Invoice deleted'); load() }
    else toast.error('Failed to delete')
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Invoices</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{invoices.length} total invoices</p>
        </div>
        <Link href="/invoices/new">
          <button className="btn-brand h-9 px-5 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
          <input placeholder="Search by invoice # or client…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 w-full rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ALL_STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={filter === s
                ? { background: '#7C3AED', color: 'white', boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#16191F', border: '1px solid rgba(255,255,255,0.07)' }}>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: '#7B61FF', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 mb-4 opacity-20" style={{ color: 'rgba(255,255,255,0.4)' }} />
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>No invoices found</p>
            <Link href="/invoices/new">
              <Button variant="outline" size="sm" className="mt-4 text-xs border-border">Create first invoice</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  {['Invoice #', 'Client', 'Issue Date', 'Due Date', 'Amount', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#16191F' }}>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/invoices/${inv.id}`} className="font-mono font-medium hover:opacity-80 transition-opacity" style={{ color: '#A89AFF' }}>{inv.invoiceNo}</Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">{inv.client?.name}</p>
                      {inv.client?.company && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{inv.client.company}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(inv.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 font-semibold text-white text-sm">
                      Rs {inv.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/invoices/${inv.id}`}>
                          <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button onClick={() => deleteInvoice(inv.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: 'hsl(0 72% 65%)' }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
