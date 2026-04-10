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
  DRAFT: { label: 'Draft', color: 'rgba(255,255,255,0.3)', bg: 'rgba(148,163,184,0.12)' },
  SENT: { label: 'Sent', color: 'hsl(199 89% 48%)', bg: 'rgba(56,189,248,0.12)' },
  ACCEPTED: { label: 'Accepted', color: 'hsl(142 76% 46%)', bg: 'rgba(34,197,94,0.12)' },
  REJECTED: { label: 'Rejected', color: 'hsl(0 84% 60%)', bg: 'rgba(239,68,68,0.12)' },
  CONVERTED: { label: 'Converted', color: '#7B61FF', bg: 'rgba(139,92,246,0.12)' },
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
        <h1 className="text-2xl font-bold tracking-tight text-white">Estimates</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Create quotes and convert them to invoices</p>
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
          { label: 'Total Value', value: `Rs ${total.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`, cls: 'stat-purple', icon: FileText },
          { label: 'Sent', value: String(sent), cls: 'stat-blue', icon: Send },
          { label: 'Accepted', value: String(accepted), cls: 'stat-emerald', icon: CheckCircle },
        ].map(({ label, value, cls, icon: Icon }) => (
          <div key={label} className={`${cls} rounded-2xl p-5 relative overflow-hidden`}>
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)' }} />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-extrabold text-white">{value}</p>
            <p className="text-xs mt-1 font-semibold text-white/70">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CONVERTED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
            style={filter === s
              ? { background: '#7C3AED', color: 'white', boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {s === 'ALL' ? 'All' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#7B61FF', borderTopColor: 'transparent' }} />
        </div>
      ) : estimates.length === 0 ? (
        <div className="rounded-2xl p-12 flex flex-col items-center text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <FileText className="w-10 h-10 mb-3 opacity-20" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <p className="text-sm font-medium text-white mb-1">No estimates yet</p>
          <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Create your first quote for a client</p>
          <Link href="/estimates/new">
            <Button className="gap-2 text-white text-xs h-8" style={{ background: 'linear-gradient(135deg, #6B50EE, #3B82F6)' }}>
              <Plus className="w-3 h-3" /> Create estimate
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#16191F', border: '1px solid rgba(255,255,255,0.07)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Estimate #', 'Client', 'Amount', 'Expires', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {estimates.map(est => (
                <tr key={est.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-4 py-3.5">
                    <Link href={`/estimates/${est.id}`} className="text-sm font-medium hover:text-purple-400 transition-colors text-white">{est.estimateNo}</Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-white">{est.client.name}</p>
                    {est.client.company && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{est.client.company}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-semibold text-white">
                      {est.currency?.symbol ?? 'Rs'}{est.total.toLocaleString('en-LK', { maximumFractionDigits: 0 })}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm" style={{ color: new Date(est.expiryDate) < new Date() ? 'hsl(0 84% 60%)' : 'rgba(255,255,255,0.45)' }}>
                      {new Date(est.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-4 py-3.5"><EstimateBadge status={est.status} /></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      {est.status === 'DRAFT' && (
                        <button onClick={() => updateStatus(est.id, 'SENT')} title="Mark as Sent" className="p-1.5 rounded-lg hover:bg-blue-500/20 transition-colors">
                          <Send className="w-3.5 h-3.5" style={{ color: 'hsl(199 89% 48%)' }} />
                        </button>
                      )}
                      {est.status === 'SENT' && (
                        <>
                          <button onClick={() => updateStatus(est.id, 'ACCEPTED')} title="Accept" className="p-1.5 rounded-lg hover:bg-green-500/20 transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" style={{ color: 'hsl(142 76% 46%)' }} />
                          </button>
                          <button onClick={() => updateStatus(est.id, 'REJECTED')} title="Reject" className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors">
                            <XCircle className="w-3.5 h-3.5" style={{ color: 'hsl(0 84% 60%)' }} />
                          </button>
                        </>
                      )}
                      <Link href={`/estimates/${est.id}`} className="p-1.5 rounded-lg hover:bg-purple-500/20 transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" style={{ color: '#7B61FF' }} />
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
