'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, DollarSign, RefreshCw, CalendarDays, ArrowUpRight } from 'lucide-react'

interface ForecastMonth {
  month: string
  predicted: number
  outstanding: number
  recurring: number
}

interface ForecastData {
  forecast: ForecastMonth[]
  summary: {
    totalOutstanding: number
    monthlyRecurring: number
    avgMonthlyRevenue: number
    upcomingInvoices: { invoiceNo: string; client: string; total: number; dueDate: string; status: string }[]
  }
}

export default function ForecastPage() {
  const [data, setData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/forecast').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
    </div>
  )

  if (!data) return null

  const maxPredicted = Math.max(...data.forecast.map(f => f.predicted), 1)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard">
          <button className="p-2 rounded-2xl hover:bg-gray-50 transition-colors" style={{ color: '#6b7280' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary, #111827)' }}>Cash Flow Forecast</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>6-month income prediction based on outstanding & recurring invoices</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Outstanding', value: data.summary.totalOutstanding, icon: DollarSign, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Monthly Recurring', value: data.summary.monthlyRecurring, icon: RefreshCw, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Avg Monthly Revenue', value: data.summary.avgMonthlyRevenue, icon: TrendingUp, color: '#a28ef9', bg: 'rgba(162,142,249,0.1)' },
        ].map(card => (
          <div key={card.label} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: card.bg }}>
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>{card.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: card.color }}>
              Rs {card.value.toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      {/* Forecast chart */}
      <div className="glass rounded-2xl p-6 mb-8">
        <h2 className="text-base font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary, #111827)' }}>
          <CalendarDays className="w-4 h-4" style={{ color: '#a28ef9' }} /> 6-Month Forecast
        </h2>
        <div className="space-y-4">
          {data.forecast.map((month, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-20 text-xs font-semibold flex-shrink-0" style={{ color: '#6b7280' }}>{month.month}</div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-8 rounded-lg overflow-hidden flex" style={{ background: 'rgba(0,0,0,0.04)' }}>
                  {month.outstanding > 0 && (
                    <div className="h-full rounded-l-lg transition-all duration-500" title={`Outstanding: Rs ${month.outstanding.toLocaleString()}`}
                      style={{ width: `${(month.outstanding / maxPredicted) * 100}%`, background: '#F59E0B' }} />
                  )}
                  {month.recurring > 0 && (
                    <div className="h-full transition-all duration-500" title={`Recurring: Rs ${month.recurring.toLocaleString()}`}
                      style={{ width: `${(month.recurring / maxPredicted) * 100}%`, background: '#10B981' }} />
                  )}
                  {month.predicted - month.outstanding - month.recurring > 0 && (
                    <div className="h-full transition-all duration-500" title="Estimated"
                      style={{ width: `${((month.predicted - month.outstanding - month.recurring) / maxPredicted) * 100}%`, background: '#a28ef9', opacity: 0.4 }} />
                  )}
                </div>
                <span className="text-sm font-bold w-28 text-right flex-shrink-0" style={{ color: 'var(--text-primary, #111827)' }}>
                  Rs {month.predicted.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 mt-6 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
          {[
            { label: 'Outstanding', color: '#F59E0B' },
            { label: 'Recurring', color: '#10B981' },
            { label: 'Estimated', color: '#a28ef9' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2 text-xs" style={{ color: '#6b7280' }}>
              <span className="w-3 h-3 rounded" style={{ background: l.color, opacity: l.label === 'Estimated' ? 0.4 : 1 }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming invoices */}
      {data.summary.upcomingInvoices.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary, #111827)' }}>
            <ArrowUpRight className="w-4 h-4" style={{ color: '#F59E0B' }} /> Upcoming Expected Payments
          </h2>
          <div className="space-y-2">
            {data.summary.upcomingInvoices.map(inv => (
              <div key={inv.invoiceNo} className="flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: 'rgba(0,0,0,0.02)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary, #111827)' }}>{inv.invoiceNo} · {inv.client}</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>
                    Due {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {inv.status === 'OVERDUE' && <span style={{ color: '#EF4444' }}> · Overdue</span>}
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: '#F59E0B' }}>Rs {inv.total.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
