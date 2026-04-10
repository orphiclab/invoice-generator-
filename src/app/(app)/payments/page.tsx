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
  COMPLETED: { label: 'Paid', color: 'hsl(142 76% 46%)', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle2 },
  PENDING: { label: 'Pending', color: 'hsl(38 92% 50%)', bg: 'rgba(245,158,11,0.12)', icon: Clock },
  FAILED: { label: 'Failed', color: 'hsl(0 84% 60%)', bg: 'rgba(239,68,68,0.12)', icon: XCircle },
  REFUNDED: { label: 'Refunded', color: 'rgba(255,255,255,0.4)', bg: 'rgba(148,163,184,0.12)', icon: RefreshCw },
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
        <h1 className="text-2xl font-bold tracking-tight text-white">Payments</h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Stripe payment history across all invoices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-emerald rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-extrabold text-white">Rs {totalCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          <p className="text-xs mt-1 font-semibold text-white/70">Total Collected</p>
        </div>
        <div className="stat-amber rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Clock className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-extrabold text-white">{pending}</p>
          <p className="text-xs mt-1 font-semibold text-white/70">Pending</p>
        </div>
        <div className="stat-rose rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <XCircle className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-extrabold text-white">{failed}</p>
          <p className="text-xs mt-1 font-semibold text-white/70">Failed</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#7B61FF', borderTopColor: 'transparent' }} />
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl p-12 flex flex-col items-center text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <CreditCard className="w-10 h-10 mb-3 opacity-20" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <p className="text-sm font-medium text-white mb-1">No payments yet</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Payments will appear here after clients pay via Stripe</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#16191F', border: '1px solid rgba(255,255,255,0.07)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Date', 'Invoice', 'Client', 'Amount', 'Provider', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.PENDING
                const Icon = cfg.icon
                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-4 py-3.5 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-white">{p.invoice.invoiceNo}</td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.invoice.client.name}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-white">{fmt(p.amount, p.currency)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" style={{ color: '#7B61FF' }} />
                        <span className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.provider}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit" style={{ color: cfg.color, background: cfg.bg }}>
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
