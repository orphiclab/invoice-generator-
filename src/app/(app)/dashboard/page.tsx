'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText, Users, DollarSign, AlertCircle, Plus, ArrowRight,
  TrendingUp, TrendingDown, ArrowUpRight,
} from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// ── Types ────────────────────────────────────────────────────────
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
  revenueByClient: { name: string; revenue: number }[]
  statusData: { name: string; value: number }[]
  profitLoss: { month: string; revenue: number; expenses: number; profit: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#9ca3af', SENT: '#60a5fa', PAID: '#4ade80', OVERDUE: '#f87171',
}

// Light mode tooltip
const tt = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    color: '#111827',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  },
  itemStyle: { color: '#6b7280' },
  labelStyle: { color: '#111827', fontWeight: 700 },
}

const statCards = [
  { key: 'revenue',     label: 'Total Revenue',  icon: DollarSign,  cls: 'stat-purple', trend: +12, sub: 'From paid invoices',  textColor: 'text-gray-900' },
  { key: 'outstanding', label: 'Outstanding',    icon: AlertCircle, cls: 'stat-amber',  sub: 'Sent & overdue',                   textColor: 'text-gray-900' },
  { key: 'invoices',    label: 'Invoices',       icon: FileText,    cls: 'stat-blue',   trend: +4,  sub: 'All time',             textColor: 'text-gray-900' },
  { key: 'clients',     label: 'Clients',        icon: Users,       cls: 'stat-emerald', sub: 'Active clients',                  textColor: 'text-gray-900' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [charts, setCharts] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'revenue' | 'profit'>('revenue')

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
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
    </div>
  )

  const statValues: Record<string, string> = {
    revenue:     `Rs ${(stats?.totalRevenue  ?? 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`,
    outstanding: `Rs ${(stats?.outstanding   ?? 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`,
    invoices:    String(stats?.totalInvoices ?? 0),
    clients:     String(stats?.totalClients  ?? 0),
  }

  const today = new Date().toLocaleDateString('en-LK', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#111827' }}>Dashboard</h1>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{today}</p>
        </div>
        <Link href="/invoices/new">
          <button className="btn-brand h-9 px-5 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.key} className={`${card.cls} rounded-2xl p-5 relative overflow-hidden`}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: '#e5e7eb', filter: 'blur(2px)' }} />
            <div className="absolute top-2 right-2 w-16 h-16 rounded-full" style={{ background: '#e5e7eb', filter: 'blur(4px)' }} />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#9ca3af' }}>
                  <card.icon className="text-gray-900" />
                </div>
                {card.trend !== undefined && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: '#9ca3af', color: '#111827' }}>
                    {card.trend > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {Math.abs(card.trend)}%
                  </span>
                )}
              </div>
              <p className="text-gray-900">{statValues[card.key]}</p>
              <p className="text-xs mt-2 font-semibold" style={{ color: '#374151' }}>{card.label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#6b7280' }}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-white" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold" style={{ color: '#111827' }}>Financial Overview</h2>
              <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Revenue & expenses over time</p>
            </div>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#f3f4f6' }}>
              {(['revenue', 'profit'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={activeTab === tab
                    ? { background: '#a28ef9', color: '#111827', boxShadow: '0 2px 8px rgba(162,142,249,0.35)' }
                    : { color: '#6b7280' }}>
                  {tab === 'revenue' ? 'Revenue' : 'P&L'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            {activeTab === 'revenue' ? (
              <AreaChart data={charts?.monthlyRevenue ?? []}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a28ef9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a28ef9" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `Rs ${(v/1000).toFixed(0)}k`} />
                <Tooltip {...tt} formatter={(v: number) => [`Rs ${v.toLocaleString('en-LK')}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#a28ef9" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#a28ef9', r: 3, strokeWidth: 0 }} />
              </AreaChart>
            ) : (
              <BarChart data={charts?.profitLoss ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `Rs ${(v/1000).toFixed(0)}k`} />
                <Tooltip {...tt} formatter={(v: number) => `Rs ${v.toLocaleString('en-LK')}`} />
                <Legend wrapperStyle={{ color: '#6b7280', fontSize: 12 }} />
                <Bar dataKey="revenue"  name="Revenue"  fill="#a28ef9" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#fda4af" radius={[4,4,0,0]} />
                <Bar dataKey="profit"   name="Profit"   fill="#a4f5a6" radius={[4,4,0,0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Status Donut */}
          <div className="rounded-2xl p-5 bg-white" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: '#111827' }}>Invoice Status</h2>
            {(charts?.statusData ?? []).some(s => s.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={charts?.statusData ?? []} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                      {(charts?.statusData ?? []).map(entry => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#9ca3af'} />
                      ))}
                    </Pie>
                    <Tooltip {...tt} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {(charts?.statusData ?? []).filter(s => s.value > 0).map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s.name] }} />
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
          <div className="rounded-2xl p-5 bg-white" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h2 className="text-sm font-bold mb-3" style={{ color: '#111827' }}>Quick Actions</h2>
            <div className="space-y-1.5">
              {[
                { label: 'New Invoice',  href: '/invoices/new', color: '#a28ef9' },
                { label: 'Add Client',   href: '/clients',      color: '#60a5fa' },
                { label: 'Log Expense',  href: '/expenses',     color: '#4ade80' },
                { label: 'View Reports', href: '/reports',      color: '#fcd34d' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group hover:bg-gray-50"
                  style={{ border: '1px solid #f3f4f6' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs font-semibold" style={{ color: '#374151' }}>{item.label}</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: item.color }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Invoices ── */}
      <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="text-sm font-bold" style={{ color: '#111827' }}>Recent Invoices</h2>
          <Link href="/invoices" className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: '#a28ef9' }}>
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="w-8 h-8 mb-2" style={{ color: '#e5e7eb' }} />
            <p className="text-xs" style={{ color: '#9ca3af' }}>No invoices yet</p>
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
                        className="text-xs font-bold font-mono hover:opacity-80 transition-opacity"
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
