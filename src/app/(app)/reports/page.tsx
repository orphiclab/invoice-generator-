'use client'

import { useEffect, useState } from 'react'
import { FileText, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'

interface ReportData {
  period: string
  totalRevenue: number
  totalExpenses: number
  profit: number
  taxCollected: number
  invoiceCount: number
  paidCount: number
  byMonth: { month: string; revenue: number; expenses: number; tax: number }[]
  byCategory: { category: string; amount: number }[]
}

const QUARTERS = ['Q1 (Jan–Mar)', 'Q2 (Apr–Jun)', 'Q3 (Jul–Sep)', 'Q4 (Oct–Dec)']
const YEARS = [2024, 2025, 2026]

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [periodType, setPeriodType] = useState<'quarterly' | 'yearly'>('yearly')
  const [quarter, setQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3) - 1)

  useEffect(() => {
    setLoading(true)
    setData(null)
    const params = new URLSearchParams({ year: String(year), periodType, ...(periodType === 'quarterly' ? { quarter: String(quarter) } : {}) })
    fetch(`/api/reports/tax?${params}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [year, periodType, quarter])

  const statCards = data ? [
    { label: 'Total Revenue', value: `Rs ${data.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#16a34a', icon: TrendingUp },
    { label: 'Total Expenses', value: `Rs ${data.totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'hsl(0 84% 60%)', icon: TrendingDown },
    { label: 'Net Profit', value: `Rs ${data.profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: data.profit >= 0 ? '#16a34a' : 'hsl(0 84% 60%)', icon: DollarSign },
    { label: 'Tax Collected', value: `Rs ${data.taxCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'hsl(38 92% 50%)', icon: FileText },
  ] : []

  const GRADS = [
    ['linear-gradient(135deg, #a4f5a6 0%, #6ee7b7 100%)', 'rgba(164,245,166,0.35)', TrendingUp, true],
    ['linear-gradient(135deg, #f87171 0%, #fda4af 100%)', 'rgba(248,113,113,0.3)', TrendingDown, false],
    ['linear-gradient(135deg, #a28ef9 0%, #7c5cfc 100%)', 'rgba(162,142,249,0.3)', DollarSign, false],
    ['linear-gradient(135deg, #fcd34d 0%, #fde68a 100%)', 'rgba(252,211,77,0.3)', FileText, true],
  ]

  const selectStyle = { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', padding: '6px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none' }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>Tax Reports</h1>
          <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Revenue, expense &amp; tax summary</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="pill-tab-bar">
            <button onClick={() => setPeriodType('yearly')} className={`pill-tab${periodType === 'yearly' ? ' active' : ''}`}>Yearly</button>
            <button onClick={() => setPeriodType('quarterly')} className={`pill-tab${periodType === 'quarterly' ? ' active' : ''}`}>Quarterly</button>
          </div>
          {periodType === 'quarterly' && (
            <select value={quarter} onChange={e => setQuarter(Number(e.target.value))}
              className="h-8 px-3 rounded-xl text-xs font-semibold outline-none" style={{ background: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }}>
              {QUARTERS.map((q, i) => <option key={i} value={i}>{q}</option>)}
            </select>
          )}
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="h-8 px-3 rounded-xl text-xs font-semibold outline-none" style={{ background: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon }, i) => {
              const [grad, shadow, , light] = GRADS[i]
              return (
                <div key={label} className="rounded-2xl p-5 relative overflow-hidden" style={{ background: grad as string, boxShadow: `0 8px 24px ${shadow}` }}>
                  <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.25)' }}>
                    <Icon className="w-5 h-5" style={{ color: light ? '#166534' : 'white' }} />
                  </div>
                  <p className="text-xl font-extrabold" style={{ color: light ? '#166534' : 'white' }}>{value}</p>
                  <p className="text-xs mt-1 font-semibold" style={{ color: light ? 'rgba(22,101,52,0.75)' : 'rgba(255,255,255,0.8)' }}>{label}</p>
                </div>
              )
            })}
          </div>

          {/* Monthly Breakdown */}
          {data && data.byMonth.length > 0 && (
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #f3f4f6' }}>
                <Calendar className="w-4 h-4" style={{ color: '#a28ef9' }} />
                <h2 className="text-sm font-bold" style={{ color: '#111827' }}>Monthly Breakdown</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {['Month', 'Revenue', 'Expenses', 'Tax', 'Profit'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.byMonth.map((row, i) => {
                    const profit = row.revenue - row.expenses
                    return (
                      <tr key={row.month} className="hover:bg-gray-50"
                        style={{ borderBottom: i < data.byMonth.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                        <td className="px-5 py-3 text-xs font-semibold" style={{ color: '#111827' }}>{row.month}</td>
                        <td className="px-5 py-3 text-xs font-semibold" style={{ color: '#16a34a' }}>Rs {row.revenue.toLocaleString('en-LK', { maximumFractionDigits: 0 })}</td>
                        <td className="px-5 py-3 text-xs font-semibold" style={{ color: '#ef4444' }}>Rs {row.expenses.toLocaleString('en-LK', { maximumFractionDigits: 0 })}</td>
                        <td className="px-5 py-3 text-xs font-semibold" style={{ color: '#f59e0b' }}>Rs {row.tax.toLocaleString('en-LK', { maximumFractionDigits: 0 })}</td>
                        <td className="px-5 py-3 text-xs font-bold" style={{ color: profit >= 0 ? '#16a34a' : '#ef4444' }}>
                          {profit >= 0 ? '+' : ''}Rs {profit.toLocaleString('en-LK', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Expense by Category */}
          {data && data.byCategory.length > 0 && (
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h2 className="text-sm font-bold mb-4" style={{ color: '#111827' }}>Expenses by Category</h2>
              <div className="space-y-3">
                {data.byCategory.map(row => {
                  const pct = data.totalExpenses > 0 ? (row.amount / data.totalExpenses) * 100 : 0
                  return (
                    <div key={row.category}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{ color: '#374151' }}>{row.category}</span>
                        <span style={{ color: '#9ca3af' }}>Rs {row.amount.toLocaleString('en-LK', { maximumFractionDigits: 0 })} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: '#f3f4f6' }}>
                        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #a28ef9, #7c5cfc)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!data && (
            <div className="bg-white rounded-2xl p-12 flex flex-col items-center text-center" style={{ border: '1px solid #f0f2f0' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f9fafb' }}>
                <FileText className="w-7 h-7" style={{ color: '#d1d5db' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: '#374151' }}>No data for this period</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
