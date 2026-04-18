'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Zap, Download, MessageCircle, CreditCard, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'
import { toast } from 'sonner'

interface InvoiceItem { description: string; quantity: number; unitPrice: number; total: number }
interface Invoice {
  id: string
  invoiceNo: string; status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
  total: number; subtotal: number; tax: number; taxRate: number; discount: number
  dueDate: string; issueDate: string; notes?: string
  client: { name: string; email: string; phone?: string; company?: string; address?: string }
  user: { name: string; email: string; company?: string; phone?: string; address?: string }
  items: InvoiceItem[]
  currency?: { symbol: string; code: string }
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const searchParams = useSearchParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  // Payment state from URL params
  const paymentStatus = searchParams.get('payment')

  useEffect(() => {
    fetch(`/api/invoices/share/${token}`)
      .then((r) => r.json())
      .then((d) => { setInvoice(d.error ? null : d); setLoading(false) })
  }, [token])

  useEffect(() => {
    if (paymentStatus === 'success') toast.success('Payment successful! Invoice has been marked as paid.')
    if (paymentStatus === 'cancelled') toast.error('Payment was cancelled.')
  }, [paymentStatus])

  async function handlePay() {
    if (!invoice) return
    setPaying(true)
    try {
      const res = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to initiate payment'); return }
      window.location.href = data.url
    } catch {
      toast.error('Something went wrong')
      setPaying(false)
    }
  }

  async function downloadPDF() {
    const { pdf } = await import('@react-pdf/renderer')
    const { InvoicePDF } = await import('@/components/InvoicePDF')
    const { createElement } = await import('react')
    const blob = await pdf(createElement(InvoicePDF, { invoice: invoice! })).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${invoice?.invoiceNo}.pdf`; a.click()
    URL.revokeObjectURL(url)
  }

  function whatsapp() {
    if (!invoice) return
    const sym = invoice.currency?.symbol ?? '₹'
    const msg = encodeURIComponent(`Hello, please find invoice ${invoice.invoiceNo} for ${sym}${invoice.total.toLocaleString()}. Due: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}.`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(222 47% 6%)' }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'hsl(262 83% 68%)', borderTopColor: 'transparent' }} />
    </div>
  )

  if (!invoice) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(222 47% 6%)' }}>
      <div className="text-center">
        <p className="text-2xl font-bold text-white mb-2">Invoice not found</p>
        <p style={{ color: 'hsl(215 20% 55%)' }}>This link may be invalid or expired.</p>
      </div>
    </div>
  )

  const sym = invoice.currency?.symbol ?? '₹'
  const taxAmt = invoice.subtotal * (invoice.taxRate ?? invoice.tax) / 100
  const discountAmt = invoice.discount

  const isPaid = invoice.status === 'PAID'
  const canPay = !isPaid && invoice.status !== 'DRAFT'

  return (
    <div className="min-h-screen" style={{ background: 'hsl(222 47% 6%)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'hsl(222 30% 14%)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(262 83% 68%), hsl(220 90% 62%))' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">InvoiceFlow</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={whatsapp} className="gap-2 text-xs border-border" style={{ color: 'hsl(142 76% 46%)' }}>
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </Button>
          <Button size="sm" onClick={downloadPDF} className="gap-2 text-xs text-white" style={{ background: 'hsl(222 30% 18%)' }}>
            <Download className="w-3.5 h-3.5" /> Download PDF
          </Button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        {/* Pay Now Banner */}
        {isPaid ? (
          <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: 'hsl(142 76% 46%)' }} />
            <div>
              <p className="font-semibold text-white">Payment Received</p>
              <p className="text-sm" style={{ color: 'hsl(215 20% 60%)' }}>This invoice has been paid in full. Thank you!</p>
            </div>
            <span className="ml-auto text-lg font-bold" style={{ color: 'hsl(142 76% 46%)' }}>{sym}{invoice.total.toLocaleString()}</span>
          </div>
        ) : canPay ? (
          <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
            <Clock className="w-6 h-6 flex-shrink-0" style={{ color: 'hsl(262 83% 68%)' }} />
            <div>
              <p className="font-semibold text-white">Payment Due</p>
              <p className="text-sm" style={{ color: 'hsl(215 20% 60%)' }}>Due {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <Button
              onClick={handlePay}
              disabled={paying}
              className="ml-auto gap-2 font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, hsl(262 83% 62%), hsl(220 90% 58%))' }}
            >
              <CreditCard className="w-4 h-4" />
              {paying ? 'Redirecting...' : `Pay ${sym}${invoice.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            </Button>
          </div>
        ) : null}

        {/* Invoice Card */}
        <div className="glass rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <p className="text-2xl font-bold text-white">{invoice.user.company || invoice.user.name}</p>
              <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 55%)' }}>{invoice.user.email}</p>
              {invoice.user.phone && <p className="text-sm" style={{ color: 'hsl(215 20% 55%)' }}>{invoice.user.phone}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'hsl(262 83% 68%)' }}>Invoice</p>
              <p className="text-2xl font-bold text-white font-mono">{invoice.invoiceNo}</p>
              <div className="mt-2"><StatusBadge status={invoice.status} /></div>
            </div>
          </div>

          {/* From/To */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(215 20% 45%)' }}>From</p>
              <p className="text-sm font-semibold text-white">{invoice.user.name}</p>
              {invoice.user.address && <p className="text-xs" style={{ color: 'hsl(215 20% 55%)' }}>{invoice.user.address}</p>}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(215 20% 45%)' }}>Bill To</p>
              <p className="text-sm font-semibold text-white">{invoice.client.name}</p>
              {invoice.client.company && <p className="text-xs" style={{ color: 'hsl(262 83% 70%)' }}>{invoice.client.company}</p>}
              <p className="text-xs" style={{ color: 'hsl(215 20% 55%)' }}>{invoice.client.email}</p>
              {invoice.client.phone && <p className="text-xs" style={{ color: 'hsl(215 20% 55%)' }}>{invoice.client.phone}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="flex gap-8 mb-8 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div><p className="text-xs" style={{ color: 'hsl(215 20% 45%)' }}>Issue Date</p><p className="text-sm font-medium text-white mt-1">{new Date(invoice.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
            <div><p className="text-xs" style={{ color: 'hsl(215 20% 45%)' }}>Due Date</p><p className="text-sm font-medium text-white mt-1">{new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
          </div>

          {/* Items */}
          <table className="w-full mb-6">
            <thead><tr className="border-b" style={{ borderColor: 'hsl(222 30% 18%)' }}>
              {['Description', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
                <th key={h} className={`py-3 text-xs font-semibold uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-right'}`} style={{ color: 'hsl(215 20% 45%)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y" style={{ borderColor: 'hsl(222 30% 13%)' }}>
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 text-sm text-white">{item.description}</td>
                  <td className="py-3 text-sm text-right" style={{ color: 'hsl(215 20% 55%)' }}>{item.quantity}</td>
                  <td className="py-3 text-sm text-right" style={{ color: 'hsl(215 20% 55%)' }}>{sym}{item.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-sm font-medium text-white text-right">{sym}{item.total.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-56 space-y-2">
              <div className="flex justify-between text-sm" style={{ color: 'hsl(215 20% 55%)' }}><span>Subtotal</span><span className="text-white">{sym}{invoice.subtotal.toLocaleString('en-IN')}</span></div>
              {taxAmt > 0 && <div className="flex justify-between text-sm" style={{ color: 'hsl(215 20% 55%)' }}><span>Tax ({invoice.taxRate ?? invoice.tax}%)</span><span className="text-white">{sym}{taxAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></div>}
              {discountAmt > 0 && <div className="flex justify-between text-sm" style={{ color: 'hsl(215 20% 55%)' }}><span>Discount</span><span style={{ color: 'hsl(142 76% 46%)' }}>-{sym}{discountAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></div>}
              <div className="pt-2 border-t flex justify-between" style={{ borderColor: 'hsl(222 30% 20%)' }}>
                <span className="font-bold text-white">Total</span>
                <span className="text-xl font-bold gradient-text">{sym}{invoice.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="p-4 rounded-2xl border" style={{ borderColor: 'hsl(222 30% 18%)', background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(215 20% 45%)' }}>Notes</p>
              <p className="text-sm" style={{ color: 'hsl(215 20% 65%)' }}>{invoice.notes}</p>
            </div>
          )}

          {/* Stripe badge */}
          {canPay && !isPaid && (
            <div className="mt-6 flex items-center justify-center gap-2 pt-4 border-t" style={{ borderColor: 'hsl(222 30% 14%)' }}>
              <CreditCard className="w-3.5 h-3.5" style={{ color: 'hsl(215 20% 40%)' }} />
              <p className="text-xs" style={{ color: 'hsl(215 20% 40%)' }}>Secured by Stripe · SSL encrypted · All major cards accepted</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
