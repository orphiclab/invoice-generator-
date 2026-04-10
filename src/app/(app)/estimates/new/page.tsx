'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Client { id: string; name: string; company?: string }
interface Currency { id: string; code: string; symbol: string; name: string }
interface LineItem { description: string; quantity: string; unitPrice: string }

export default function NewEstimatePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    clientId: '', expiryDate: '', notes: '', taxRate: '0', discount: '0', currencyId: '',
  })
  const [items, setItems] = useState<LineItem[]>([{ description: '', quantity: '1', unitPrice: '' }])

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : []))
    fetch('/api/currencies').then(r => r.json()).then((d: Currency[]) => {
      if (Array.isArray(d)) {
        setCurrencies(d)
        const lkr = d.find(c => c.code === 'LKR')
        if (lkr) setForm(p => ({ ...p, currencyId: lkr.id }))
      }
    })
  }, [])

  function addItem() { setItems(p => [...p, { description: '', quantity: '1', unitPrice: '' }]) }
  function removeItem(i: number) { setItems(p => p.filter((_, idx) => idx !== i)) }
  function updateItem(i: number, field: keyof LineItem, val: string) {
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
  }

  const subtotal = items.reduce((s, item) => s + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0), 0)
  const taxAmt = subtotal * (parseFloat(form.taxRate) || 0) / 100
  const total = subtotal + taxAmt - (parseFloat(form.discount) || 0)

  const currSymbol = currencies.find(c => c.id === form.currencyId)?.symbol ?? 'Rs'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clientId || !form.expiryDate) { toast.error('Client and expiry date are required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: items.map(it => ({ ...it, quantity: parseFloat(it.quantity), unitPrice: parseFloat(it.unitPrice) })) }),
      })
      if (!res.ok) throw new Error()
      toast.success('Estimate created!')
      router.push('/estimates')
    } catch {
      toast.error('Failed to create estimate')
      setSaving(false)
    }
  }

  const inputStyle = { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }
  const labelStyle = { color: '#6b7280', fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-gray-900">New Estimate</h1>
        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Create a quote for your client</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl p-6 space-y-4" style={{ background: '#f9fafb', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-gray-900">Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Client *</label>
              <select required value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Expiry Date *</label>
              <input required type="date" value={form.expiryDate} onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={labelStyle}>Currency</label>
              <select value={form.currencyId} onChange={e => setForm(p => ({ ...p, currencyId: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                <option value="">LKR (Rs) — default</option>
                {currencies.map(c => <option key={c.id} value={c.id}>{c.code} ({c.symbol}) — {c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Notes</label>
              <input placeholder="Optional notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="rounded-2xl p-6 space-y-3" style={{ background: '#f9fafb', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Line Items</h2>
            <Button type="button" variant="ghost" size="sm" onClick={addItem} className="gap-1 text-xs h-7" style={{ color: '#9B8AFF' }}>
              <Plus className="w-3 h-3" /> Add Item
            </Button>
          </div>
          <div className="grid grid-cols-12 gap-2 px-1">
            {['Description', 'Qty', 'Unit Price', 'Total', ''].map(h => (
              <div key={h} className="text-xs font-medium" style={{ color: '#9ca3af', gridColumn: h === 'Description' ? 'span 6' : h === '' ? 'span 1' : 'span 2' }}>{h}</div>
            ))}
          </div>
          {items.map((item, i) => {
            const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
            return (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                  className="col-span-6 px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
                <input type="number" min="0" step="0.01" placeholder="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)}
                  className="col-span-2 px-3 py-2 rounded-xl text-sm outline-none text-center" style={inputStyle} />
                <input type="number" min="0" step="0.01" placeholder="0.00" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                  className="col-span-2 px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
                <div className="text-gray-900">{currSymbol}{lineTotal.toFixed(0)}</div>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="col-span-1 p-1.5 rounded-lg hover:bg-red-500/20 w-fit">
                    <Trash2 className="w-3.5 h-3.5" style={{ color: 'hsl(0 84% 60%)' }} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Totals */}
        <div className="rounded-2xl p-6" style={{ background: '#f9fafb', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="max-w-xs ml-auto space-y-3">
            <div className="flex justify-between text-sm">
              <span style={{ color: '#6b7280' }}>Subtotal</span>
              <span className="text-gray-900">{currSymbol}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <label style={{ ...labelStyle, margin: 0 }}>Tax %</label>
              <input type="number" min="0" max="100" step="0.1" value={form.taxRate} onChange={e => setForm(p => ({ ...p, taxRate: e.target.value }))}
                className="w-24 px-3 py-1.5 rounded-xl text-sm outline-none text-right" style={inputStyle} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <label style={{ ...labelStyle, margin: 0 }}>Discount ({currSymbol})</label>
              <input type="number" min="0" step="0.01" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))}
                className="w-24 px-3 py-1.5 rounded-xl text-sm outline-none text-right" style={inputStyle} />
            </div>
            <div className="pt-3 border-t flex justify-between" style={{ borderColor: '#e5e7eb' }}>
              <span className="text-gray-900">Total</span>
              <span className="text-lg font-bold" style={{ color: '#9B8AFF' }}>{currSymbol}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="text-gray-900" style={{ background: 'linear-gradient(135deg, #6B50EE, #3B82F6)' }}>
            {saving ? 'Creating...' : 'Create Estimate'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()} style={{ color: '#6b7280' }}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
