'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2, ArrowLeft, Calculator, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { ClientSelect } from '@/components/ClientSelect'

interface Client { id: string; name: string; company?: string }
interface Currency { id: string; code: string; symbol: string; name: string }
interface Item { description: string; quantity: number; unitPrice: number }

const inputStyle = { background: '#ffffff', borderColor: '#e5e7eb' }
const labelStyle = { color: '#6b7280' }

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [form, setForm] = useState({
    clientId: '',
    invoiceNo: '',
    status: 'DRAFT',
    issueDate: '',
    dueDate: '',
    notes: '',
    tax: 0,
    discount: 0,
    currencyId: '',
    bankDetails: '' as string | null,
  })
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, unitPrice: 0 }])
  const [bankAccounts, setBankAccounts] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/currencies').then((r) => r.json()),
      fetch('/api/bank-accounts').then((r) => r.ok ? r.json() : null),
      fetch(`/api/invoices/${id}`).then((r) => r.json()),
    ]).then(([clientsData, currenciesData, banksData, invoice]) => {
      setClients(Array.isArray(clientsData) ? clientsData : [])
      setCurrencies(Array.isArray(currenciesData) ? currenciesData : [])
      if (Array.isArray(banksData)) {
        setBankAccounts(banksData)
      }
      if (invoice && !invoice.error) {
        setForm({
          clientId: invoice.clientId || '',
          invoiceNo: invoice.invoiceNo || '',
          status: invoice.status || 'DRAFT',
          issueDate: invoice.issueDate ? invoice.issueDate.split('T')[0] : '',
          dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
          notes: invoice.notes || '',
          tax: invoice.tax ?? 0,
          discount: invoice.discount ?? 0,
          currencyId: invoice.currencyId || '',
          bankDetails: invoice.bankDetails || null,
        })
        setItems(
          invoice.items?.length
            ? invoice.items.map((i: { description: string; quantity: number; unitPrice: number }) => ({
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
              }))
            : [{ description: '', quantity: 1, unitPrice: 0 }]
        )
      }
      setFetching(false)
    })
  }, [id])

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const taxAmt = (subtotal * form.tax) / 100
  const discountAmt = (subtotal * form.discount) / 100
  const total = subtotal + taxAmt - discountAmt
  const currSym = currencies.find(c => c.id === form.currencyId)?.symbol ?? 'Rs '

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
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items }),
      })
      const data = await res.json()
      if (!res.ok) toast.error(data.error || 'Failed to update invoice')
      else { toast.success('Invoice updated!'); router.push(`/invoices/${id}`) }
    } finally { setLoading(false) }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/invoices/${id}`}>
          <button className="p-2 rounded-xl hover:bg-gray-50 transition-colors" style={{ color: '#6b7280' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>Edit Invoice</h1>
          <p className="text-sm font-mono" style={{ color: '#8B7AFF' }}>{form.invoiceNo}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice details */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-bold" style={{ color: '#111827' }}>Invoice Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm" style={labelStyle}>Client *</Label>
              <ClientSelect
                clients={clients}
                value={form.clientId}
                onChange={(id) => setForm({ ...form, clientId: id })}
                required
              />
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
                className="text-gray-900 w-full h-9 px-3 rounded-md border" style={inputStyle}>
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
            {/* Header */}
            <div className="grid grid-cols-12 gap-3 px-1">
              <div className="col-span-5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Description</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Qty</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Unit Price</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Total</div>
              <div className="col-span-1"></div>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-5">
                  <Input
                    className="text-gray-900 w-full"
                    style={inputStyle}
                    placeholder="Service or product description"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    className="text-gray-900 w-full"
                    style={inputStyle}
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    className="text-gray-900 w-full"
                    style={inputStyle}
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2 text-sm font-semibold px-1" style={{ color: '#111827' }}>
                  {currSym}{(item.quantity * item.unitPrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="col-span-1 flex justify-center">
                  <button type="button" onClick={() => removeItem(idx)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: 'hsl(0 72% 65%)' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={4}
              placeholder="Payment terms, thank you notes, bank details…"
              className="text-gray-900"
              style={{ ...inputStyle, '--tw-ring-color': '#a28ef9' } as React.CSSProperties}
            />

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
                <span className="text-gray-900">{currSym}{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm flex-1" style={{ color: '#6b7280' }}>Tax (%)</span>
                <Input type="number" min={0} max={100} step={0.1} value={form.tax} onChange={(e) => setForm({ ...form, tax: parseFloat(e.target.value) || 0 })}
                  className="text-gray-900" style={inputStyle} />
                <span className="text-gray-900">{currSym}{taxAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm flex-1" style={{ color: '#6b7280' }}>Discount (%)</span>
                <Input type="number" min={0} max={100} step={0.1} value={form.discount} onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })}
                  className="text-gray-900" style={inputStyle} />
                <span className="text-gray-900">-{currSym}{discountAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900">Total</span>
                  <span className="text-xl font-bold gradient-text">{currSym}{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href={`/invoices/${id}`}>
            <Button variant="outline" className="border-border hover:bg-muted" style={{ color: '#6b7280' }}>Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="text-gray-900" style={{ background: 'linear-gradient(135deg, #6B50EE, #3B82F6)' }}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
