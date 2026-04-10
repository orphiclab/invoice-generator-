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

  const tabStyle = (active: boolean) => ({
    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
    background: active ? '#a28ef9' : 'rgba(0,0,0,0.04)',
    color: active ? 'white' : '#6b7280',
    boxShadow: active ? '0 2px 8px rgba(124,58,237,0.4)' : 'none',
    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
  })

  const selectStyle = { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', padding: '6px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none' }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gray-900">Tax Reports</h1>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Revenue, expense &amp; tax summary</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#f9fafb' }}>
            <button style={tabStyle(periodType === 'yearly')} onClick={() => setPeriodType('yearly')}>Yearly</button>
            <button style={tabStyle(periodType === 'quarterly')} onClick={() => setPeriodType('quarterly')}>Quarterly</button>
          </div>
          {periodType === 'quarterly' && (
            <select value={quarter} onChange={e => setQuarter(Number(e.target.value))} style={selectStyle}>
              {QUARTERS.map((q, i) => <option key={i} value={i}>{q}</option>)}
            </select>
          )}
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={selectStyle}>
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
            {statCards.map(({ label, value, color, icon: Icon }, i) => {
              const cls = ['stat-emerald','stat-rose','stat-purple','stat-amber'][i]
              return (
                <div key={label} className={`${cls} rounded-2xl p-5 relative overflow-hidden`}>
                  <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-20" style={{ background: '#9ca3af' }} />
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#9ca3af' }}>
                    <Icon className="text-gray-900" />
                  </div>
                  <p className="text-gray-900">{value}</p>
                  <p className="text-gray-900">{label}</p>
                </div>
              )
            })}
          </div>

          {/* Monthly Breakdown */}
          {data && data.byMonth.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                <h2 className="text-gray-900">
                  <Calendar className="w-4 h-4" style={{ color: '#a28ef9' }} /> Monthly Breakdown
                </h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {['Month', 'Revenue', 'Expenses', 'Tax', 'Profit'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#9ca3af' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.byMonth.map(row => {
                    const profit = row.revenue - row.expenses
                    return (
                      <tr key={row.month} className="hover:bg-gray-50" style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td className="text-gray-900">{row.month}</td>
                        <td className="px-5 py-3 text-sm" style={{ color: '#16a34a' }}>Rs {row.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td className="px-5 py-3 text-sm" style={{ color: 'hsl(0 84% 60%)' }}>Rs {row.expenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td className="px-5 py-3 text-sm" style={{ color: 'hsl(38 92% 50%)' }}>Rs {row.tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td className="px-5 py-3 text-sm font-semibold" style={{ color: profit >= 0 ? '#16a34a' : 'hsl(0 84% 60%)' }}>
                          {profit >= 0 ? '+' : ''}Rs {profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
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
            <div className="rounded-2xl p-6" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
              <h2 className="text-gray-900">Expenses by Category</h2>
              <div className="space-y-3">
                {data.byCategory.map(row => {
                  const pct = data.totalExpenses > 0 ? (row.amount / data.totalExpenses) * 100 : 0
                  return (
                    <div key={row.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>{row.category}</span>
                        <span className="text-gray-900" style={{ color: '#9ca3af' }}>({pct.toFixed(0)}%)</span></span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: '#f9fafb' }}>
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6B50EE, #3B82F6)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!data && (
            <div className="rounded-2xl p-12 flex flex-col items-center text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <FileText className="w-10 h-10 mb-3 opacity-20" style={{ color: '#6b7280' }} />
              <p className="text-gray-900">No data for this period</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
