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
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-gray-900">Recurring Invoices</h1>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Auto-generate invoices on a schedule</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-brand h-9 px-5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Recurring
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Schedules', value: recurring.length, cls: 'stat-purple' },
          { label: 'Active', value: recurring.filter(r => r.isActive).length, cls: 'stat-emerald' },
          { label: 'Paused', value: recurring.filter(r => !r.isActive).length, cls: 'stat-blue' },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`${cls} rounded-2xl p-5 relative overflow-hidden`}>
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-20" style={{ background: '#9ca3af' }} />
            <p className="text-gray-900">{value}</p>
            <p className="text-gray-900">{label}</p>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: '#ffffff', border: '1px solid rgba(124,58,237,0.25)' }}>
          <h2 className="text-gray-900">New Recurring Invoice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input required placeholder="Title (e.g. Monthly Retainer)" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
            <select required value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
              {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input required type="number" step="0.01" placeholder="Total amount (Rs )" value={form.total} onChange={e => setForm(p => ({ ...p, total: e.target.value }))}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
            <input required type="date" value={form.nextRunDate} onChange={e => setForm(p => ({ ...p, nextRunDate: e.target.value }))}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={{ ...inputStyle, colorScheme: 'dark' }} placeholder="First run date" />
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
        <div className="rounded-2xl p-12 flex flex-col items-center text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <RefreshCw className="w-10 h-10 mb-3 opacity-20" style={{ color: '#6b7280' }} />
          <p className="text-gray-900">No recurring invoices</p>
          <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>Set up automatic invoice generation for retainer clients</p>
          <Button onClick={() => setShowForm(true)} className="text-gray-900" style={{ background: 'linear-gradient(135deg, #6B50EE, #3B82F6)' }}>
            <Plus className="w-3 h-3" /> Create first schedule
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {recurring.map(r => (
            <div key={r.id} className="flex items-center gap-4 p-5 rounded-2xl group" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', opacity: r.isActive ? 1 : 0.6 }}>
              <div className="p-3 rounded-xl flex-shrink-0" style={{ background: `${FREQ_COLORS[r.frequency]}20` }}>
                <RefreshCw className="w-5 h-5" style={{ color: FREQ_COLORS[r.frequency] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900">{r.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${FREQ_COLORS[r.frequency]}20`, color: FREQ_COLORS[r.frequency] }}>
                    {FREQ_LABELS[r.frequency]}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#9ca3af' }}>
                    <Calendar className="w-3 h-3" /> Next: {new Date(r.nextRunDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <p className="text-gray-900">Rs {r.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleActive(r.id, r.isActive)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title={r.isActive ? 'Pause' : 'Resume'}>
                  {r.isActive ? <Pause className="w-4 h-4" style={{ color: 'hsl(38 92% 50%)' }} /> : <Play className="w-4 h-4" style={{ color: '#16a34a' }} />}
                </button>
                <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors">
                  <Trash2 className="w-4 h-4" style={{ color: 'hsl(0 84% 60%)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
