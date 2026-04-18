'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Download, MessageCircle, Share2, Edit2, Check, Clock, Building2, Mail, Phone, MapPin, Copy, Send, X, DollarSign, AlertTriangle, Bell, Plus, CreditCard, ChevronDown, Eye, MessageSquare, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/StatusBadge'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'
const InvoicePreviewModal = dynamic(
  () => import('@/components/InvoicePreviewModal').then(m => m.InvoicePreviewModal),
  { ssr: false }
)
import type { TemplateId } from '@/components/InvoicePreviewModal'

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
  const [pdfTemplate, setPdfTemplate] = useState<TemplateId>('green')
  const [showTemplateMenu, setShowTemplateMenu] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  // WhatsApp modal
  const [whatsappModal, setWhatsappModal] = useState(false)
  const [waPhone, setWaPhone] = useState('')
  const [waCountryCode, setWaCountryCode] = useState('+91')
  const [waMessage, setWaMessage] = useState('')
  const [waMsgTemplate, setWaMsgTemplate] = useState<'friendly'|'formal'|'reminder'>('friendly')
  // Comments
  const [comments, setComments] = useState<{id:string;text:string;userName:string;createdAt:string}[]>([])
  const [commentText, setCommentText] = useState('')
  const [postingComment, setPostingComment] = useState(false)

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
    // Load comments
    fetch(`/api/invoices/${id}/comments`).then(r => r.json()).then(d => { if (Array.isArray(d)) setComments(d) })
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

  function buildWaMessage(template: 'friendly'|'formal'|'reminder', inv: Invoice) {
    const link = `${window.location.origin}/share/${inv.shareToken}`
    const due = new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    const sym = inv.currency?.symbol ?? 'Rs'
    const amt = `${sym} ${inv.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
    if (template === 'friendly') {
      return `Hi ${inv.client.name} 👋\n\nHope you're doing well! Here's your invoice *${inv.invoiceNo}* for *${amt}*.\n\n📅 Due Date: ${due}\n🔗 View Invoice: ${link}\n\nLet me know if you have any questions. Thanks! 🙏`
    } else if (template === 'formal') {
      return `Dear ${inv.client.name},\n\nPlease find invoice *${inv.invoiceNo}* for the amount of *${amt}*, due on ${due}.\n\nYou may view and pay the invoice here:\n${link}\n\nKindly ensure payment before the due date. Thank you for your business.\n\nRegards,\n${inv.user.name}`
    } else {
      return `Hi ${inv.client.name},\n\nThis is a friendly reminder that invoice *${inv.invoiceNo}* for *${amt}* is due on *${due}*.\n\n⚠️ Please make payment at your earliest convenience:\n${link}\n\nIf you've already paid, please disregard this message. Thank you!`
    }
  }

  function openWhatsappModal() {
    if (!invoice) return
    const rawPhone = invoice.client.phone?.replace(/\D/g, '') || ''
    // Auto-detect country code
    let cc = '+91', local = rawPhone
    if (rawPhone.startsWith('91') && rawPhone.length >= 12) { cc = '+91'; local = rawPhone.slice(2) }
    else if (rawPhone.startsWith('94') && rawPhone.length >= 11) { cc = '+94'; local = rawPhone.slice(2) }
    else if (rawPhone.startsWith('1')  && rawPhone.length >= 11) { cc = '+1';  local = rawPhone.slice(1) }
    setWaCountryCode(cc)
    setWaPhone(local)
    setWaMsgTemplate('friendly')
    setWaMessage(buildWaMessage('friendly', invoice))
    setWhatsappModal(true)
  }

  function sendViaWhatsApp() {
    const full = (waCountryCode + waPhone).replace(/\D/g, '')
    const msg = encodeURIComponent(waMessage)
    window.open(full ? `https://wa.me/${full}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank')
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
    if (pdfTemplate === 'midnight') {
      const { InvoicePDFMidnight } = await import('@/components/InvoicePDFMidnight')
      blob = await pdf(createElement(InvoicePDFMidnight, { invoice })).toBlob()
    } else if (pdfTemplate === 'ocean') {
      const { InvoicePDFOcean } = await import('@/components/InvoicePDFOcean')
      blob = await pdf(createElement(InvoicePDFOcean, { invoice })).toBlob()
    } else if (pdfTemplate === 'rose') {
      const { InvoicePDFRose } = await import('@/components/InvoicePDFRose')
      blob = await pdf(createElement(InvoicePDFRose, { invoice })).toBlob()
    } else if (pdfTemplate === 'classic') {
      const { InvoicePDFClassic } = await import('@/components/InvoicePDFClassic')
      blob = await pdf(createElement(InvoicePDFClassic, { invoice })).toBlob()
    } else if (pdfTemplate === 'sunset') {
      const { InvoicePDFSunset } = await import('@/components/InvoicePDFSunset')
      blob = await pdf(createElement(InvoicePDFSunset, { invoice })).toBlob()
    } else if (pdfTemplate === 'lavender') {
      const { InvoicePDFLavender } = await import('@/components/InvoicePDFLavender')
      blob = await pdf(createElement(InvoicePDFLavender, { invoice })).toBlob()
    } else if (pdfTemplate === 'emerald') {
      const { InvoicePDFEmerald } = await import('@/components/InvoicePDFEmerald')
      blob = await pdf(createElement(InvoicePDFEmerald, { invoice })).toBlob()
    } else if (pdfTemplate === 'carbon') {
      const { InvoicePDFCarbon } = await import('@/components/InvoicePDFCarbon')
      blob = await pdf(createElement(InvoicePDFCarbon, { invoice })).toBlob()
    } else if (pdfTemplate === 'ruby') {
      const { InvoicePDFRuby } = await import('@/components/InvoicePDFRuby')
      blob = await pdf(createElement(InvoicePDFRuby, { invoice })).toBlob()
    } else if (pdfTemplate === 'bauhaus') {
      const { InvoicePDFBauhaus } = await import('@/components/InvoicePDFBauhaus')
      blob = await pdf(createElement(InvoicePDFBauhaus, { invoice })).toBlob()
    } else if (pdfTemplate === 'studio') {
      const { InvoicePDFStudio } = await import('@/components/InvoicePDFStudio')
      blob = await pdf(createElement(InvoicePDFStudio, { invoice })).toBlob()
    } else {
      const { InvoicePDF } = await import('@/components/InvoicePDF')
      blob = await pdf(createElement(InvoicePDF, { invoice })).toBlob()
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/invoices">
            <button className="p-2 rounded-2xl hover:bg-slate-100 transition-colors" style={{ color: '#64748B' }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold font-mono truncate" style={{ color: '#1E293B' }}>{invoice.invoiceNo}</h1>
              <StatusBadge status={invoice.status} />
            </div>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
            <Clock className="w-3 h-3 inline mr-1" />Due {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        </div>
        {/* Actions — scrollable on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          <div className="w-28 sm:w-36 flex-shrink-0">
            <select
              value={invoice.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updatingStatus}
              className="w-full h-9 px-3 rounded-2xl text-xs font-semibold border outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#ffffff',
                borderColor: '#e5e7eb',
                color: {
                  DRAFT:   '#374151',
                  SENT:    '#1d4ed8',
                  PAID:    '#166534',
                  OVERDUE: '#991b1b',
                }[invoice.status] ?? '#374151',
              }}
            >
              {[
                { value: 'DRAFT',   label: 'Draft' },
                { value: 'SENT',    label: 'Sent' },
                { value: 'PAID',    label: 'Paid' },
                { value: 'OVERDUE', label: 'Overdue' },
              ].map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <button onClick={openWhatsappModal} title="Send via WhatsApp"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all hover:bg-green-500/10 flex-shrink-0 whitespace-nowrap"
            style={{ color: '#16a34a', border: '1px solid rgba(22,163,74,0.3)' }}>
            <MessageCircle className="w-3.5 h-3.5" /> <span className="hidden sm:inline">WhatsApp</span><span className="sm:hidden">WA</span>
          </button>
          <button onClick={copyShareLink} title="Copy share link" className="p-2 rounded-2xl hover:bg-gray-50 transition-colors flex-shrink-0" style={{ color: '#6b7280' }}>
            <Share2 className="w-4 h-4" />
          </button>
          {/* Preview button */}
          <button onClick={() => setShowPreview(true)} title="Preview invoice PDF"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all hover:bg-emerald-500/10 flex-shrink-0 whitespace-nowrap"
            style={{ color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Preview</span>
          </button>
          {/* Download with template picker */}
          <div className="flex items-center rounded-2xl overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(123,97,255,0.4)' }}>
            <button onClick={downloadPDF} title="Download PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all hover:bg-gray-50"
              style={{ color: '#a28ef9' }}>
              <Download className="w-3.5 h-3.5" />
              {{
                green: '🌿 Green',
                classic: '🌌 Classic',
                midnight: '🌙 Midnight',
                ocean: '🌊 Ocean',
                rose: '🌸 Rose',
                sunset: '🔥 Sunset',
                lavender: '💜 Lavender',
                emerald: '💎 Emerald',
                carbon: '⚡ Carbon',
                ruby: '❤️ Ruby',
                bauhaus: '🔷 Bauhaus',
                studio: '🎨 Studio',
              }[pdfTemplate]}
            </button>
            <button onClick={() => setShowTemplateMenu(p => !p)}
              className="px-1.5 py-1.5 border-l hover:bg-gray-50 transition-all"
              style={{ borderColor: 'rgba(123,97,255,0.4)', color: '#a28ef9' }}>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <button onClick={() => { setEmailForm(f => ({ ...f, to: invoice.client.email, subject: `Invoice ${invoice.invoiceNo}` })); setEmailModal(true) }}
            title="Send email" className="p-2 rounded-2xl hover:bg-blue-500/10 transition-colors flex-shrink-0" style={{ color: '#3b82f6' }}>
            <Mail className="w-4 h-4" />
          </button>
          <button onClick={duplicateInvoice} disabled={duplicating} title="Duplicate invoice" className="p-2 rounded-2xl hover:bg-gray-50 transition-colors flex-shrink-0" style={{ color: '#6b7280' }}>
            <Copy className="w-4 h-4" />
          </button>
          <Link href={`/invoices/${id}/edit`}>
            <button className="p-2 rounded-2xl hover:bg-gray-50 transition-colors flex-shrink-0" style={{ color: '#6b7280' }}><Edit2 className="w-4 h-4" /></button>
          </Link>
        </div>
        {/* Template dropdown — rendered OUTSIDE overflow container */}
        {showTemplateMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowTemplateMenu(false)} />
            <div className="absolute right-4 top-[110px] z-50 rounded-2xl shadow-2xl py-1" style={{ background: '#ffffff', border: '1px solid #e5e7eb', minWidth: 200, maxHeight: 420, overflowY: 'auto' }}>
              <p className="text-[10px] font-bold px-3 pt-2 pb-1 sticky top-0" style={{ color: '#9ca3af', background: '#ffffff' }}>Choose Template</p>
              {([
                { id: 'green',    label: '🌿 Green Modern'  },
                { id: 'classic',  label: '🌌 Classic Dark'  },
                { id: 'midnight', label: '🌙 Midnight Gold' },
                { id: 'ocean',    label: '🌊 Ocean Blue'    },
                { id: 'rose',     label: '🌸 Rose Studio'   },
                { id: 'sunset',   label: '🔥 Sunset Blaze'  },
                { id: 'lavender', label: '💜 Lavender Mist' },
                { id: 'emerald',  label: '💎 Emerald Exec'  },
                { id: 'carbon',   label: '⚡ Carbon Pro'    },
                { id: 'ruby',     label: '❤️ Ruby Red'      },
                { id: 'bauhaus',  label: '🔷 Bauhaus Bold'  },
                { id: 'studio',   label: '🎨 Studio Creative'},
              ] as const).map(t => (
                <button key={t.id} onClick={() => { setPdfTemplate(t.id); setShowTemplateMenu(false); }}
                  className="w-full text-left px-3 py-2.5 text-xs hover:bg-gray-50 transition-all flex items-center justify-between"
                  style={{ color: pdfTemplate === t.id ? '#a28ef9' : '#374151', fontWeight: pdfTemplate === t.id ? 600 : 400 }}>
                  {t.label}
                  {pdfTemplate === t.id && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Invoice Document */}
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#ffffff' }}>
        {/* Dark header band — matching the reference design */}
        <div className="px-4 sm:px-10 py-6 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, #1a2744 0%, #0f172a 100%)' }}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #a28ef9, #60A5FA)' }}>
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
            <div key={label} className={`px-3 sm:px-8 py-3 sm:py-4 ${i < 2 ? 'border-r' : ''}`} style={{ borderColor: '#e5e7eb' }}>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5 sm:mb-1" style={{ color: '#9ca3af' }}>{label}</p>
              <p className="text-xs sm:text-sm font-semibold font-mono" style={{ color: '#111827' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* From / To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-b" style={{ borderColor: '#e5e7eb' }}>
          <div className="px-4 sm:px-10 py-5 sm:py-7 border-b sm:border-b-0 sm:border-r" style={{ borderColor: '#e5e7eb' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4" style={{ color: '#9ca3af' }}>Invoice From</p>
            <p className="font-bold text-sm" style={{ color: '#111827' }}>{invoice.user.company || invoice.user.name}</p>
            {invoice.user.company && <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{invoice.user.name}</p>}
            {invoice.user.address && <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{invoice.user.address}</p>}
            {invoice.user.email && <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{invoice.user.email}</p>}
            {invoice.user.phone && <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{invoice.user.phone}</p>}
          </div>
          <div className="px-4 sm:px-10 py-5 sm:py-7">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4" style={{ color: '#9ca3af' }}>Invoice To</p>
            <p className="font-bold text-sm" style={{ color: '#111827' }}>{invoice.client.name}</p>
            {invoice.client.company && <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{invoice.client.company}</p>}
            {invoice.client.address && <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{invoice.client.address}</p>}
            <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{invoice.client.email}</p>
            {invoice.client.phone && <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{invoice.client.phone}</p>}
          </div>
        </div>

        {/* Items table */}
        <div className="px-4 sm:px-10 py-5 sm:py-8 overflow-x-auto">
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
        <div className="px-4 sm:px-10 pb-8 sm:pb-10 flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-8">
          {/* Notes & Bank Details */}
          <div className="flex-1 w-full space-y-4">
            {invoice.notes && (
              <div className="p-4 rounded-2xl border-l-4" style={{ background: '#f9fafb', borderLeftColor: '#6366f1' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>Notes & Payment Terms</p>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#6b7280' }}>{invoice.notes}</p>
              </div>
            )}
            {invoice.bankDetails && (
              <div className="p-4 rounded-2xl border-l-4" style={{ background: '#f9fafb', borderLeftColor: '#10B981' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>Bank Details</p>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#6b7280' }}>{invoice.bankDetails}</p>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="w-full sm:w-64 flex-shrink-0">
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
          <div className="mx-10 mb-8 flex items-center justify-center gap-2 py-3 rounded-2xl" style={{ background: 'rgba(34,197,94,0.08)', border: '2px solid rgba(34,197,94,0.3)' }}>
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
                <div key={p.id} className="flex items-center justify-between px-3 py-2.5 rounded-2xl" style={{ background: '#f9fafb' }}>
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
              className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl text-xs font-semibold transition-all disabled:opacity-40"
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
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl text-xs font-semibold transition-all disabled:opacity-40"
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

      {/* ── Comments ── */}
      <div className="mt-6 rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: '#111827' }}>
          <MessageSquare className="w-4 h-4" style={{ color: '#a28ef9' }} /> Internal Notes
          {comments.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(162,142,249,0.15)', color: '#a28ef9' }}>{comments.length}</span>}
        </h3>
        {/* Comment input */}
        <form onSubmit={async (e) => {
          e.preventDefault()
          if (!commentText.trim()) return
          setPostingComment(true)
          try {
            const res = await fetch(`/api/invoices/${id}/comments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: commentText }),
            })
            if (res.ok) {
              const c = await res.json()
              setComments(prev => [...prev, c])
              setCommentText('')
            }
          } finally { setPostingComment(false) }
        }} className="flex gap-2 mb-4">
          <input value={commentText} onChange={e => setCommentText(e.target.value)}
            placeholder="Add a note... (visible only to your team)"
            className="flex-1 px-3 py-2 rounded-2xl text-sm outline-none"
            style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }} />
          <button type="submit" disabled={postingComment || !commentText.trim()}
            className="px-4 py-2 rounded-2xl text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: '#a28ef9' }}>
            {postingComment ? '...' : 'Post'}
          </button>
        </form>
        {/* Comment list */}
        {comments.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: '#9ca3af' }}>No notes yet</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white" style={{ background: '#a28ef9' }}>
                  {c.userName?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: '#111827' }}>{c.userName}</span>
                    <span className="text-[10px]" style={{ color: '#9ca3af' }}>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: '#374151' }}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
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

    {/* ── WhatsApp Sender Modal ── */}
    {whatsappModal && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) setWhatsappModal(false) }}>
        <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden"
          style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
            style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'linear-gradient(135deg, #0d1117, #111827)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}>
                <MessageCircle className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Send via WhatsApp</p>
                <p className="text-[11px]" style={{ color: '#6b7280' }}>Opens WhatsApp with pre-filled message</p>
              </div>
            </div>
            <button onClick={() => setWhatsappModal(false)}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/10" style={{ color: '#6b7280' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            {/* Phone number */}
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: '#9ca3af' }}>WhatsApp Number</label>
              <div className="flex gap-2">
                <select value={waCountryCode} onChange={e => setWaCountryCode(e.target.value)}
                  className="h-10 px-2 rounded-2xl text-xs font-semibold outline-none"
                  style={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb', minWidth: 80 }}>
                  {['+91 🇮🇳','+94 🇱🇰','+1 🇺🇸','+44 🇬🇧','+971 🇦🇪','+60 🇲🇾','+65 🇸🇬','+61 🇦🇺','+92 🇵🇰','+880 🇧🇩'].map(c => {
                    const code = c.split(' ')[0]
                    return <option key={code} value={code}>{c}</option>
                  })}
                </select>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={waPhone}
                  onChange={e => setWaPhone(e.target.value.replace(/[^\d\s\-]/g, ''))}
                  className="flex-1 h-10 px-3 rounded-2xl text-sm outline-none"
                  style={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb' }}
                />
              </div>
              {!waPhone.trim() && (
                <p className="text-[10px] mt-1" style={{ color: '#f59e0b' }}>⚠️ No phone number — WhatsApp will open without a recipient</p>
              )}
            </div>

            {/* Message templates */}
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: '#9ca3af' }}>Message Template</label>
              <div className="grid grid-cols-3 gap-2">
                {([['friendly','😊 Friendly'],['formal','🤝 Formal'],['reminder','⚠️ Reminder']] as const).map(([id, label]) => (
                  <button key={id} onClick={() => { setWaMsgTemplate(id); setWaMessage(buildWaMessage(id, invoice)) }}
                    className="py-2 px-2 rounded-2xl text-[11px] font-semibold transition-all"
                    style={waMsgTemplate === id
                      ? { background: 'rgba(37,211,102,0.2)', border: '1px solid rgba(37,211,102,0.5)', color: '#25d366' }
                      : { background: '#1a2035', border: '1px solid rgba(255,255,255,0.06)', color: '#9ca3af' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold" style={{ color: '#9ca3af' }}>Message</label>
                <button onClick={() => setWaMessage(buildWaMessage(waMsgTemplate, invoice))}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: '#6b7280' }}>
                  <RefreshCw className="w-2.5 h-2.5" /> Reset
                </button>
              </div>
              <textarea
                value={waMessage}
                onChange={e => setWaMessage(e.target.value)}
                rows={7}
                className="w-full px-3 py-2.5 rounded-2xl text-sm resize-none outline-none leading-relaxed"
                style={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.08)', color: '#e5e7eb', fontFamily: 'inherit' }}
              />
              <p className="text-[10px] mt-1" style={{ color: '#4b5563' }}>{waMessage.length} chars · *text* = bold in WhatsApp</p>
            </div>

            {/* WhatsApp preview bubble */}
            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: '#9ca3af' }}>Preview</label>
              <div className="rounded-2xl p-3" style={{ background: '#0a1628' }}>
                <div className="inline-block max-w-[85%] px-3 py-2 rounded-2xl rounded-tl-sm text-sm leading-relaxed whitespace-pre-wrap break-words"
                  style={{ background: '#1f2b1f', color: '#e5e7eb', fontSize: 12.5 }}>
                  {waMessage || <span style={{ color: '#4b5563' }}>Your message will appear here…</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-5 py-4 border-t flex gap-3"
            style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#0d1117' }}>
            <button onClick={() => setWhatsappModal(false)}
              className="flex-1 h-10 rounded-2xl text-sm font-semibold transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>Cancel</button>
            <button onClick={sendViaWhatsApp}
              className="flex-1 h-10 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}>
              <MessageCircle className="w-4 h-4" /> Open in WhatsApp
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
