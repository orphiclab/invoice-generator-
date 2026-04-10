'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Download, MessageCircle, Share2, Edit2, Check, Clock, Building2, Mail, Phone, MapPin, Copy, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/StatusBadge'
import { Input } from '@/components/ui/input'

interface InvoiceItem { description: string; quantity: number; unitPrice: number; total: number }
interface Invoice {
  id: string; invoiceNo: string; status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
  total: number; subtotal: number; tax: number; discount: number
  dueDate: string; issueDate: string; notes?: string; shareToken?: string
  client: { name: string; email: string; phone?: string; company?: string; address?: string }
  user: { name: string; email: string; company?: string; phone?: string; address?: string }
  items: InvoiceItem[]
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

  useEffect(() => {
    fetch(`/api/invoices/${id}`).then((r) => r.json()).then((d) => {
      setInvoice(d)
      setLoading(false)
    })
  }, [id])

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
    const { InvoicePDF } = await import('@/components/InvoicePDF')
    const { createElement } = await import('react')
    const blob = await pdf(createElement(InvoicePDF, { invoice })).toBlob()
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

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: '#7B61FF', borderTopColor: 'transparent' }} />
    </div>
  )
  if (!invoice) return <div className="p-8 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>Invoice not found</div>

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
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
            <Clock className="w-3 h-3 inline mr-1" />Due {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="w-36">
            <Select value={invoice.status} onValueChange={updateStatus} disabled={updatingStatus}>
              <SelectTrigger className="h-8 text-xs text-white" style={{ background: '#16191F', borderColor: 'rgba(255,255,255,0.1)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: '#16191F', borderColor: 'rgba(255,255,255,0.1)' }}>
                {['DRAFT', 'SENT', 'PAID', 'OVERDUE'].map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button onClick={shareWhatsApp} title="Send via WhatsApp" className="p-2 rounded-xl hover:bg-green-500/10 transition-colors" style={{ color: 'hsl(142 76% 46%)' }}>
            <MessageCircle className="w-4 h-4" />
          </button>
          <button onClick={copyShareLink} title="Copy share link" className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={downloadPDF} title="Download PDF" className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: '#7B61FF' }}>
            <Download className="w-4 h-4" />
          </button>
          <button onClick={() => { setEmailForm(f => ({ ...f, to: invoice.client.email, subject: `Invoice ${invoice.invoiceNo}` })); setEmailModal(true) }}
            title="Send email" className="p-2 rounded-xl hover:bg-blue-500/10 transition-colors" style={{ color: '#60A5FA' }}>
            <Mail className="w-4 h-4" />
          </button>
          <button onClick={duplicateInvoice} disabled={duplicating} title="Duplicate invoice" className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Copy className="w-4 h-4" />
          </button>
          <Link href={`/invoices/${id}/edit`}>
            <button className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}><Edit2 className="w-4 h-4" /></button>
          </Link>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#ffffff' }}>
        {/* Dark header band — matching the reference design */}
        <div className="px-10 py-8 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1a2744 0%, #0f172a 100%)' }}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7B61FF, #60A5FA)' }}>
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-lg leading-tight">{invoice.user.company || invoice.user.name}</p>
                {invoice.user.company && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{invoice.user.name}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {invoice.user.email && (
                <p className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Mail className="w-3 h-3" />{invoice.user.email}
                </p>
              )}
              {invoice.user.phone && (
                <p className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Phone className="w-3 h-3" />{invoice.user.phone}
                </p>
              )}
              {invoice.user.address && (
                <p className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <MapPin className="w-3 h-3" />{invoice.user.address}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-1" style={{ color: '#9B8AFF' }}>Invoice</p>
            <p className="text-3xl font-bold text-white font-mono tracking-tight">{invoice.invoiceNo}</p>
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
            <Check className="w-5 h-5" style={{ color: 'hsl(142 76% 46%)' }} />
            <span className="font-bold text-lg tracking-widest uppercase" style={{ color: 'hsl(142 76% 46%)' }}>Paid</span>
          </div>
        )}
      </div>
    </div>

    {/* Email Modal */}
    {emailModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
        <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: '#16191F', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2"><Mail className="w-4 h-4" style={{ color: '#60A5FA' }} /> Send Invoice via Email</h2>
            <button onClick={() => setEmailModal(false)} className="p-1 rounded hover:bg-white/10"><X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>To *</label>
              <Input value={emailForm.to} onChange={e => setEmailForm(f => ({ ...f, to: e.target.value }))} placeholder="client@company.com" className="h-9 text-sm text-white" style={{ background: '#16191F', borderColor: 'rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Subject</label>
              <Input value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} className="h-9 text-sm text-white" style={{ background: '#16191F', borderColor: 'rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Personal message (optional)</label>
              <textarea value={emailForm.message} onChange={e => setEmailForm(f => ({ ...f, message: e.target.value }))} rows={3} placeholder="Hi, please find your invoice attached..." className="w-full rounded-xl px-3 py-2 text-sm text-white resize-none outline-none placeholder:text-gray-600" style={{ background: '#16191F', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="outline" onClick={() => setEmailModal(false)} className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Cancel</Button>
            <Button onClick={sendEmail} disabled={sendingEmail} className="gap-2 text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #6B50EE, #3B82F6)' }}>
              <Send className="w-3.5 h-3.5" />{sendingEmail ? 'Sending...' : 'Send Invoice'}
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
