'use client'

import { useEffect, useState } from 'react'
import { CreditCard, CheckCircle2, XCircle, Clock, RefreshCw, TrendingUp } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  provider: string
  providerSessionId?: string
  createdAt: string
  invoice: { invoiceNo: string; client: { name: string } }
}

const STATUS_CONFIG = {
  COMPLETED: { label: 'Paid', color: '#16a34a', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle2 },
  PENDING: { label: 'Pending', color: 'hsl(38 92% 50%)', bg: 'rgba(245,158,11,0.12)', icon: Clock },
  FAILED: { label: 'Failed', color: 'hsl(0 84% 60%)', bg: 'rgba(239,68,68,0.12)', icon: XCircle },
  REFUNDED: { label: 'Refunded', color: '#6b7280', bg: 'rgba(148,163,184,0.12)', icon: RefreshCw },
}

function fmt(amount: number, currency: string) {
  const sym = currency === 'inr' ? 'Rs' : currency === 'usd' ? '$' : currency === 'eur' ? '€' : currency === 'lkr' ? 'Rs ' : currency.toUpperCase() + ' '
  return `${sym}${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/payments').then(r => r.json()).then(d => {
      setPayments(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }, [])

  const totalCollected = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0)
  const pending = payments.filter(p => p.status === 'PENDING').length
  const failed = payments.filter(p => p.status === 'FAILED').length

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>Payments</h1>
        <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Stripe payment history across all invoices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #a4f5a6 0%, #6ee7b7 100%)', boxShadow: '0 8px 24px rgba(164,245,166,0.35)' }}>
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.3)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: '#166534' }} />
          </div>
          <p className="text-xl font-extrabold" style={{ color: '#166534' }}>Rs {totalCollected.toLocaleString('en-LK', { maximumFractionDigits: 0 })}</p>
          <p className="text-xs mt-1 font-semibold" style={{ color: '#166534', opacity: 0.75 }}>Total Collected</p>
        </div>
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fcd34d 0%, #fde68a 100%)', boxShadow: '0 8px 24px rgba(252,211,77,0.3)' }}>
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.3)' }}>
            <Clock className="w-5 h-5" style={{ color: '#92400e' }} />
          </div>
          <p className="text-xl font-extrabold" style={{ color: '#92400e' }}>{pending}</p>
          <p className="text-xs mt-1 font-semibold" style={{ color: '#92400e', opacity: 0.75 }}>Pending</p>
        </div>
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f87171 0%, #fda4af 100%)', boxShadow: '0 8px 24px rgba(248,113,113,0.3)' }}>
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <XCircle className="w-5 h-5 text-white" />
          </div>
          <p className="text-xl font-extrabold text-white">{failed}</p>
          <p className="text-xs mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>Failed</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 flex flex-col items-center text-center" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f9fafb' }}>
            <CreditCard className="w-7 h-7" style={{ color: '#d1d5db' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#374151' }}>No payments yet</p>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Payments appear here after clients pay via Stripe</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                {['Date', 'Invoice', 'Client', 'Amount', 'Provider', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => {
                const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.PENDING
                const Icon = cfg.icon
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: i < payments.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                    <td className="px-5 py-3.5 text-xs" style={{ color: '#6b7280' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold font-mono" style={{ color: '#a28ef9' }}>{p.invoice.invoiceNo}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: '#374151' }}>{p.invoice.client.name}</td>
                    <td className="px-5 py-3.5 text-xs font-bold" style={{ color: '#111827' }}>{fmt(p.amount, p.currency)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" style={{ color: '#a28ef9' }} />
                        <span className="text-xs capitalize" style={{ color: '#6b7280' }}>{p.provider}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit" style={{ color: cfg.color, background: cfg.bg }}>
                        <Icon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
