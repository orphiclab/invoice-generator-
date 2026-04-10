'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, FileText, Trash2, Eye, Copy } from 'lucide-react'
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
    const data = await fetch('/api/invoices').then(r => r.json())
    setInvoices(Array.isArray(data) ? data : [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = invoices.filter(inv => {
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

  async function duplicateInvoice(id: string) {
    const res = await fetch(`/api/invoices/${id}/duplicate`, { method: 'POST' })
    if (res.ok) { toast.success('Invoice duplicated'); load() }
    else toast.error('Failed to duplicate')
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>Invoices</h1>
          <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{invoices.length} total invoices</p>
        </div>
        <Link href="/invoices/new">
          <button className="btn-brand h-9 px-4 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </Link>
      </div>

      {/* Search + Filter pills */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
          <input
            placeholder="Search invoices or clients…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 rounded-xl text-sm outline-none transition-all"
            style={{ background: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }}
          />
        </div>
        {/* Pill filter bar */}
        <div className="pill-tab-bar">
          {ALL_STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`pill-tab${filter === s ? ' active' : ''}`}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f9fafb' }}>
              <FileText className="w-7 h-7" style={{ color: '#d1d5db' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#374151' }}>No invoices found</p>
            <p className="text-xs mt-1 mb-4" style={{ color: '#9ca3af' }}>
              {search || filter !== 'ALL' ? 'Try adjusting your filters' : 'Create your first invoice to get started'}
            </p>
            {!search && filter === 'ALL' && (
              <Link href="/invoices/new">
                <button className="btn-brand h-8 px-4 text-xs flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Create Invoice
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['Invoice #', 'Client', 'Issue Date', 'Due Date', 'Amount', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: '#9ca3af' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => (
                  <tr key={inv.id} className="group hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                    <td className="px-5 py-4">
                      <Link href={`/invoices/${inv.id}`}
                        className="text-xs font-bold font-mono hover:opacity-75 transition-opacity"
                        style={{ color: '#a28ef9' }}>
                        {inv.invoiceNo}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold" style={{ color: '#111827' }}>{inv.client?.name}</p>
                      {inv.client?.company && <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>{inv.client.company}</p>}
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: '#6b7280' }}>
                      {new Date(inv.issueDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: '#6b7280' }}>
                      {new Date(inv.dueDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold" style={{ color: '#111827' }}>
                      Rs {inv.total.toLocaleString('en-LK', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/invoices/${inv.id}`}>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: '#6b7280' }}>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <button onClick={() => duplicateInvoice(inv.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: '#6b7280' }}>
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteInvoice(inv.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: '#ef4444' }}>
                          <Trash2 className="w-3.5 h-3.5" />
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
