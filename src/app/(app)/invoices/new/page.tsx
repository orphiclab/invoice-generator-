'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2, ArrowLeft, Calculator, X, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { ClientSelect } from '@/components/ClientSelect'

interface Client { id: string; name: string; company?: string }
interface Currency { id: string; code: string; symbol: string; name: string }
interface Item { description: string; quantity: number; unitPrice: number; productId?: string }

const inputStyle = { background: '#ffffff', borderColor: '#e5e7eb' }
const labelStyle = { color: '#6b7280' }

export default function NewInvoicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [showNewClient, setShowNewClient] = useState(false)
  const [savingClient, setSavingClient] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', company: '' })
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
    bankDetails: '' as string | null,
  })
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, unitPrice: 0 }])
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [availableProducts, setAvailableProducts] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/clients').then((r) => r.json()).then((d) => setClients(Array.isArray(d) ? d : []))
    fetch('/api/currencies').then((r) => r.json()).then((d: Currency[]) => {
      if (Array.isArray(d)) {
        setCurrencies(d)
        const lkr = d.find(c => c.code === 'LKR')
        if (lkr) setForm(prev => ({ ...prev, currencyId: lkr.id }))
      }
    })
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(d => {
      if (d && !d.error) {
        setForm(prev => ({ ...prev, 
          tax: d.defaultTaxRate ?? prev.tax, 
          notes: d.defaultNotes ?? prev.notes, 
        }))
      }
    })
    fetch('/api/bank-accounts').then(r => r.ok ? r.json() : null).then(d => {
      if (Array.isArray(d) && d.length > 0) {
        setBankAccounts(d)
        const def = d.find(a => a.isDefault) || d[0]
        setForm(prev => ({ ...prev, bankDetails: def.details }))
      }
    })
    fetch('/api/products').then(r => r.json()).then(d => setAvailableProducts(Array.isArray(d) ? d : []))
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

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault()
    if (!newClient.name.trim()) { toast.error('Client name is required'); return }
    setSavingClient(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to create client'); return }
      setClients(prev => [...prev, data])
      setForm(prev => ({ ...prev, clientId: data.id }))
      setShowNewClient(false)
      setNewClient({ name: '', email: '', phone: '', company: '' })
      toast.success(`${data.name} added & selected!`)
    } catch {
      toast.error('Failed to create client')
    } finally {
      setSavingClient(false)
    }
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/invoices">
          <button className="p-2 rounded-xl hover:bg-gray-50 transition-colors" style={{ color: '#6b7280' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>New Invoice</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>Create and send in under 60 seconds</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice details */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-bold" style={{ color: '#111827' }}>Invoice Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client selector with Add New button */}
            <div className="space-y-2">
              <Label className="text-sm" style={labelStyle}>Client *</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <ClientSelect
                    clients={clients}
                    value={form.clientId}
                    onChange={(id) => setForm({ ...form, clientId: id })}
                    required
                  />
                </div>
                <button type="button" onClick={() => setShowNewClient(true)}
                  className="h-9 w-9 flex-shrink-0 rounded-xl flex items-center justify-center transition-all hover:opacity-90 active:scale-95"
                  style={{ background: '#a28ef9', color: '#fff' }}
                  title="Add new client">
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm" style={labelStyle}>Invoice Number *</Label>
              <Input value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} className="text-gray-900" style={inputStyle} required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={labelStyle}>Issue Date</Label>
              <Input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className="text-gray-900" style={inputStyle} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={labelStyle}>Due Date *</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="text-gray-900" style={inputStyle} required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={labelStyle}>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="text-gray-900" style={inputStyle}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
                  {['DRAFT', 'SENT', 'PAID', 'OVERDUE'].map((s) => (
                    <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={labelStyle}>Currency</Label>
              <select value={form.currencyId} onChange={(e) => setForm({ ...form, currencyId: e.target.value })}
                className="text-gray-900" style={inputStyle}>
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
          <h2 className="text-base font-bold" style={{ color: '#111827' }}>Line Items</h2>
          <div className="space-y-3">
            {/* Column headers — desktop only */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-1">
              <div className="col-span-5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Description</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Qty</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Unit Price</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Total</div>
              <div className="col-span-1"></div>
            </div>
            {items.map((item, idx) => (
              <div key={idx}>
                {/* Desktop: 12-col grid */}
                <div className="hidden sm:grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5 relative group">
                    <Select
                      value={item.productId || "custom"}
                      onValueChange={(val) => {
                        if (val === "custom") {
                          updateItem(idx, 'productId', '')
                        } else {
                          const p = availableProducts.find(x => x.id === val)
                          if (p) {
                            setItems(items.map((it, i) => i === idx ? { 
                              ...it, 
                              productId: p.id, 
                              description: p.name, 
                              unitPrice: p.unitPrice 
                            } : it))
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="text-gray-900 w-full" style={inputStyle}>
                        <SelectValue placeholder="Select or type..." />
                      </SelectTrigger>
                      <SelectContent style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
                        <SelectItem value="custom">Custom Item / Service</SelectItem>
                        {availableProducts.filter(p => p.isActive).map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} (Rs {p.unitPrice}) {p.trackInventory ? `— ${p.stockQuantity} in stock` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!item.productId && (
                      <Input className="text-gray-900 w-full mt-1" style={inputStyle} placeholder="Add custom description..."
                        value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} required />
                    )}
                  </div>
                  <div className="col-span-2">
                    <Input className="text-gray-900 w-full" style={inputStyle} type="number" min={0.01} step={0.01}
                      value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-2">
                    <Input className="text-gray-900 w-full" style={inputStyle} type="number" min={0} step={0.01} placeholder="0.00"
                      value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-2 text-sm font-semibold px-1" style={{ color: '#111827' }}>
                    {currSymbol}{(item.quantity * item.unitPrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button type="button" onClick={() => removeItem(idx)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: 'hsl(0 72% 65%)' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {/* Mobile: stacked card */}
                <div className="sm:hidden rounded-xl p-3 space-y-2" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase" style={{ color: '#9ca3af' }}>Item {idx + 1}</span>
                    <button type="button" onClick={() => removeItem(idx)} className="p-1 rounded-lg hover:bg-red-500/10" style={{ color: 'hsl(0 72% 65%)' }}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <Select
                    value={item.productId || "custom"}
                    onValueChange={(val) => {
                      if (val === "custom") {
                        updateItem(idx, 'productId', '')
                      } else {
                        const p = availableProducts.find(x => x.id === val)
                        if (p) {
                          setItems(items.map((it, i) => i === idx ? { ...it, productId: p.id, description: p.name, unitPrice: p.unitPrice } : it))
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="text-gray-900 w-full" style={inputStyle}>
                      <SelectValue placeholder="Select product..." />
                    </SelectTrigger>
                    <SelectContent style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
                      <SelectItem value="custom">Custom Item / Service</SelectItem>
                      {availableProducts.filter(p => p.isActive).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} (Rs {p.unitPrice})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!item.productId && (
                    <Input className="text-gray-900 w-full" style={inputStyle} placeholder="Description..."
                      value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} required />
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold block mb-0.5" style={{ color: '#9ca3af' }}>Qty</label>
                      <Input className="text-gray-900 w-full" style={inputStyle} type="number" min={0.01} step={0.01}
                        value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold block mb-0.5" style={{ color: '#9ca3af' }}>Price</label>
                      <Input className="text-gray-900 w-full" style={inputStyle} type="number" min={0} step={0.01}
                        value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold block mb-0.5" style={{ color: '#9ca3af' }}>Total</label>
                      <div className="h-9 flex items-center text-sm font-bold" style={{ color: '#111827' }}>
                        {currSymbol}{(item.quantity * item.unitPrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-2 gap-2 text-xs border-border hover:bg-gray-50" style={{ color: '#9B8AFF' }}>
              <Plus className="w-3.5 h-3.5" /> Add Item
            </Button>
          </div>
        </div>

        {/* Totals + Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-base font-bold" style={{ color: '#111827' }}>Notes</h2>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4}
              placeholder="Payment terms, thank you notes, bank details…" className="text-gray-900"
              style={{ ...inputStyle, '--tw-ring-color': '#a28ef9' } as React.CSSProperties} />
            
            {bankAccounts.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-bold mb-2" style={{ color: '#111827' }}>Bank Details</h3>
                <select 
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none text-gray-900 focus:ring-2 focus:ring-[#a28ef9] focus:border-transparent" 
                  style={{ border: '1px solid #e5e7eb', background: '#f9fafb' }}
                  onChange={(e) => setForm({ ...form, bankDetails: e.target.value || null })}
                  value={form.bankDetails || ""}
                >
                  <option value="">None (Do not include bank details)</option>
                  {bankAccounts.map((a: any) => (
                    <option key={a.id} value={a.details}>{a.name}</option>
                  ))}
                </select>
                {form.bankDetails && (
                  <div className="mt-3 p-3 rounded-xl" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <p className="whitespace-pre-line text-xs" style={{ color: '#6b7280' }}>{form.bankDetails}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-base font-bold" style={{ color: '#111827' }}>
              <Calculator className="w-4 h-4" style={{ color: '#a28ef9' }} /> Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm" style={{ color: '#6b7280' }}>
                <span>Subtotal</span>
                <span className="text-gray-900">{currSymbol}{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm flex-1" style={{ color: '#6b7280' }}>Tax (%)</span>
                <Input type="number" min={0} max={100} step={0.1} value={form.tax} onChange={(e) => setForm({ ...form, tax: parseFloat(e.target.value) || 0 })}
                  className="text-gray-900" style={inputStyle} />
                <span className="text-gray-900">{currSymbol}{taxAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm flex-1" style={{ color: '#6b7280' }}>Discount (%)</span>
                <Input type="number" min={0} max={100} step={0.1} value={form.discount} onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })}
                  className="text-gray-900" style={inputStyle} />
                <span className="text-gray-900">-{currSymbol}{discountAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900">Total</span>
                  <span className="text-xl font-bold gradient-text">{currSymbol}{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/invoices">
            <Button variant="outline" className="border-border hover:bg-muted" style={{ color: '#6b7280' }}>Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="text-gray-900" style={{ background: 'linear-gradient(135deg, #6B50EE, #3B82F6)' }}>
            {loading ? 'Saving…' : 'Create Invoice'}
          </Button>
        </div>
      </form>

      {/* Add New Client Modal */}
      {showNewClient && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowNewClient(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}
            style={{ animation: 'fadeIn 200ms ease-out' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#111827' }}>
                  <UserPlus className="w-4 h-4" style={{ color: '#a28ef9' }} /> Add New Client
                </h2>
                <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Quick add — you can edit details later</p>
              </div>
              <button onClick={() => setShowNewClient(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" style={{ color: '#6b7280' }} />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Full Name *</label>
                <input required value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" placeholder="John Doe"
                  style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }} autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Email</label>
                  <input type="email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" placeholder="john@email.com"
                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Phone</label>
                  <input value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" placeholder="+94 77 123 4567"
                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Company</label>
                <input value={newClient.company} onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" placeholder="Acme Inc. (optional)"
                  style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowNewClient(false)}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold transition-colors hover:bg-gray-50"
                  style={{ border: '1px solid #e5e7eb', color: '#6b7280' }}>
                  Cancel
                </button>
                <button type="submit" disabled={savingClient}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: '#a28ef9' }}>
                  {savingClient ? 'Adding...' : 'Add & Select'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
