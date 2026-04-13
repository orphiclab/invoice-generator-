'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Receipt, TrendingDown, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Expense {
  id: string
  title: string
  amount: number
  date: string
  category: string
  description?: string
}

const CATEGORIES = [
  'Software', 'Hardware', 'Travel', 'Food & Dining', 'Marketing',
  'Office Supplies', 'Utilities', 'Salaries', 'Freelancers', 'Other'
]

const CATEGORY_COLORS: Record<string, string> = {
  Software: '#a28ef9', Hardware: 'hsl(199 89% 48%)', Travel: 'hsl(38 92% 50%)',
  'Food & Dining': '#16a34a', Marketing: 'hsl(311 70% 60%)', 'Office Supplies': '#60A5FA',
  Utilities: 'hsl(30 80% 55%)', Salaries: 'hsl(0 84% 60%)', Freelancers: 'hsl(180 60% 50%)', Other: '#6b7280',
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
  const [form, setForm] = useState({ title: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Software', description: '' })
  const [saving, setSaving] = useState(false)

  async function fetchExpenses() {
    const params = filterCategory ? `?category=${encodeURIComponent(filterCategory)}` : ''
    const data = await fetch(`/api/expenses${params}`).then(r => r.json())
    setExpenses(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchExpenses() }, [filterCategory])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Expense added')
      setShowForm(false)
      setForm({ title: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Software', description: '' })
      fetchExpenses()
    } catch {
      toast.error('Failed to add expense')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this expense?')) return
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    toast.success('Deleted')
    fetchExpenses()
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]

  const inputStyle = { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>Expenses</h1>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Track your business expenses</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-brand h-9 px-5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f87171 0%, #fda4af 100%)', boxShadow: '0 8px 24px rgba(248,113,113,0.3)' }}>
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <p className="text-xl font-extrabold text-white">Rs {total.toLocaleString('en-LK', { maximumFractionDigits: 0 })}</p>
          <p className="text-xs mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>Total Expenses</p>
        </div>
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #a28ef9 0%, #7c5cfc 100%)', boxShadow: '0 8px 24px rgba(162,142,249,0.3)' }}>
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <p className="text-xl font-extrabold text-white">{expenses.length}</p>
          <p className="text-xs mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>Total Transactions</p>
        </div>
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)', boxShadow: '0 8px 24px rgba(96,165,250,0.3)' }}>
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <Filter className="w-5 h-5 text-white" />
          </div>
          <p className="text-xl font-extrabold text-white">{topCategory?.[0] ?? '—'}</p>
          <p className="text-xs mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>Top Category</p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: '#ffffff', border: '1px solid rgba(124,58,237,0.25)' }}>
          <h2 className="text-base font-bold" style={{ color: '#111827' }}>New Expense</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input required placeholder="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
            <input required type="number" step="0.01" placeholder="Amount (Rs )" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
            <input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={{ ...inputStyle, colorScheme: 'dark' }} />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-brand h-8 px-5 text-xs">
              {saving ? 'Saving...' : 'Add Expense'}
            </button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="text-xs h-8 px-4" style={{ color: '#6b7280' }}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Category pill filters */}
      <div className="pill-tab-bar flex-wrap">
        <button onClick={() => setFilterCategory('')} className={`pill-tab${!filterCategory ? ' active' : ''}`}>All</button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCategory(c === filterCategory ? '' : c)}
            className={`pill-tab${filterCategory === c ? ' active' : ''}`}>{c}</button>
        ))}
      </div>

      {/* Expense List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 flex flex-col items-center text-center" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f9fafb' }}>
            <Receipt className="w-7 h-7" style={{ color: '#d1d5db' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#374151' }}>No expenses yet</p>
          <p className="text-xs mt-1 mb-4" style={{ color: '#9ca3af' }}>Start tracking your business expenses</p>
          <button onClick={() => setShowForm(true)} className="btn-brand h-8 px-4 text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add first expense
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="divide-y" style={{ borderColor: '#f9fafb' }}>
          {expenses.map(exp => (
                <div key={exp.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: `${CATEGORY_COLORS[exp.category] ?? '#9ca3af'}18`, color: CATEGORY_COLORS[exp.category] ?? '#6b7280' }}>
                {exp.category.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{exp.title}</p>
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  {exp.category} · {new Date(exp.date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {exp.description && <p className="text-xs mt-0.5 truncate" style={{ color: '#9ca3af' }}>{exp.description}</p>}
              </div>
              <p className="text-sm font-bold" style={{ color: '#ef4444' }}>-Rs {exp.amount.toLocaleString('en-LK', { maximumFractionDigits: 0 })}</p>
              <button onClick={() => handleDelete(exp.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50">
                <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
              </button>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  )
}
