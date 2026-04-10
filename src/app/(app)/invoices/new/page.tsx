'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2, ArrowLeft, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

interface Client { id: string; name: string; company?: string }
interface Currency { id: string; code: string; symbol: string; name: string }
interface Item { description: string; quantity: number; unitPrice: number }

const inputStyle = { background: '#16191F', borderColor: 'rgba(255,255,255,0.1)' }
const labelStyle = { color: 'rgba(255,255,255,0.55)' }

export default function NewInvoicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [form, setForm] = useState({
    clientId: '',
    invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
    status: 'DRAFT',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    notes: '',
    tax: 0,
    discount: 0,
    currencyId: '',
  })
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, unitPrice: 0 }])

  useEffect(() => {
    fetch('/api/clients').then((r) => r.json()).then((d) => setClients(Array.isArray(d) ? d : []))
    fetch('/api/currencies').then((r) => r.json()).then((d: Currency[]) => {
      if (Array.isArray(d)) {
        setCurrencies(d)
        const lkr = d.find(c => c.code === 'LKR')
        if (lkr) setForm(prev => ({ ...prev, currencyId: lkr.id }))
      }
    })
  }, [])

  const currSymbol = currencies.find(c => c.id === form.currencyId)?.symbol ?? 'Rs'

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const taxAmt = (subtotal * form.tax) / 100
  const discountAmt = (subtotal * form.discount) / 100
  const total = subtotal + taxAmt - discountAmt

  function addItem() { setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]) }
  function removeItem(idx: number) { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)) }
  function updateItem(idx: number, field: keyof Item, value: string | number) {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clientId) { toast.error('Please select a client'); return }
    if (items.some((i) => !i.description)) { toast.error('Fill all item descriptions'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items }),
      })
      const data = await res.json()
      if (!res.ok) toast.error(data.error || 'Failed to create invoice')
      else { toast.success('Invoice created!'); router.push(`/invoices/${data.id}`) }
    } finally { setLoading(false) }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/invoices">
          <button className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">New Invoice</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Create and send in under 60 seconds</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice details */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">Invoice Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm" style={labelStyle}>Client *</Label>
              <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                <SelectTrigger className="h-10 text-white" style={inputStyle}>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent style={{ background: '#16191F', borderColor: 'rgba(255,255,255,0.1)' }}>
                  {clients.length === 0 ? (
                    <SelectItem value="_none" disabled>No clients yet — <Link href="/clients" className="underline">add one</Link></SelectItem>
                  ) : clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={labelStyle}>Invoice Number *</Label>
              <Input value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} className="h-10 text-white font-mono" style={inputStyle} required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={labelStyle}>Issue Date</Label>
              <Input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className="h-10 text-white" style={inputStyle} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={labelStyle}>Due Date *</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="h-10 text-white" style={inputStyle} required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={labelStyle}>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="h-10 text-white" style={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#16191F', borderColor: 'rgba(255,255,255,0.1)' }}>
                  {['DRAFT', 'SENT', 'PAID', 'OVERDUE'].map((s) => (
                    <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={labelStyle}>Currency</Label>
              <select value={form.currencyId} onChange={(e) => setForm({ ...form, currencyId: e.target.value })}
                className="w-full h-10 px-3 rounded-md text-sm text-white outline-none" style={inputStyle}>
                <option value="">LKR (Rs) — default</option>
                {currencies.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} ({c.symbol}) — {c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">Line Items</h2>
          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-1">
              {['Description', 'Qty', 'Unit Price', 'Total', ''].map((h, i) => (
                <div key={i} className={`text-xs font-semibold uppercase tracking-wider ${i === 0 ? 'col-span-5' : i === 1 ? 'col-span-2' : i === 2 ? 'col-span-2' : i === 3 ? 'col-span-2' : 'col-span-1'}`} style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</div>
              ))}
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <Input
                  className="col-span-5 h-9 text-sm text-white"
                  style={inputStyle}
                  placeholder="Service or product description"
                  value={item.description}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  required
                />
                <Input
                  className="col-span-2 h-9 text-sm text-white text-center"
                  style={inputStyle}
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                />
                <Input
                  className="col-span-2 h-9 text-sm text-white"
                  style={inputStyle}
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                />
                <div className="col-span-2 text-sm font-medium text-white px-2">
                  {currSymbol}{(item.quantity * item.unitPrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="col-span-1">
                  <button type="button" onClick={() => removeItem(idx)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: 'hsl(0 72% 65%)' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-2 gap-2 text-xs border-border hover:bg-white/5" style={{ color: '#9B8AFF' }}>
              <Plus className="w-3.5 h-3.5" /> Add Item
            </Button>
          </div>
        </div>

        {/* Totals + Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">Notes</h2>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={4}
              placeholder="Payment terms, thank you notes, bank details…"
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white resize-none outline-none focus:ring-1 placeholder:text-muted-foreground"
              style={{ ...inputStyle, '--tw-ring-color': '#7B61FF' } as React.CSSProperties}
            />
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4" style={{ color: '#7B61FF' }} /> Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span>Subtotal</span>
                <span className="text-white font-medium">{currSymbol}{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm flex-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Tax (%)</span>
                <Input type="number" min={0} max={100} step={0.1} value={form.tax} onChange={(e) => setForm({ ...form, tax: parseFloat(e.target.value) || 0 })}
                  className="w-20 h-8 text-sm text-white text-right" style={inputStyle} />
                <span className="text-sm text-white font-medium w-24 text-right">{currSymbol}{taxAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm flex-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Discount (%)</span>
                <Input type="number" min={0} max={100} step={0.1} value={form.discount} onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })}
                  className="w-20 h-8 text-sm text-white text-right" style={inputStyle} />
                <span className="text-sm text-white font-medium w-24 text-right">-{currSymbol}{discountAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">Total</span>
                  <span className="text-xl font-bold gradient-text">{currSymbol}{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/invoices">
            <Button variant="outline" className="border-border hover:bg-muted" style={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="font-semibold text-white px-8" style={{ background: 'linear-gradient(135deg, #6B50EE, #3B82F6)' }}>
            {loading ? 'Saving…' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  )
}
