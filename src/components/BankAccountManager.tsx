'use client'

import { useEffect, useState } from 'react'
import { Landmark, Trash2, PenSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function BankAccountManager() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', details: '', isDefault: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/bank-accounts').then(r => r.json()).then(d => {
      setAccounts(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const method = editingId ? 'PUT' : 'POST'
    const url = editingId ? `/api/bank-accounts/${editingId}` : '/api/bank-accounts'
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      
      let newAccounts = [...accounts]
      if (saved.isDefault) newAccounts = newAccounts.map(a => ({ ...a, isDefault: false }))
      
      if (editingId) {
        setAccounts(newAccounts.map(a => a.id === editingId ? saved : a))
        toast.success('Account updated')
      } else {
        setAccounts([saved, ...newAccounts])
        toast.success('Account created')
      }
      reset()
    } catch {
      toast.error('Failed to save account')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this bank account?')) return
    try {
      const res = await fetch(`/api/bank-accounts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setAccounts(accounts.filter(a => a.id !== id))
      toast.success('Account deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  function reset() {
    setEditingId(null)
    setForm({ name: '', details: '', isDefault: false })
  }

  function edit(a: any) {
    setEditingId(a.id)
    setForm({ name: a.name, details: a.details, isDefault: a.isDefault })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h2 className="text-base font-bold flex items-center gap-2 mb-2" style={{ color: '#111827' }}>
          <Landmark className="w-4 h-4" style={{ color: '#a28ef9' }} /> Bank Accounts
        </h2>
        <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Manage multiple bank accounts to easily assign them to invoices.</p>

        <form onSubmit={handleSave} className="space-y-4 p-5 rounded-2xl mb-8" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
          <h3 className="text-sm font-bold" style={{ color: '#111827' }}>
            {editingId ? 'Edit Bank Account' : 'Add New Bank Account'}
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="text-xs mb-1.5 block" style={{ color: '#6b7280' }}>Account Display Name (e.g., LKR Primary, USD Savings)</Label>
              <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} 
                className="h-10" style={{ background: '#ffffff', borderColor: '#d1d5db', color: '#111827' }} />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block" style={{ color: '#6b7280' }}>Bank Details (This text is appended to your invoice)</Label>
              <textarea required rows={3} value={form.details} onChange={e => setForm({ ...form, details: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" 
                style={{ background: '#ffffff', border: '1px solid #d1d5db', color: '#111827' }} 
                placeholder="Bank Name: Example Bank&#10;Account Name: Acme Corp&#10;Account No: 12345678" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="defaultAcct" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} 
                className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: '#a28ef9' }} />
              <label htmlFor="defaultAcct" className="text-xs cursor-pointer font-medium" style={{ color: '#374151' }}>Set as default account</label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="h-9 px-6 text-sm font-semibold rounded-xl" style={{ background: 'linear-gradient(135deg, #6B50EE, #3B82F6)', color: 'white' }}>
              {saving ? 'Saving...' : (editingId ? 'Update Account' : 'Add Account')}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={reset} className="h-9 px-6 text-sm font-medium rounded-xl border-gray-300 hover:bg-gray-50" style={{ color: '#374151' }}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        {loading ? (
          <div className="py-10 text-center">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm" style={{ color: '#9ca3af' }}>Loading accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
            <Landmark className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium" style={{ color: '#6b7280' }}>No bank accounts added yet.</p>
            <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Add your first bank account above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map(a => (
              <div key={a.id} className="p-5 rounded-2xl flex items-start justify-between group transition-shadow hover:shadow-md" style={{ border: '1px solid #e5e7eb', background: '#ffffff' }}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-sm truncate" style={{ color: '#111827' }}>{a.name}</span>
                    {a.isDefault && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(162,142,249,0.1)', color: '#9B8AFF' }}>Default</span>}
                  </div>
                  <p className="text-xs whitespace-pre-line leading-relaxed" style={{ color: '#6b7280' }}>{a.details}</p>
                </div>
                <div className="flex gap-1 ml-4 flex-shrink-0">
                  <button onClick={() => edit(a)} type="button" className="p-2 rounded-xl hover:bg-gray-50 transition-colors" style={{ color: '#6b7280' }}>
                    <PenSquare className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(a.id)} type="button" className="p-2 rounded-xl hover:bg-red-50 transition-colors" style={{ color: '#ef4444' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
