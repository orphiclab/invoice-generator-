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
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-gray-900">Expenses</h1>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Track your business expenses</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-brand h-9 px-5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-rose rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-20" style={{ background: '#9ca3af' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#9ca3af' }}>
            <TrendingDown className="text-gray-900" />
          </div>
          <p className="text-gray-900">Rs {total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-gray-900">Total Expenses</p>
        </div>
        <div className="stat-purple rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-20" style={{ background: '#9ca3af' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#9ca3af' }}>
            <Receipt className="text-gray-900" />
          </div>
          <p className="text-gray-900">{expenses.length}</p>
          <p className="text-gray-900">Total Transactions</p>
        </div>
        <div className="stat-blue rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-20" style={{ background: '#9ca3af' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#9ca3af' }}>
            <Filter className="text-gray-900" />
          </div>
          <p className="text-gray-900">{topCategory?.[0] ?? '—'}</p>
          <p className="text-gray-900">Top Category</p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: '#ffffff', border: '1px solid rgba(124,58,237,0.25)' }}>
          <h2 className="text-gray-900">New Expense</h2>
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

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCategory('')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={!filterCategory ? { background: 'rgba(139,92,246,0.2)', color: '#9B8AFF' } : { background: '#f9fafb', color: '#6b7280' }}>
          All
        </button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCategory(c === filterCategory ? '' : c)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={filterCategory === c ? { background: 'rgba(139,92,246,0.2)', color: '#9B8AFF' } : { background: '#f9fafb', color: '#6b7280' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Expense List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-2xl p-12 flex flex-col items-center text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <Receipt className="w-10 h-10 mb-3 opacity-20" style={{ color: '#6b7280' }} />
          <p className="text-gray-900">No expenses yet</p>
          <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>Start tracking your business expenses</p>
          <Button onClick={() => setShowForm(true)} className="text-gray-900" style={{ background: 'linear-gradient(135deg, #6B50EE, #3B82F6)' }}>
            <Plus className="w-3 h-3" /> Add first expense
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map(exp => (
            <div key={exp.id} className="flex items-center gap-4 p-4 rounded-2xl group hover:scale-[1.005] transition-all" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: `${CATEGORY_COLORS[exp.category] ?? '#9ca3af'}20`, color: CATEGORY_COLORS[exp.category] ?? '#6b7280' }}>
                {exp.category.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900">{exp.title}</p>
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  {exp.category} · {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {exp.description && <p className="text-xs mt-0.5 truncate" style={{ color: '#9ca3af' }}>{exp.description}</p>}
              </div>
              <p className="text-base font-bold" style={{ color: 'hsl(0 84% 65%)' }}>-Rs {exp.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              <button onClick={() => handleDelete(exp.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/20">
                <Trash2 className="w-4 h-4" style={{ color: 'hsl(0 84% 60%)' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
