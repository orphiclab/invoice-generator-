'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText, Users, DollarSign, AlertCircle, Plus, ArrowRight,
  ArrowUpRight, ArrowUp, ArrowDown,
} from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts'

interface Stats {
  totalInvoices: number; totalClients: number
  totalRevenue: number; outstanding: number
  byStatus: { DRAFT: number; SENT: number; PAID: number; OVERDUE: number }
}
interface Invoice {
  id: string; invoiceNo: string; status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
  total: number; dueDate: string; client: { name: string; company?: string }
}
interface ChartData {
  monthlyRevenue: { month: string; revenue: number }[]
  statusData: { name: string; value: number }[]
  profitLoss: { month: string; revenue: number; expenses: number; profit: number }[]
  revenueByClient: { name: string; revenue: number }[]
  expensesByCategory: { name: string; amount: number }[]
  cashFlow: { month: string; net: number; cumulative: number }[]
  collectionRate: number
  avgInvoice: number
  totalExpenses: number
}

// Tooltip — clean white
const tt = {
  contentStyle: { background: '#fff', border: '1px solid #f0f2f0', borderRadius: '10px', color: '#111827', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 11 },
  itemStyle: { color: '#6b7280', padding: '1px 0' },
  labelStyle: { color: '#111827', fontWeight: 700, marginBottom: 2 },
  cursor: { fill: 'rgba(162,142,249,0.05)', stroke: 'none' },
}

const fmtK = (v: number) => `${(v/1000).toFixed(0)}k`
const fmtRs = (v: number) => `Rs ${v.toLocaleString('en-LK')}`

// Custom center label for donut
function DonutLabel({ viewBox, value, label }: { viewBox?: { cx: number; cy: number }; value?: number; label?: string }) {
  if (!viewBox) return null
  return (
    <g>
      <text x={viewBox.cx} y={viewBox.cy - 6} textAnchor="middle" fill="#111827" style={{ fontSize: 16, fontWeight: 800 }}>{value}</text>
      <text x={viewBox.cx} y={viewBox.cy + 12} textAnchor="middle" fill="#9ca3af" style={{ fontSize: 10 }}>{label}</text>
    </g>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [charts, setCharts] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState<'revenue' | 'profit'>('revenue')

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/invoices').then(r => r.json()),
      fetch('/api/dashboard/charts').then(r => r.json()),
    ]).then(([s, invs, c]) => {
      setStats(s); setRecentInvoices(Array.isArray(invs) ? invs.slice(0, 6) : []); setCharts(c); setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
    </div>
  )

  const today = new Date().toLocaleDateString('en-LK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const totalRev = stats?.totalRevenue ?? 0
  const outstanding = stats?.outstanding ?? 0

  // Compute total from statusData for donut center
  const totalInvoiceCount = stats?.totalInvoices ?? 0
  const paidCount = stats?.byStatus?.PAID ?? 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 pb-24 lg:pb-8">

      {/* ── Page header ── */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate" style={{ color: '#111827' }}>
            Hello! 👋
          </h1>
          <p className="text-xs mt-0.5 truncate" style={{ color: '#9ca3af' }}>{today}</p>
        </div>
        <Link href="/invoices/new" className="flex-shrink-0 hidden sm:block">
          <button className="btn-brand h-9 px-4 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </Link>
      </div>

      {/* ── Row 1: 4 stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        {/* Revenue card — lavender bg */}
        <div className="rounded-2xl p-4 sm:p-5 relative overflow-hidden col-span-1"
          style={{ background: 'linear-gradient(135deg, #a28ef9 0%, #7c5cfc 100%)', boxShadow: '0 8px 24px rgba(162,142,249,0.35)' }}>
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <div className="relative">
            <p className="text-[11px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Total Revenue</p>
            <p className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-none">
              Rs {(totalRev/1000).toFixed(0)}k
            </p>
            <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>From paid invoices</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <ArrowUp className="w-2.5 h-2.5" /> 12%
              </span>
              <span className="text-[10px] hidden sm:inline" style={{ color: 'rgba(255,255,255,0.5)' }}>vs last month</span>
            </div>
          </div>
        </div>

        {/* Outstanding */}
        <div className="bg-white rounded-2xl p-4 sm:p-5" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-start justify-between mb-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center" style={{ background: '#fff7ed' }}>
              <AlertCircle style={{ color: '#f97316', width: 16, height: 16 }} />
            </div>
            <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <ArrowDown className="w-2.5 h-2.5" /> Due
            </span>
          </div>
          <p className="text-lg sm:text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>
            Rs {(outstanding/1000).toFixed(0)}k
          </p>
          <p className="text-xs font-semibold mt-1" style={{ color: '#374151' }}>Outstanding</p>
          <p className="text-[11px] mt-0.5 hidden sm:block" style={{ color: '#9ca3af' }}>Sent & overdue</p>
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-2xl p-4 sm:p-5" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-start justify-between mb-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center" style={{ background: '#eff6ff' }}>
              <FileText style={{ color: '#3b82f6', width: 16, height: 16 }} />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>
            {totalInvoiceCount}
          </p>
          <p className="text-xs font-semibold mt-1" style={{ color: '#374151' }}>Invoices</p>
          <p className="text-[11px] mt-0.5 hidden sm:block" style={{ color: '#9ca3af' }}>{paidCount} paid this month</p>
        </div>

        {/* Clients */}
        <div className="bg-white rounded-2xl p-4 sm:p-5" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-start justify-between mb-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center" style={{ background: '#f0fdf4' }}>
              <Users style={{ color: '#22c55e', width: 16, height: 16 }} />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>
            {stats?.totalClients ?? 0}
          </p>
          <p className="text-xs font-semibold mt-1" style={{ color: '#374151' }}>Clients</p>
          <p className="text-[11px] mt-0.5 hidden sm:block" style={{ color: '#9ca3af' }}>Active</p>
        </div>
      </div>

      {/* ── Row 2: Main chart + right panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

        {/* Main chart card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-base font-bold" style={{ color: '#111827' }}>
                {activeChart === 'revenue' ? 'Revenue Trends' : 'Total Profit'}
              </h2>
              <p className="text-[11px]" style={{ color: '#9ca3af' }}>Monthly overview</p>
            </div>
            <div className="pill-tab-bar">
              {(['revenue', 'profit'] as const).map(t => (
                <button key={t} onClick={() => setActiveChart(t)} className={`pill-tab${activeChart === t ? ' active' : ''}`}>
                  {t === 'revenue' ? 'Revenue' : 'Profit'}
                </button>
              ))}
            </div>
          </div>

          {activeChart === 'revenue' ? (
            <>
              {/* Big number above chart */}
              <div className="mt-4 mb-4">
                <p className="text-3xl font-extrabold" style={{ color: '#111827' }}>
                  Rs {(totalRev / 1000).toFixed(0)}k
                </p>
                <p className="text-xs flex items-center gap-1 mt-1" style={{ color: '#22c55e' }}>
                  <ArrowUp className="w-3 h-3" /> +12% vs last month
                </p>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={charts?.monthlyRevenue ?? []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                  <Tooltip {...tt} formatter={(v: number) => [fmtRs(v), 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#a28ef9" strokeWidth={2.5} dot={false}
                    activeDot={{ r: 5, fill: '#a28ef9', stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 mb-4">
                {[
                  { label: 'Revenue', color: '#e5e7eb' },
                  { label: 'Expenses', color: '#222222' },
                  { label: 'Profit', color: '#a28ef9' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                    <span className="text-[11px]" style={{ color: '#6b7280' }}>{l.label}</span>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={charts?.profitLoss ?? []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barGap={2} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                  <Tooltip {...tt} formatter={(v: number) => fmtRs(v)} />
                  <Bar dataKey="revenue"  name="Revenue"  fill="#e5e7eb" radius={[6,6,0,0]} maxBarSize={22} />
                  <Bar dataKey="expenses" name="Expenses" fill="#222222" radius={[6,6,0,0]} maxBarSize={22} />
                  <Bar dataKey="profit"   name="Profit"   fill="#a28ef9" radius={[6,6,0,0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* Right: Donut + Quick actions */}
        <div className="space-y-4">
          {/* Donut balance card */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 className="text-sm font-bold mb-1" style={{ color: '#111827' }}>Invoice Balance</h2>
            <p className="text-[11px] mb-3" style={{ color: '#9ca3af' }}>This month</p>
            {(charts?.statusData ?? []).some(s => s.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={charts?.statusData ?? []}
                      cx="50%" cy="50%" innerRadius={40} outerRadius={58}
                      paddingAngle={2} dataKey="value" strokeWidth={0}
                      startAngle={90} endAngle={-270}>
                      {(charts?.statusData ?? []).map((entry, i) => (
                        <Cell key={entry.name}
                          fill={['#a28ef9','#222222','#e5e7eb','#fda4af'][i % 4]} />
                      ))}
                    </Pie>
                    <Tooltip {...tt} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-1">
                  {(charts?.statusData ?? []).filter(s => s.value > 0).map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: ['#a28ef9','#222222','#e5e7eb','#fda4af'][i % 4] }} />
                        <span className="text-[11px] capitalize" style={{ color: '#6b7280' }}>{s.name.toLowerCase()}</span>
                      </div>
                      <span className="text-[11px] font-bold" style={{ color: '#111827' }}>
                        {Math.round((s.value / Math.max(totalInvoiceCount, 1)) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-center py-6" style={{ color: '#d1d5db' }}>No invoices yet</p>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 className="text-sm font-bold mb-3" style={{ color: '#111827' }}>Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'New Invoice', href: '/invoices/new', color: '#a28ef9', bg: '#f5f3ff' },
                { label: 'Add Client',  href: '/clients',      color: '#3b82f6', bg: '#eff6ff' },
                { label: 'Log Expense', href: '/expenses',     color: '#22c55e', bg: '#f0fdf4' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group hover:bg-gray-50"
                  style={{ border: '1px solid #f3f4f6' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs font-semibold" style={{ color: '#111827' }}>{item.label}</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: item.color }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Revenue by Client + Expense Categories + KPIs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

        {/* Revenue by Client — horizontal bars */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 className="text-sm font-bold mb-1" style={{ color: '#111827' }}>Top Clients</h2>
          <p className="text-[11px] mb-4" style={{ color: '#9ca3af' }}>Revenue by client</p>
          {(charts?.revenueByClient ?? []).length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: '#d1d5db' }}>No data yet</p>
          ) : (
            <div className="space-y-3">
              {(charts?.revenueByClient ?? []).map((client, i) => {
                const maxRev = Math.max(...(charts?.revenueByClient ?? []).map(c => c.revenue), 1)
                const pct = (client.revenue / maxRev) * 100
                const colors = ['#a28ef9', '#7c5cfc', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7']
                return (
                  <div key={client.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold truncate" style={{ color: '#111827', maxWidth: '60%' }}>{client.name}</span>
                      <span className="text-[10px] font-bold" style={{ color: '#6b7280' }}>Rs {(client.revenue / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-sm font-bold" style={{ color: '#111827' }}>Expense Breakdown</h2>
              <p className="text-[11px]" style={{ color: '#9ca3af' }}>By category</p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: '#fef2f2', color: '#ef4444' }}>
              Rs {((charts?.totalExpenses ?? 0) / 1000).toFixed(0)}k
            </span>
          </div>
          {(charts?.expensesByCategory ?? []).length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: '#d1d5db' }}>No expenses yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={charts?.expensesByCategory ?? []}
                    cx="50%" cy="50%" innerRadius={36} outerRadius={54}
                    paddingAngle={2} dataKey="amount" strokeWidth={0}
                    startAngle={90} endAngle={-270}>
                    {(charts?.expensesByCategory ?? []).map((_, i) => (
                      <Cell key={i} fill={['#222222', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6'][i % 6]} />
                    ))}
                  </Pie>
                  <Tooltip {...tt} formatter={(v: number) => fmtRs(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-1">
                {(charts?.expensesByCategory ?? []).slice(0, 5).map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: ['#222222', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'][i % 5] }} />
                      <span className="text-[11px] capitalize" style={{ color: '#6b7280' }}>{cat.name.toLowerCase()}</span>
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: '#111827' }}>Rs {cat.amount.toLocaleString('en-LK')}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* KPI Cards Stack */}
        <div className="space-y-4">
          {/* Collection Rate */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>Collection Rate</p>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-extrabold" style={{ color: '#111827' }}>{charts?.collectionRate ?? 0}%</p>
              <p className="text-[11px] mb-1" style={{ color: '#9ca3af' }}>paid vs invoiced</p>
            </div>
            <div className="h-2 rounded-full mt-3 overflow-hidden" style={{ background: '#f3f4f6' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${charts?.collectionRate ?? 0}%`, background: 'linear-gradient(90deg, #a28ef9, #22c55e)' }} />
            </div>
          </div>

          {/* Avg Invoice */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>Avg. Invoice Value</p>
            <p className="text-3xl font-extrabold" style={{ color: '#111827' }}>Rs {((charts?.avgInvoice ?? 0) / 1000).toFixed(1)}k</p>
            <p className="text-[11px] mt-1" style={{ color: '#9ca3af' }}>Across all invoices</p>
          </div>

          {/* Cash Flow mini */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>Cash Flow</p>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={charts?.cashFlow ?? []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a28ef9" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#a28ef9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="cumulative" stroke="#a28ef9" strokeWidth={2} fill="url(#cfGrad)" dot={false} />
                <Tooltip {...tt} formatter={(v: number) => fmtRs(v)} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 4: Recent invoices table ── */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <div>
            <h2 className="text-sm font-bold" style={{ color: '#111827' }}>Recent Invoices</h2>
            <p className="text-[11px]" style={{ color: '#9ca3af' }}>Latest transactions</p>
          </div>
          <Link href="/invoices"
            className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ color: '#a28ef9' }}>
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f9fafb' }}>
              <FileText className="w-7 h-7" style={{ color: '#d1d5db' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#374151' }}>No invoices yet</p>
            <p className="text-xs mt-1 mb-4" style={{ color: '#9ca3af' }}>Create your first invoice to get started</p>
            <Link href="/invoices/new">
              <button className="btn-brand h-8 px-4 text-xs flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Create Invoice
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#f3f4f6' }}>
              {recentInvoices.map(inv => (
                <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold font-mono" style={{ color: '#a28ef9' }}>{inv.invoiceNo}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{inv.client?.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>
                      Due {new Date(inv.dueDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <p className="text-sm font-bold flex-shrink-0 ml-3" style={{ color: '#111827' }}>
                    Rs {inv.total.toLocaleString('en-LK', { maximumFractionDigits: 0 })}
                  </p>
                </Link>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {['Invoice #', 'Client', 'Amount', 'Due Date', 'Status'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em]"
                        style={{ color: '#9ca3af' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv, i) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors"
                      style={{ borderBottom: i < recentInvoices.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                      <td className="px-6 py-3.5">
                        <Link href={`/invoices/${inv.id}`}
                          className="text-xs font-bold font-mono hover:opacity-75 transition-opacity"
                          style={{ color: '#a28ef9' }}>
                          {inv.invoiceNo}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-xs font-semibold" style={{ color: '#111827' }}>{inv.client?.name}</p>
                        {inv.client?.company && <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>{inv.client.company}</p>}
                      </td>
                      <td className="px-6 py-3.5 text-xs font-bold" style={{ color: '#111827' }}>
                        Rs {inv.total.toLocaleString('en-LK', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-3.5 text-xs" style={{ color: '#6b7280' }}>
                        {new Date(inv.dueDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
