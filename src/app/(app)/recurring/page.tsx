'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, RefreshCw, Pause, Play, Trash2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface RecurringInvoice {
  id: string
  title: string
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  nextRunDate: string
  isActive: boolean
  total: number
  clientId: string
}

const FREQ_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly', BIWEEKLY: 'Bi-Weekly', MONTHLY: 'Monthly', QUARTERLY: 'Quarterly', YEARLY: 'Yearly',
}

const FREQ_COLORS: Record<string, string> = {
  WEEKLY: 'hsl(199 89% 48%)', BIWEEKLY: '#a28ef9', MONTHLY: '#16a34a',
  QUARTERLY: 'hsl(38 92% 50%)', YEARLY: 'hsl(311 70% 60%)',
}

export default function RecurringPage() {
  const [recurring, setRecurring] = useState<RecurringInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [clients, setClients] = useState<{id: string; name: string}[]>([])
  const [form, setForm] = useState({ title: '', clientId: '', frequency: 'MONTHLY', nextRunDate: '', total: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/recurring').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ]).then(([r, c]) => {
      setRecurring(Array.isArray(r) ? r : [])
      setClients(Array.isArray(c) ? c : [])
      setLoading(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setRecurring(p => [data, ...p])
      setShowForm(false)
      setForm({ title: '', clientId: '', frequency: 'MONTHLY', nextRunDate: '', total: '' })
      toast.success('Recurring invoice created')
    } catch {
      toast.error('Failed to create')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch(`/api/recurring/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    if (res.ok) {
      setRecurring(p => p.map(r => r.id === id ? { ...r, isActive: !isActive } : r))
      toast.success(isActive ? 'Paused' : 'Resumed')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this recurring invoice?')) return
    await fetch(`/api/recurring/${id}`, { method: 'DELETE' })
    setRecurring(p => p.filter(r => r.id !== id))
    toast.success('Deleted')
  }

  const inputStyle = { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>Recurring Invoices</h1>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Auto-generate invoices on a schedule</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-brand h-9 px-5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Recurring
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Schedules', value: recurring.length, grad: 'linear-gradient(135deg, #a28ef9 0%, #7c5cfc 100%)', shadow: 'rgba(162,142,249,0.3)', light: false },
          { label: 'Active', value: recurring.filter(r => r.isActive).length, grad: 'linear-gradient(135deg, #a4f5a6 0%, #6ee7b7 100%)', shadow: 'rgba(164,245,166,0.35)', light: true },
          { label: 'Paused', value: recurring.filter(r => !r.isActive).length, grad: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)', shadow: 'rgba(96,165,250,0.3)', light: false },
        ].map(({ label, value, grad, shadow, light }) => (
          <div key={label} className="rounded-2xl p-5 relative overflow-hidden" style={{ background: grad, boxShadow: `0 8px 24px ${shadow}` }}>
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
            <p className="text-2xl font-extrabold" style={{ color: light ? '#166534' : 'white' }}>{value}</p>
            <p className="text-xs mt-1 font-semibold" style={{ color: light ? 'rgba(22,101,52,0.75)' : 'rgba(255,255,255,0.8)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: '#ffffff', border: '1px solid rgba(124,58,237,0.25)' }}>
          <h2 className="text-base font-bold" style={{ color: '#111827' }}>New Recurring Invoice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input required placeholder="Title (e.g. Monthly Retainer)" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="px-3 py-2 rounded-2xl text-sm outline-none" style={inputStyle} />
            <select required value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
              className="px-3 py-2 rounded-2xl text-sm outline-none" style={inputStyle}>
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}
              className="px-3 py-2 rounded-2xl text-sm outline-none" style={inputStyle}>
              {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input required type="number" step="0.01" placeholder="Total amount (Rs )" value={form.total} onChange={e => setForm(p => ({ ...p, total: e.target.value }))}
              className="px-3 py-2 rounded-2xl text-sm outline-none" style={inputStyle} />
            <input required type="date" value={form.nextRunDate} onChange={e => setForm(p => ({ ...p, nextRunDate: e.target.value }))}
              className="px-3 py-2 rounded-2xl text-sm outline-none" style={{ ...inputStyle, colorScheme: 'dark' }} placeholder="First run date" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-brand h-8 px-5 text-xs">
              {saving ? 'Creating...' : 'Create Schedule'}
            </button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="text-xs h-8 px-4" style={{ color: '#6b7280' }}>Cancel</Button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
        </div>
      ) : recurring.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 flex flex-col items-center text-center" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f9fafb' }}>
            <RefreshCw className="w-7 h-7" style={{ color: '#d1d5db' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#374151' }}>No recurring invoices</p>
          <p className="text-xs mt-1 mb-4" style={{ color: '#9ca3af' }}>Set up automatic invoice generation for retainer clients</p>
          <button onClick={() => setShowForm(true)} className="btn-brand h-8 px-4 text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Create first schedule
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="divide-y" style={{ borderColor: '#f9fafb' }}>
          {recurring.map(r => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-gray-50 transition-colors" style={{ opacity: r.isActive ? 1 : 0.55 }}>
              <div className="p-2.5 rounded-2xl flex-shrink-0" style={{ background: `${FREQ_COLORS[r.frequency]}18` }}>
                <RefreshCw className="w-5 h-5" style={{ color: FREQ_COLORS[r.frequency] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{r.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${FREQ_COLORS[r.frequency]}18`, color: FREQ_COLORS[r.frequency] }}>
                    {FREQ_LABELS[r.frequency]}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: '#9ca3af' }}>
                    <Calendar className="w-3 h-3" /> Next: {new Date(r.nextRunDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <p className="text-sm font-bold" style={{ color: '#111827' }}>Rs {r.total.toLocaleString('en-LK', { maximumFractionDigits: 0 })}</p>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleActive(r.id, r.isActive)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title={r.isActive ? 'Pause' : 'Resume'}>
                  {r.isActive ? <Pause className="w-4 h-4" style={{ color: '#f59e0b' }} /> : <Play className="w-4 h-4" style={{ color: '#16a34a' }} />}
                </button>
                <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  )
}
