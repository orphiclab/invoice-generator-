'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Plus, Search, FileText, Trash2, Eye, Copy,
  SlidersHorizontal, X, Calendar, DollarSign,
  ArrowUpDown, ChevronDown, Download,
} from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { toast } from 'sonner'

type Status = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
type SortKey = 'invoiceNo' | 'client' | 'issueDate' | 'dueDate' | 'total' | 'status'
type SortDir = 'asc' | 'desc'

interface Invoice {
  id: string; invoiceNo: string; status: Status
  total: number; dueDate: string; issueDate: string
  client: { name: string; company?: string }
}

interface Filters {
  dateFrom: string
  dateTo: string
  amountMin: string
  amountMax: string
  client: string
  statuses: Status[]
}

const STATUS_LIST: Status[] = ['DRAFT', 'SENT', 'PAID', 'OVERDUE']
const EMPTY_FILTERS: Filters = { dateFrom: '', dateTo: '', amountMin: '', amountMax: '', client: '', statuses: [] }

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS })
  const [sortKey, setSortKey] = useState<SortKey>('issueDate')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const load = async () => {
    setLoading(true)
    const data = await fetch('/api/invoices').then(r => r.json())
    setInvoices(Array.isArray(data) ? data : [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  // Unique client names for dropdown
  const clientNames = useMemo(() => {
    const names = [...new Set(invoices.map(i => i.client?.name).filter(Boolean))]
    return names.sort()
  }, [invoices])

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let c = 0
    if (filters.dateFrom) c++
    if (filters.dateTo) c++
    if (filters.amountMin) c++
    if (filters.amountMax) c++
    if (filters.client) c++
    if (filters.statuses.length > 0) c++
    return c
  }, [filters])

  // Filter + search + sort
  const filtered = useMemo(() => {
    let result = invoices.filter(inv => {
      // Text search
      const q = search.toLowerCase()
      if (q && !inv.invoiceNo.toLowerCase().includes(q) && !inv.client?.name?.toLowerCase().includes(q)) return false

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(inv.status)) return false

      // Client filter
      if (filters.client && inv.client?.name !== filters.client) return false

      // Date range
      if (filters.dateFrom) {
        const issueDate = new Date(inv.issueDate)
        const from = new Date(filters.dateFrom)
        if (issueDate < from) return false
      }
      if (filters.dateTo) {
        const issueDate = new Date(inv.issueDate)
        const to = new Date(filters.dateTo)
        to.setHours(23, 59, 59, 999)
        if (issueDate > to) return false
      }

      // Amount range
      if (filters.amountMin && inv.total < parseFloat(filters.amountMin)) return false
      if (filters.amountMax && inv.total > parseFloat(filters.amountMax)) return false

      return true
    })

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'invoiceNo': cmp = a.invoiceNo.localeCompare(b.invoiceNo); break
        case 'client': cmp = (a.client?.name || '').localeCompare(b.client?.name || ''); break
        case 'issueDate': cmp = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime(); break
        case 'dueDate': cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); break
        case 'total': cmp = a.total - b.total; break
        case 'status': cmp = a.status.localeCompare(b.status); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [invoices, search, filters, sortKey, sortDir])

  // Summary stats for filtered results
  const summary = useMemo(() => ({
    total: filtered.reduce((s, i) => s + i.total, 0),
    paid: filtered.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0),
    outstanding: filtered.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').reduce((s, i) => s + i.total, 0),
    count: filtered.length,
  }), [filtered])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  function toggleStatus(s: Status) {
    setFilters(f => ({
      ...f,
      statuses: f.statuses.includes(s) ? f.statuses.filter(x => x !== s) : [...f.statuses, s],
    }))
  }

  function clearFilters() {
    setFilters({ ...EMPTY_FILTERS })
    setSearch('')
  }

  function exportCSV() {
    const header = 'Invoice #,Client,Issue Date,Due Date,Amount,Status\n'
    const rows = filtered.map(inv =>
      `${inv.invoiceNo},"${inv.client?.name || ''}",${inv.issueDate},${inv.dueDate},${inv.total},${inv.status}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported to CSV')
  }

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

  const inputStyle = { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>Invoices</h1>
          <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{invoices.length} total invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="h-9 px-3 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors hover:bg-gray-100"
            style={{ border: '1px solid #e5e7eb', color: '#6b7280' }}>
            <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export</span>
          </button>
          <Link href="/invoices/new">
            <button className="btn-brand h-9 px-4 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Invoice
            </button>
          </Link>
        </div>
      </div>

      {/* Search + Filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
          <input
            placeholder="Search invoices or clients…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 rounded-xl text-sm outline-none transition-all"
            style={{ background: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }}
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`h-9 px-3 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${showFilters ? 'ring-2 ring-[#a28ef9]' : ''}`}
          style={{ border: '1px solid #e5e7eb', color: showFilters ? '#a28ef9' : '#6b7280', background: showFilters ? '#f5f3ff' : '#fff' }}>
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ background: '#a28ef9' }}>
              {activeFilterCount}
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-[11px] font-semibold flex items-center gap-1 hover:opacity-70" style={{ color: '#ef4444' }}>
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-200"
          style={{ border: '1px solid #f0f2f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>

          {/* Status pills */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: '#9ca3af' }}>Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_LIST.map(s => {
                const isActive = filters.statuses.includes(s)
                const colors: Record<Status, string> = { DRAFT: '#6b7280', SENT: '#3b82f6', PAID: '#22c55e', OVERDUE: '#ef4444' }
                return (
                  <button key={s} onClick={() => toggleStatus(s)}
                    className="h-7 px-3 rounded-full text-[11px] font-bold transition-all"
                    style={{
                      background: isActive ? colors[s] : '#f3f4f6',
                      color: isActive ? '#fff' : '#6b7280',
                      border: isActive ? `1px solid ${colors[s]}` : '1px solid transparent',
                    }}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date range */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1 block" style={{ color: '#9ca3af' }}>
                <Calendar className="w-3 h-3" /> From
              </label>
              <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1 block" style={{ color: '#9ca3af' }}>
                <Calendar className="w-3 h-3" /> To
              </label>
              <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={inputStyle} />
            </div>

            {/* Amount range */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1 block" style={{ color: '#9ca3af' }}>
                <DollarSign className="w-3 h-3" /> Min Amount
              </label>
              <input type="number" placeholder="0" value={filters.amountMin} onChange={e => setFilters(f => ({ ...f, amountMin: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1 block" style={{ color: '#9ca3af' }}>
                <DollarSign className="w-3 h-3" /> Max Amount
              </label>
              <input type="number" placeholder="∞" value={filters.amountMax} onChange={e => setFilters(f => ({ ...f, amountMax: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={inputStyle} />
            </div>
          </div>

          {/* Client dropdown */}
          <div className="max-w-xs">
            <label className="text-[11px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#9ca3af' }}>Client</label>
            <div className="relative">
              <select value={filters.client} onChange={e => setFilters(f => ({ ...f, client: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none appearance-none pr-8 cursor-pointer" style={inputStyle}>
                <option value="">All Clients</option>
                {clientNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: '#9ca3af' }} />
            </div>
          </div>
        </div>
      )}

      {/* Summary bar */}
      {(activeFilterCount > 0 || search) && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-[11px] font-bold" style={{ color: '#6b7280' }}>
            Showing <span style={{ color: '#111827' }}>{summary.count}</span> results
          </span>
          <span className="text-[11px]" style={{ color: '#9ca3af' }}>•</span>
          <span className="text-[11px]" style={{ color: '#6b7280' }}>
            Total: <span className="font-bold" style={{ color: '#111827' }}>Rs {summary.total.toLocaleString('en-LK', { maximumFractionDigits: 0 })}</span>
          </span>
          <span className="text-[11px]" style={{ color: '#9ca3af' }}>•</span>
          <span className="text-[11px]" style={{ color: '#22c55e' }}>
            Paid: Rs {summary.paid.toLocaleString('en-LK', { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[11px]" style={{ color: '#9ca3af' }}>•</span>
          <span className="text-[11px]" style={{ color: '#f59e0b' }}>
            Outstanding: Rs {summary.outstanding.toLocaleString('en-LK', { maximumFractionDigits: 0 })}
          </span>
        </div>
      )}

      {/* List — cards on mobile, table on desktop */}
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
              {search || activeFilterCount > 0 ? 'Try adjusting your filters' : 'Create your first invoice to get started'}
            </p>
            {!search && activeFilterCount === 0 && (
              <Link href="/invoices/new">
                <button className="btn-brand h-8 px-4 text-xs flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Create Invoice
                </button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* ── Mobile card list ─────────────────────────────── */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#f3f4f6' }}>
              {filtered.map(inv => (
                <div key={inv.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <Link href={`/invoices/${inv.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold font-mono" style={{ color: '#a28ef9' }}>{inv.invoiceNo}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{inv.client?.name}</p>
                    {inv.client?.company && <p className="text-[11px] truncate" style={{ color: '#9ca3af' }}>{inv.client.company}</p>}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px]" style={{ color: '#9ca3af' }}>
                        Due {new Date(inv.dueDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-sm font-bold" style={{ color: '#111827' }}>
                        Rs {inv.total.toLocaleString('en-LK', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </Link>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button onClick={() => duplicateInvoice(inv.id)} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: '#6b7280' }}>
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteInvoice(inv.id)} className="p-1.5 rounded-lg hover:bg-red-50" style={{ color: '#ef4444' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop table ────────────────────────────────── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {([
                      { key: 'invoiceNo', label: 'Invoice #' },
                      { key: 'client', label: 'Client' },
                      { key: 'issueDate', label: 'Issue Date' },
                      { key: 'dueDate', label: 'Due Date' },
                      { key: 'total', label: 'Amount' },
                      { key: 'status', label: 'Status' },
                    ] as { key: SortKey; label: string }[]).map(col => (
                      <th key={col.key}
                        onClick={() => toggleSort(col.key)}
                        className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:text-gray-700 select-none"
                        style={{ color: sortKey === col.key ? '#a28ef9' : '#9ca3af' }}>
                        <span className="flex items-center gap-1">
                          {col.label}
                          <ArrowUpDown className="w-2.5 h-2.5" style={{ opacity: sortKey === col.key ? 1 : 0.3 }} />
                        </span>
                      </th>
                    ))}
                    <th className="px-5 py-3"></th>
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
          </>
        )}
      </div>
    </div>
  )
}
