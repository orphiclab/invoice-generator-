'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, CheckCircle, XCircle, Send, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Estimate {
  id: string
  estimateNo: string
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED'
  total: number
  expiryDate: string
  client: { id: string; name: string; company?: string }
  currency?: { code: string; symbol: string }
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: '#9ca3af', bg: 'rgba(148,163,184,0.12)' },
  SENT: { label: 'Sent', color: 'hsl(199 89% 48%)', bg: 'rgba(56,189,248,0.12)' },
  ACCEPTED: { label: 'Accepted', color: '#16a34a', bg: 'rgba(34,197,94,0.12)' },
  REJECTED: { label: 'Rejected', color: 'hsl(0 84% 60%)', bg: 'rgba(239,68,68,0.12)' },
  CONVERTED: { label: 'Converted', color: '#a28ef9', bg: 'rgba(139,92,246,0.12)' },
}

function EstimateBadge({ status }: { status: Estimate['status'] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  )
}

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  async function fetchEstimates() {
    const params = filter !== 'ALL' ? `?status=${filter}` : ''
    const data = await fetch(`/api/estimates${params}`).then(r => r.json())
    setEstimates(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchEstimates() }, [filter])

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/estimates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(`Marked as ${status.toLowerCase()}`)
      fetchEstimates()
    } else {
      toast.error('Failed to update')
    }
  }

  const total = estimates.reduce((s, e) => s + e.total, 0)
  const accepted = estimates.filter(e => e.status === 'ACCEPTED').length
  const sent = estimates.filter(e => e.status === 'SENT').length

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>Estimates</h1>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Create quotes and convert them to invoices</p>
        </div>
        <Link href="/estimates/new">
          <button className="btn-brand h-9 px-5 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Estimate
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Value', value: `Rs ${total.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`, grad: 'linear-gradient(135deg, #a28ef9 0%, #7c5cfc 100%)', shadow: 'rgba(162,142,249,0.3)', icon: FileText, dark: false },
          { label: 'Sent', value: String(sent), grad: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)', shadow: 'rgba(96,165,250,0.3)', icon: Send, dark: true },
          { label: 'Accepted', value: String(accepted), grad: 'linear-gradient(135deg, #a4f5a6 0%, #6ee7b7 100%)', shadow: 'rgba(164,245,166,0.35)', icon: CheckCircle, dark: true },
        ].map(({ label, value, grad, shadow, icon: Icon, dark }) => (
          <div key={label} className="rounded-2xl p-5 relative overflow-hidden" style={{ background: grad, boxShadow: `0 8px 24px ${shadow}` }}>
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.25)' }}>
              <Icon className="w-5 h-5" style={{ color: dark ? '#166534' : 'white' }} />
            </div>
            <p className="text-xl font-extrabold" style={{ color: dark ? '#166534' : 'white' }}>{value}</p>
            <p className="text-xs mt-1 font-semibold" style={{ color: dark ? 'rgba(22,101,52,0.75)' : 'rgba(255,255,255,0.8)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="pill-tab-bar">
        {['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CONVERTED'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`pill-tab${filter === s ? ' active' : ''}`}>
            {s === 'ALL' ? 'All' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
        </div>
      ) : estimates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 flex flex-col items-center text-center" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f9fafb' }}>
            <FileText className="w-7 h-7" style={{ color: '#d1d5db' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#374151' }}>No estimates yet</p>
          <p className="text-xs mt-1 mb-4" style={{ color: '#9ca3af' }}>Create your first quote for a client</p>
          <Link href="/estimates/new">
            <button className="btn-brand h-8 px-4 text-xs flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Create estimate
            </button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                {['Estimate #', 'Client', 'Amount', 'Expires', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {estimates.map((est, i) => (
                <tr key={est.id} className="hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: i < estimates.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <td className="px-5 py-3.5">
                    <Link href={`/estimates/${est.id}`} className="text-xs font-bold font-mono hover:opacity-75" style={{ color: '#a28ef9' }}>{est.estimateNo}</Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-xs font-semibold" style={{ color: '#111827' }}>{est.client.name}</p>
                    {est.client.company && <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>{est.client.company}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-bold" style={{ color: '#111827' }}>
                    {est.currency?.symbol ?? 'Rs'}{est.total.toLocaleString('en-LK', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs" style={{ color: new Date(est.expiryDate) < new Date() ? '#ef4444' : '#6b7280' }}>
                      {new Date(est.expiryDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-5 py-3.5"><EstimateBadge status={est.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      {est.status === 'DRAFT' && (
                        <button onClick={() => updateStatus(est.id, 'SENT')} title="Mark as Sent" className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                          <Send className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
                        </button>
                      )}
                      {est.status === 'SENT' && (
                        <>
                          <button onClick={() => updateStatus(est.id, 'ACCEPTED')} title="Accept" className="p-1.5 rounded-lg hover:bg-green-50 transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
                          </button>
                          <button onClick={() => updateStatus(est.id, 'REJECTED')} title="Reject" className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                            <XCircle className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                          </button>
                        </>
                      )}
                      <Link href={`/estimates/${est.id}`} className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" style={{ color: '#a28ef9' }} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
