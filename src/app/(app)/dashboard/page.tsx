'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText, Users, DollarSign, AlertCircle, Plus, ArrowRight, ArrowUpRight, TrendingUp,
} from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

// ── Types ─────────────────────────────────────────────────────────
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
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#e5e7eb', SENT: '#a28ef9', PAID: '#222222', OVERDUE: '#fda4af',
}

// Minimal light tooltip
const tt = {
  contentStyle: {
    background: '#fff', border: '1px solid #f0f2f0',
    borderRadius: '12px', color: '#111827',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12,
  },
  itemStyle: { color: '#6b7280' },
  labelStyle: { color: '#111827', fontWeight: 700 },
  cursor: { fill: 'rgba(162,142,249,0.06)' },
}

// ── Clean number formatter ─────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1000000) return `Rs ${(n/1000000).toFixed(1)}M`
  if (n >= 1000) return `Rs ${(n/1000).toFixed(0)}k`
  return `Rs ${n.toFixed(0)}`
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
      setStats(s)
      setRecentInvoices(Array.isArray(invs) ? invs.slice(0, 6) : [])
      setCharts(c)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
    </div>
  )

  const today = new Date().toLocaleDateString('en-LK', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Dashboard</h1>
          <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{today}</p>
        </div>
        <Link href="/invoices/new">
          <button className="btn-brand h-9 px-4 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </Link>
      </div>

      {/* ── Stat Cards — clean white, big number ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: fmt(stats?.totalRevenue ?? 0),
            sub: 'From paid invoices',
            icon: DollarSign,
            iconBg: '#f5f3ff',
            iconColor: '#a28ef9',
            trend: '+12%',
            trendUp: true,
          },
          {
            label: 'Outstanding',
            value: fmt(stats?.outstanding ?? 0),
            sub: 'Sent & overdue',
            icon: AlertCircle,
            iconBg: '#fff7ed',
            iconColor: '#f97316',
            trend: null,
            trendUp: false,
          },
          {
            label: 'Invoices',
            value: String(stats?.totalInvoices ?? 0),
            sub: 'All time',
            icon: FileText,
            iconBg: '#eff6ff',
            iconColor: '#3b82f6',
            trend: '+4',
            trendUp: true,
          },
          {
            label: 'Clients',
            value: String(stats?.totalClients ?? 0),
            sub: 'Active',
            icon: Users,
            iconBg: '#f0fdf4',
            iconColor: '#22c55e',
            trend: null,
            trendUp: false,
          },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid #f0f2f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: card.iconBg }}>
                <card.icon className="w-5 h-5" style={{ color: card.iconColor }} />
              </div>
              {card.trend && (
                <span className="flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <TrendingUp className="w-2.5 h-2.5" /> {card.trend}
                </span>
              )}
            </div>
            <p className="text-[28px] font-extrabold tracking-tight leading-none" style={{ color: '#111827' }}>
              {card.value}
            </p>
            <p className="text-xs font-semibold mt-2" style={{ color: '#374151' }}>{card.label}</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts + Side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6"
          style={{ border: '1px solid #f0f2f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold" style={{ color: '#111827' }}>
                {activeChart === 'revenue' ? 'Revenue Overview' : 'Profit & Loss'}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Last 6 months</p>
            </div>
            {/* Tab switcher */}
            <div className="pill-tab-bar">
              {(['revenue', 'profit'] as const).map(t => (
                <button key={t} onClick={() => setActiveChart(t)}
                  className={`pill-tab${activeChart === t ? ' active' : ''}`}>
                  {t === 'revenue' ? 'Revenue' : 'P&L'}
                </button>
              ))}
            </div>
          </div>

          {activeChart === 'revenue' ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={charts?.monthlyRevenue ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#a28ef9" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#a28ef9" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip {...tt} formatter={(v: number) => [`Rs ${v.toLocaleString('en-LK')}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#a28ef9" strokeWidth={2.5}
                  fill="url(#revGrad)" dot={false}
                  activeDot={{ r: 5, fill: '#a28ef9', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts?.profitLoss ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={3}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip {...tt} formatter={(v: number) => `Rs ${v.toLocaleString('en-LK')}`} />
                <Bar dataKey="revenue"  name="Revenue"  fill="#a28ef9" radius={[6,6,0,0]} maxBarSize={28} />
                <Bar dataKey="expenses" name="Expenses" fill="#222222" radius={[6,6,0,0]} maxBarSize={28} />
                <Bar dataKey="profit"   name="Profit"   fill="#a4f5a6" radius={[6,6,0,0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Status donut */}
          <div className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid #f0f2f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: '#111827' }}>Invoice Status</h2>
            {(charts?.statusData ?? []).some(s => s.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={charts?.statusData ?? []} cx="50%" cy="50%"
                      innerRadius={36} outerRadius={52} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {(charts?.statusData ?? []).map(entry => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#e5e7eb'} />
                      ))}
                    </Pie>
                    <Tooltip {...tt} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {(charts?.statusData ?? []).filter(s => s.value > 0).map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s.name] }} />
                        <span className="text-xs capitalize" style={{ color: '#6b7280' }}>{s.name.toLowerCase()}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: '#111827' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-center py-6" style={{ color: '#d1d5db' }}>No invoices yet</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid #f0f2f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 className="text-sm font-bold mb-3" style={{ color: '#111827' }}>Quick Actions</h2>
            <div className="space-y-1.5">
              {[
                { label: 'New Invoice',  href: '/invoices/new', badge: '#a28ef9', badgeBg: '#f5f3ff' },
                { label: 'Add Client',   href: '/clients',      badge: '#3b82f6', badgeBg: '#eff6ff' },
                { label: 'Log Expense',  href: '/expenses',     badge: '#22c55e', badgeBg: '#f0fdf4' },
                { label: 'View Reports', href: '/reports',      badge: '#f59e0b', badgeBg: '#fffbeb' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group hover:bg-gray-50"
                  style={{ border: '1px solid #f3f4f6' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.badge }} />
                    <span className="text-xs font-semibold" style={{ color: '#374151' }}>{item.label}</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: item.badge }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Invoices ── */}
      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid #f0f2f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f9fafb' }}>
          <h2 className="text-sm font-bold" style={{ color: '#111827' }}>Recent Invoices</h2>
          <Link href="/invoices"
            className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ color: '#a28ef9' }}>
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <FileText className="w-10 h-10 mb-3" style={{ color: '#e5e7eb' }} />
            <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>No invoices yet</p>
            <Link href="/invoices/new">
              <button className="mt-3 btn-brand h-8 px-4 text-xs flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Create one
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['Invoice #', 'Client', 'Amount', 'Due Date', 'Status'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: '#9ca3af' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv, i) => (
                  <tr key={inv.id} className="group hover:bg-gray-50 transition-colors"
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
                      {new Date(inv.dueDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
