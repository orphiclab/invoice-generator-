'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FileText, CheckCircle, Clock, Zap } from 'lucide-react'

interface Invoice {
  id: string; invoiceNo: string; status: string; total: number; dueDate: string; issueDate: string
  currency?: { symbol: string }
}
interface Estimate {
  id: string; estimateNo: string; status: string; total: number; expiryDate: string
}
interface PortalData {
  client: { name: string; company?: string; email: string }
  invoices: Invoice[]
  estimates: Estimate[]
}

const statusColor: Record<string, string> = {
  DRAFT: 'hsl(215 20% 45%)', SENT: 'hsl(199 89% 48%)', PAID: 'hsl(142 76% 46%)',
  OVERDUE: 'hsl(0 84% 60%)', ACCEPTED: 'hsl(142 76% 46%)', REJECTED: 'hsl(0 84% 60%)',
  CONVERTED: 'hsl(262 83% 68%)',
}

export default function ClientPortalPage() {
  const { token } = useParams()
  const [data, setData] = useState<PortalData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'invoices' | 'estimates'>('invoices')

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); setLoading(false) })
      .catch(() => { setError('Failed to load'); setLoading(false) })
  }, [token])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(222 47% 6%)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(262 83% 68%)', borderTopColor: 'transparent' }} />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(222 47% 6%)' }}>
      <div className="text-center">
        <p className="text-white text-lg font-semibold mb-2">Unable to load portal</p>
        <p className="text-sm" style={{ color: 'hsl(215 20% 55%)' }}>{error}</p>
      </div>
    </div>
  )

  if (!data) return null
  const paid = data.invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
  const outstanding = data.invoices.filter(i => ['SENT', 'OVERDUE'].includes(i.status)).reduce((s, i) => s + i.total, 0)

  const tabStyle = (active: boolean) => ({
    padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer',
    background: active ? 'rgba(139,92,246,0.2)' : 'transparent',
    color: active ? 'hsl(262 83% 78%)' : 'hsl(215 20% 55%)',
  })

  return (
    <div className="min-h-screen" style={{ background: 'hsl(222 47% 6%)', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center gap-3" style={{ borderColor: 'hsl(222 30% 14%)', background: 'hsl(222 40% 7%)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(262 83% 68%), hsl(220 90% 62%))' }}>
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white">InvoiceFlow</span>
        <span className="text-sm ml-auto" style={{ color: 'hsl(215 20% 45%)' }}>Client Portal</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Welcome */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <p className="text-sm font-medium mb-0.5" style={{ color: 'hsl(262 83% 72%)' }}>Welcome back</p>
          <h1 className="text-2xl font-bold text-white">{data.client.name}</h1>
          {data.client.company && <p className="text-sm mt-0.5" style={{ color: 'hsl(215 20% 55%)' }}>{data.client.company}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Invoices', value: data.invoices.length, icon: FileText, color: 'hsl(262 83% 68%)' },
            { label: 'Total Paid', value: `₹${paid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: CheckCircle, color: 'hsl(142 76% 46%)' },
            { label: 'Outstanding', value: `₹${outstanding.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: Clock, color: 'hsl(38 92% 50%)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="p-2 rounded-xl w-fit mb-3" style={{ background: `${color}20` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs mt-1" style={{ color: 'hsl(215 20% 55%)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <button style={tabStyle(tab === 'invoices')} onClick={() => setTab('invoices')}>Invoices ({data.invoices.length})</button>
          <button style={tabStyle(tab === 'estimates')} onClick={() => setTab('estimates')}>Estimates ({data.estimates.length})</button>
        </div>

        {/* Invoice List */}
        {tab === 'invoices' && (
          <div className="space-y-2">
            {data.invoices.length === 0 ? (
              <div className="rounded-2xl p-10 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm" style={{ color: 'hsl(215 20% 55%)' }}>No invoices yet</p>
              </div>
            ) : data.invoices.map(inv => (
              <div key={inv.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="p-2.5 rounded-xl" style={{ background: `${statusColor[inv.status]}20` }}>
                  <FileText className="w-4 h-4" style={{ color: statusColor[inv.status] }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{inv.invoiceNo}</p>
                  <p className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>
                    Issued {new Date(inv.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · Due {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <p className="text-base font-bold text-white">{inv.currency?.symbol ?? '₹'}{inv.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: statusColor[inv.status], background: `${statusColor[inv.status]}18` }}>
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Estimate List */}
        {tab === 'estimates' && (
          <div className="space-y-2">
            {data.estimates.length === 0 ? (
              <div className="rounded-2xl p-10 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm" style={{ color: 'hsl(215 20% 55%)' }}>No estimates yet</p>
              </div>
            ) : data.estimates.map(est => (
              <div key={est.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{est.estimateNo}</p>
                  <p className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>Expires {new Date(est.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <p className="text-base font-bold text-white">₹{est.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: statusColor[est.status] ?? 'hsl(215 20% 45%)', background: `${statusColor[est.status] ?? 'hsl(215 20% 45%)'}18` }}>
                  {est.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
