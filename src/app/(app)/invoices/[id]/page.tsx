'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Download, MessageCircle, Share2, Edit2, Check, Clock, Building2, Mail, Phone, MapPin, Copy, Send, X, DollarSign, AlertTriangle, Bell, Plus, CreditCard, ChevronDown, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/StatusBadge'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'
const InvoicePreviewModal = dynamic(
  () => import('@/components/InvoicePreviewModal').then(m => m.InvoicePreviewModal),
  { ssr: false }
)

interface InvoiceItem { description: string; quantity: number; unitPrice: number; total: number }
interface PaymentRecord { id: string; amount: number; method: string; note?: string; paymentType: string; paidAt?: string; createdAt: string }
interface Invoice {
  id: string; invoiceNo: string; status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
  total: number; subtotal: number; tax: number; discount: number
  dueDate: string; issueDate: string; notes?: string; shareToken?: string
  lateFeeApplied: boolean; lateFeeAmount: number; lateFeeRate: number
  remindersSent: number; lastReminderAt?: string
  client: { name: string; email: string; phone?: string; company?: string; address?: string }
  user: { name: string; email: string; company?: string; phone?: string; address?: string }
  items: InvoiceItem[]
  currency?: { symbol: string; code: string }
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [emailModal, setEmailModal] = useState(false)
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', message: '' })
  const [sendingEmail, setSendingEmail] = useState(false)
  // Finance features
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [amountPaid, setAmountPaid] = useState(0)
  const [paymentModal, setPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'bank_transfer', note: '' })
  const [recordingPayment, setRecordingPayment] = useState(false)
  const [sendingReminder, setSendingReminder] = useState(false)
  const [applyingLateFee, setApplyingLateFee] = useState(false)
  const [lateFeeRate, setLateFeeRate] = useState('2')
  const [pdfTemplate, setPdfTemplate] = useState<'green' | 'classic'>('green')
  const [showTemplateMenu, setShowTemplateMenu] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const loadPayments = useCallback(async () => {
    const res = await fetch(`/api/invoices/${id}/record-payment`)
    if (res.ok) {
      const data = await res.json()
      setPayments(data.payments ?? [])
      setAmountPaid(data.amountPaid ?? 0)
    }
  }, [id])

  useEffect(() => {
    fetch(`/api/invoices/${id}`).then((r) => r.json()).then((d) => {
      setInvoice(d)
      setLoading(false)
    })
    loadPayments()
  }, [id, loadPayments])

  async function updateStatus(status: string) {
    setUpdatingStatus(true)
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (res.ok) { setInvoice(data); toast.success('Status updated') }
    else toast.error('Failed to update status')
    setUpdatingStatus(false)
  }

  function shareWhatsApp() {
    if (!invoice) return
    const msg = encodeURIComponent(
      `Hi ${invoice.client.name},\n\nPlease find your invoice ${invoice.invoiceNo} for Rs ${invoice.total.toLocaleString('en-IN')}.\n\nDue date: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}\n\nView invoice: ${process.env.NEXT_PUBLIC_APP_URL}/share/${invoice.shareToken}\n\nThank you!`
    )
    const phone = invoice.client.phone?.replace(/\D/g, '') || ''
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  function copyShareLink() {
    const link = `${window.location.origin}/share/${invoice?.shareToken}`
    navigator.clipboard.writeText(link)
    toast.success('Share link copied!')
  }

  async function downloadPDF() {
    toast.info('Generating PDF…')
    const { pdf } = await import('@react-pdf/renderer')
    const { createElement } = await import('react')
    let blob: Blob
    if (pdfTemplate === 'green') {
      const { InvoicePDF } = await import('@/components/InvoicePDF')
      blob = await pdf(createElement(InvoicePDF, { invoice })).toBlob()
    } else {
      const { InvoicePDFClassic } = await import('@/components/InvoicePDFClassic')
      blob = await pdf(createElement(InvoicePDFClassic, { invoice })).toBlob()
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${invoice?.invoiceNo}.pdf`; a.click()
    URL.revokeObjectURL(url)
    toast.success('PDF downloaded!')
  }

  async function duplicateInvoice() {
    setDuplicating(true)
    try {
      const res = await fetch(`/api/invoices/${id}/duplicate`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) { toast.success(`Duplicated as ${data.invoiceNo}`); router.push(`/invoices/${data.id}`) }
      else toast.error(data.error || 'Failed to duplicate')
    } finally { setDuplicating(false) }
  }

  async function sendEmail() {
    if (!emailForm.to) { toast.error('Enter recipient email'); return }
    setSendingEmail(true)
    try {
      const res = await fetch(`/api/invoices/${id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...emailForm, invoiceId: id }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Invoice emailed successfully!')
        setEmailModal(false)
        setInvoice(prev => prev ? { ...prev, status: prev.status === 'DRAFT' ? 'SENT' : prev.status } : prev)
      } else toast.error(data.error || 'Failed to send email')
    } finally { setSendingEmail(false) }
  }

  async function sendReminder() {
    setSendingReminder(true)
    try {
      const res = await fetch(`/api/invoices/${id}/send-reminder`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message ?? 'Reminder sent!')
        setInvoice(prev => prev ? { ...prev, remindersSent: (prev.remindersSent ?? 0) + 1, lastReminderAt: new Date().toISOString() } : prev)
      } else toast.error(data.error || 'Failed to send reminder')
    } finally { setSendingReminder(false) }
  }

  async function applyLateFee() {
    setApplyingLateFee(true)
    try {
      const res = await fetch(`/api/invoices/${id}/apply-late-fee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lateFeeRate: parseFloat(lateFeeRate) || 2 }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Late fee of Rs ${data.lateFeeAmount?.toFixed(2)} applied (${data.daysOverdue} days overdue)`)
        setInvoice(prev => prev ? { ...prev, ...data.invoice } : prev)
      } else toast.error(data.error || 'Failed to apply late fee')
    } finally { setApplyingLateFee(false) }
  }

  async function recordPayment() {
    const amount = parseFloat(paymentForm.amount)
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return }
    setRecordingPayment(true)
    try {
      const res = await fetch(`/api/invoices/${id}/record-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method: paymentForm.method, note: paymentForm.note }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.isFullPayment ? '🎉 Invoice fully paid!' : `Payment of Rs ${amount.toFixed(2)} recorded`)
        setPaymentModal(false)
        setPaymentForm({ amount: '', method: 'bank_transfer', note: '' })
        await loadPayments()
        if (data.invoiceStatus) setInvoice(prev => prev ? { ...prev, status: data.invoiceStatus } : prev)
      } else toast.error(data.error || 'Failed to record payment')
    } finally { setRecordingPayment(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
    </div>
  )
  if (!invoice) return <div className="p-8 text-center" style={{ color: '#6b7280' }}>Invoice not found</div>

  const taxAmt = (invoice.subtotal * invoice.tax) / 100
  const discountAmt = (invoice.subtotal * invoice.discount) / 100

  return (
    <>
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/invoices">
          <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors" style={{ color: '#64748B' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-mono" style={{ color: '#1E293B' }}>{invoice.invoiceNo}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
            <Clock className="w-3 h-3 inline mr-1" />Due {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="w-36">
            <Select value={invoice.status} onValueChange={updateStatus} disabled={updatingStatus}>
              <SelectTrigger className="text-gray-900" style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
                {['DRAFT', 'SENT', 'PAID', 'OVERDUE'].map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button onClick={shareWhatsApp} title="Send via WhatsApp" className="p-2 rounded-xl hover:bg-green-500/10 transition-colors" style={{ color: '#16a34a' }}>
            <MessageCircle className="w-4 h-4" />
          </button>
          <button onClick={copyShareLink} title="Copy share link" className="p-2 rounded-xl hover:bg-gray-50 transition-colors" style={{ color: '#6b7280' }}>
            <Share2 className="w-4 h-4" />
          </button>
          {/* Preview button */}
          <button onClick={() => setShowPreview(true)} title="Preview invoice PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:bg-emerald-500/10"
            style={{ color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          {/* Download with template picker */}
          <div className="relative">
            <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid rgba(123,97,255,0.4)' }}>
              <button onClick={downloadPDF} title="Download PDF"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all hover:bg-gray-50"
                style={{ color: '#a28ef9' }}>
                <Download className="w-3.5 h-3.5" />
                {pdfTemplate === 'green' ? 'Green' : 'Classic'}
              </button>
              <button onClick={() => setShowTemplateMenu(p => !p)}
                className="px-1.5 py-1.5 border-l hover:bg-gray-50 transition-all"
                style={{ borderColor: 'rgba(123,97,255,0.4)', color: '#a28ef9' }}>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            {showTemplateMenu && (
              <div className="absolute right-0 top-9 z-50 rounded-xl overflow-hidden shadow-2xl" style={{ background: '#ffffff', border: '1px solid #e5e7eb', minWidth: 160 }}>
                <p className="text-[10px] font-bold px-3 pt-2.5 pb-1" style={{ color: '#9ca3af' }}>Choose Template</p>
                {[{ id: 'green', label: '🌿 Green Modern' }, { id: 'classic', label: '🌌 Classic Dark' }].map(t => (
                  <button key={t.id} onClick={() => { setPdfTemplate(t.id as 'green' | 'classic'); setShowTemplateMenu(false); downloadPDF() }}
                    className="w-full text-left px-3 py-2.5 text-xs hover:bg-gray-50 transition-all flex items-center justify-between"
                    style={{ color: pdfTemplate === t.id ? '#a28ef9' : '#374151' }}>
                    {t.label}
                    {pdfTemplate === t.id && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => { setEmailForm(f => ({ ...f, to: invoice.client.email, subject: `Invoice ${invoice.invoiceNo}` })); setEmailModal(true) }}
            title="Send email" className="p-2 rounded-xl hover:bg-blue-500/10 transition-colors" style={{ color: '#3b82f6' }}>
            <Mail className="w-4 h-4" />
          </button>
          <button onClick={duplicateInvoice} disabled={duplicating} title="Duplicate invoice" className="p-2 rounded-xl hover:bg-gray-50 transition-colors" style={{ color: '#6b7280' }}>
            <Copy className="w-4 h-4" />
          </button>
          <Link href={`/invoices/${id}/edit`}>
            <button className="p-2 rounded-xl hover:bg-gray-50 transition-colors" style={{ color: '#6b7280' }}><Edit2 className="w-4 h-4" /></button>
          </Link>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#ffffff' }}>
        {/* Dark header band — matching the reference design */}
        <div className="px-10 py-8 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1a2744 0%, #0f172a 100%)' }}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #a28ef9, #60A5FA)' }}>
                <Building2 className="text-gray-900" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{invoice.user.company || invoice.user.name}</p>
                {invoice.user.company && <p className="text-xs" style={{ color: '#6b7280' }}>{invoice.user.name}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {invoice.user.email && (
                <p className="text-xs flex items-center gap-1.5" style={{ color: '#6b7280' }}>
                  <Mail className="w-3 h-3" />{invoice.user.email}
                </p>
              )}
              {invoice.user.phone && (
                <p className="text-xs flex items-center gap-1.5" style={{ color: '#6b7280' }}>
                  <Phone className="w-3 h-3" />{invoice.user.phone}
                </p>
              )}
              {invoice.user.address && (
                <p className="text-xs flex items-center gap-1.5" style={{ color: '#6b7280' }}>
                  <MapPin className="w-3 h-3" />{invoice.user.address}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-1" style={{ color: '#9B8AFF' }}>Invoice</p>
            <p className="text-sm font-semibold" style={{ color: '#111827' }}>{invoice.invoiceNo}</p>
            <div className="mt-3 flex justify-end">
              <StatusBadge status={invoice.status} />
            </div>
          </div>
        </div>

        {/* Meta strip */}
        <div className="grid grid-cols-3 gap-0 border-b" style={{ borderColor: '#e5e7eb', background: '#f9fafb' }}>
          {[
            { label: 'Issue Date', value: new Date(invoice.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
            { label: 'Due Date', value: new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
            { label: 'Invoice No', value: invoice.invoiceNo },
          ].map(({ label, value }, i) => (
            <div key={label} className={`px-8 py-4 ${i < 2 ? 'border-r' : ''}`} style={{ borderColor: '#e5e7eb' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#9ca3af' }}>{label}</p>
              <p className="text-sm font-semibold font-mono" style={{ color: '#111827' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* From / To */}
        <div className="grid grid-cols-2 gap-0 border-b" style={{ borderColor: '#e5e7eb' }}>
          <div className="px-10 py-7 border-r" style={{ borderColor: '#e5e7eb' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9ca3af' }}>Invoice From</p>
            <p className="font-bold text-sm" style={{ color: '#111827' }}>{invoice.user.company || invoice.user.name}</p>
            {invoice.user.company && <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{invoice.user.name}</p>}
            {invoice.user.address && <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{invoice.user.address}</p>}
            {invoice.user.email && <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{invoice.user.email}</p>}
            {invoice.user.phone && <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{invoice.user.phone}</p>}
          </div>
          <div className="px-10 py-7">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9ca3af' }}>Invoice To</p>
            <p className="font-bold text-sm" style={{ color: '#111827' }}>{invoice.client.name}</p>
            {invoice.client.company && <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{invoice.client.company}</p>}
            {invoice.client.address && <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{invoice.client.address}</p>}
            <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{invoice.client.email}</p>
            {invoice.client.phone && <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{invoice.client.phone}</p>}
          </div>
        </div>

        {/* Items table */}
        <div className="px-10 py-8">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f3f4f6', borderRadius: '8px' }}>
                {['Item', 'Qty', 'Rate', 'Amount'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-bold uppercase tracking-wider first:rounded-l-lg last:rounded-r-lg ${i === 0 ? 'text-left' : 'text-right'}`} style={{ color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b last:border-0" style={{ borderColor: '#f3f4f6' }}>
                  <td className="py-4 px-4 text-sm font-medium" style={{ color: '#111827' }}>{item.description}</td>
                  <td className="py-4 px-4 text-sm text-right" style={{ color: '#6b7280' }}>{item.quantity}</td>
                  <td className="py-4 px-4 text-sm text-right" style={{ color: '#6b7280' }}>Rs {item.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="py-4 px-4 text-sm font-bold text-right" style={{ color: '#111827' }}>Rs {item.total.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals + Notes */}
        <div className="px-10 pb-10 flex justify-between items-start gap-8">
          {/* Notes */}
          <div className="flex-1">
            {invoice.notes && (
              <div className="p-4 rounded-xl border-l-4" style={{ background: '#f9fafb', borderLeftColor: '#6366f1' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>Notes</p>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="w-64 flex-shrink-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#6b7280' }}>Subtotal</span>
                <span className="font-medium" style={{ color: '#374151' }}>Rs {invoice.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#6b7280' }}>Tax ({invoice.tax}%)</span>
                  <span style={{ color: '#374151' }}>Rs {taxAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#6b7280' }}>Discount ({invoice.discount}%)</span>
                  <span style={{ color: '#16a34a' }}>-Rs {discountAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="pt-3 border-t flex justify-between items-center" style={{ borderColor: '#e5e7eb' }}>
                <span className="font-bold text-base" style={{ color: '#111827' }}>Total</span>
                <span className="text-2xl font-bold" style={{ color: '#6366f1' }}>Rs {invoice.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Paid stamp */}
        {invoice.status === 'PAID' && (
          <div className="mx-10 mb-8 flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '2px solid rgba(34,197,94,0.3)' }}>
            <Check className="w-5 h-5" style={{ color: '#16a34a' }} />
            <span className="font-bold text-lg tracking-widest uppercase" style={{ color: '#16a34a' }}>Paid</span>
          </div>
        )}
      </div>

      {/* ── Finance Panel ── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Payment History */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">
              <CreditCard className="w-4 h-4" style={{ color: '#a28ef9' }} /> Payment History
            </h3>
            {invoice.status !== 'PAID' && (
              <button onClick={() => setPaymentModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg btn-brand">
                <Plus className="w-3 h-3" /> Record Payment
              </button>
            )}
          </div>

          {/* Balance bar */}
          {invoice.total > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: '#6b7280' }}>
                <span>Rs {amountPaid.toLocaleString('en-LK', { maximumFractionDigits: 0 })} paid</span>
                <span>Rs {(invoice.total - amountPaid).toLocaleString('en-LK', { maximumFractionDigits: 0 })} remaining</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#e5e7eb' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (amountPaid / invoice.total) * 100)}%`, background: 'linear-gradient(90deg, #10B981, #059669)' }} />
              </div>
            </div>
          )}

          {payments.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: '#9ca3af' }}>No payments recorded yet</p>
          ) : (
            <div className="space-y-2">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: '#f9fafb' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                      <Check className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#111827' }}>{p.method.replace('_', ' ')} {p.paymentType === 'partial' ? '(Partial)' : ''}</p>
                      {p.note && <p className="text-[10px]" style={{ color: '#9ca3af' }}>{p.note}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: '#10B981' }}>Rs {p.amount.toLocaleString('en-LK', { maximumFractionDigits: 2 })}</p>
                    <p className="text-[10px]" style={{ color: '#9ca3af' }}>{new Date(p.paidAt ?? p.createdAt).toLocaleDateString('en-LK')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Panel */}
        <div className="space-y-4">

          {/* Payment Reminder */}
          <div className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 className="text-gray-900">
              <Bell className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} /> Payment Reminder
            </h3>
            {invoice.remindersSent > 0 && (
              <p className="text-[10px] mb-2" style={{ color: '#9ca3af' }}>
                {invoice.remindersSent} reminder{invoice.remindersSent > 1 ? 's' : ''} sent
                {invoice.lastReminderAt ? ` · Last: ${new Date(invoice.lastReminderAt).toLocaleDateString('en-LK')}` : ''}
              </p>
            )}
            <button onClick={sendReminder} disabled={sendingReminder || invoice.status === 'PAID'}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>
              <Send className="w-3 h-3" />
              {sendingReminder ? 'Sending...' : 'Send Reminder'}
            </button>
          </div>

          {/* Late Fee */}
          <div className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 className="text-gray-900">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#EF4444' }} /> Late Fee
            </h3>
            {invoice.lateFeeApplied ? (
              <div className="text-xs" style={{ color: '#EF4444' }}>
                ✓ Applied: Rs {invoice.lateFeeAmount?.toFixed(2)} ({invoice.lateFeeRate}%/mo)
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    type="number" min="0" max="100" step="0.5"
                    value={lateFeeRate}
                    onChange={e => setLateFeeRate(e.target.value)}
                    className="text-gray-900"
                    style={{ background: '#f9fafb', borderColor: '#e5e7eb' }}
                  />
                  <span className="text-xs" style={{ color: '#6b7280' }}>% / month</span>
                </div>
                <button onClick={applyLateFee} disabled={applyingLateFee || invoice.status === 'PAID' || invoice.lateFeeApplied}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
                  <AlertTriangle className="w-3 h-3" />
                  {applyingLateFee ? 'Applying...' : 'Apply Late Fee'}
                </button>
              </>
            )}
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 className="text-gray-900">
              <DollarSign className="w-3.5 h-3.5" style={{ color: '#a28ef9' }} /> Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: '#6b7280' }}>Invoice Total</span>
                <span className="text-gray-900">Rs {invoice.total.toLocaleString('en-LK', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#6b7280' }}>Paid</span>
                <span className="font-semibold" style={{ color: '#10B981' }}>Rs {amountPaid.toLocaleString('en-LK', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between pt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                <span style={{ color: '#6b7280' }}>Balance</span>
                <span className="font-bold" style={{ color: invoice.total - amountPaid > 0 ? '#F59E0B' : '#10B981' }}>
                  Rs {Math.max(0, invoice.total - amountPaid).toLocaleString('en-LK', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Record Payment Modal */}
    {paymentModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
        <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#111827' }}><DollarSign className="w-4 h-4" style={{ color: '#10B981' }} /> Record Payment</h2>
            <button onClick={() => setPaymentModal(false)} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" style={{ color: '#9ca3af' }} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Amount (Rs) *</label>
              <Input type="number" min="0" step="0.01"
                placeholder={`Max: ${(invoice.total - amountPaid).toFixed(2)}`}
                value={paymentForm.amount}
                onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
                className="text-gray-900" style={{ background: '#f9fafb', borderColor: '#e5e7eb' }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Payment Method</label>
              <select value={paymentForm.method} onChange={e => setPaymentForm(f => ({ ...f, method: e.target.value }))}
                className="text-gray-900"
                style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }}>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Note (optional)</label>
              <Input placeholder="e.g. First deposit, Receipt #123"
                value={paymentForm.note}
                onChange={e => setPaymentForm(f => ({ ...f, note: e.target.value }))}
                className="text-gray-900" style={{ background: '#f9fafb', borderColor: '#e5e7eb' }} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="outline" onClick={() => setPaymentModal(false)} className="text-sm" style={{ color: '#6b7280' }}>Cancel</Button>
            <Button onClick={recordPayment} disabled={recordingPayment} className="text-gray-900" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              <Check className="w-3.5 h-3.5" />{recordingPayment ? 'Saving...' : 'Record Payment'}
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Email Modal */}
    {emailModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
        <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#111827' }}><Mail className="w-4 h-4" style={{ color: '#3b82f6' }} /> Send Invoice via Email</h2>
            <button onClick={() => setEmailModal(false)} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" style={{ color: '#9ca3af' }} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>To *</label>
              <Input value={emailForm.to} onChange={e => setEmailForm(f => ({ ...f, to: e.target.value }))} placeholder="client@company.com" className="text-gray-900" style={{ background: '#ffffff', borderColor: '#e5e7eb' }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Subject</label>
              <Input value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} className="text-gray-900" style={{ background: '#ffffff', borderColor: '#e5e7eb' }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Personal message (optional)</label>
              <textarea value={emailForm.message} onChange={e => setEmailForm(f => ({ ...f, message: e.target.value }))} rows={3} placeholder="Hi, please find your invoice attached..." className="text-gray-900" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="outline" onClick={() => setEmailModal(false)} className="text-sm" style={{ color: '#6b7280' }}>Cancel</Button>
            <Button onClick={sendEmail} disabled={sendingEmail} className="text-gray-900" style={{ background: 'linear-gradient(135deg, #6B50EE, #3B82F6)' }}>
              <Send className="w-3.5 h-3.5" />{sendingEmail ? 'Sending...' : 'Send Invoice'}
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* PDF Preview Modal */}
    {showPreview && (
      <InvoicePreviewModal
        invoice={invoice}
        template={pdfTemplate}
        onClose={() => setShowPreview(false)}
        onTemplateChange={(t) => setPdfTemplate(t)}
        onDownload={() => { setShowPreview(false); downloadPDF() }}
      />
    )}
    </>
  )
}
