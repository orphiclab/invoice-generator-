'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText, Users, DollarSign, AlertCircle, Plus, ArrowRight,
  TrendingUp, TrendingDown, BarChart3, ArrowUpRight,
} from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
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
  revenueByClient: { name: string; revenue: number }[]
  statusData: { name: string; value: number }[]
  profitLoss: { month: string; revenue: number; expenses: number; profit: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#64748B', SENT: '#3B82F6', PAID: '#10B981', OVERDUE: '#EF4444',
}

const tt = {
  contentStyle: { background: '#16191F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  itemStyle: { color: 'rgba(255,255,255,0.6)' },
  labelStyle: { color: '#fff', fontWeight: 700 },
}

const statCards = [
  {
    key: 'revenue',
    label: 'Total Revenue',
    icon: DollarSign,
    cls: 'stat-purple',
    trend: +12,
    sub: 'From paid invoices',
  },
  {
    key: 'outstanding',
    label: 'Outstanding',
    icon: AlertCircle,
    cls: 'stat-amber',
    sub: 'Sent & overdue',
  },
  {
    key: 'invoices',
    label: 'Invoices',
    icon: FileText,
    cls: 'stat-blue',
    trend: +4,
    sub: 'All time',
  },
  {
    key: 'clients',
    label: 'Clients',
    icon: Users,
    cls: 'stat-emerald',
    sub: 'Active clients',
  },
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
      setStats(s); setRecentInvoices(Array.isArray(invs) ? invs.slice(0, 6) : []); setCharts(c); setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }} />
    </div>
  )

  const statValues: Record<string, string> = {
    revenue: `Rs ${(stats?.totalRevenue ?? 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`,
    outstanding: `Rs ${(stats?.outstanding ?? 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`,
    invoices: String(stats?.totalInvoices ?? 0),
    clients: String(stats?.totalClients ?? 0),
  }

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="p-6 lg:p-8 space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{today}</p>
        </div>
        <Link href="/invoices/new">
          <button className="btn-brand h-9 px-5 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </Link>
      </div>

      {/* Stat Cards — pixel-matched gradient */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.key} className={`${card.cls} rounded-2xl p-5 relative overflow-hidden`}>
            {/* Large glowing orb — top right, matches reference */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', filter: 'blur(2px)' }} />
            <div className="absolute top-2 right-2 w-16 h-16 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', filter: 'blur(4px)' }} />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                {card.trend !== undefined && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.18)', color: 'white' }}>
                    {card.trend > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {Math.abs(card.trend)}%
                  </span>
                )}
              </div>
              <p className="text-[26px] font-extrabold text-white tracking-tight leading-none">{statValues[card.key]}</p>
              <p className="text-xs mt-2 font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>{card.label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: '#16191F', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white">Financial Overview</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Revenue & expenses over time</p>
            </div>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {(['revenue', 'profit'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={activeTab === tab
                    ? { background: '#7C3AED', color: 'white', boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }
                    : { color: 'rgba(255,255,255,0.4)' }}>
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
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `Rs ${(v/1000).toFixed(0)}k`} />
                <Tooltip {...tt} formatter={(v: number) => [`Rs ${v.toLocaleString('en-IN')}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#8B5CF6', r: 3, strokeWidth: 0 }} />
              </AreaChart>
            ) : (
              <BarChart data={charts?.profitLoss ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `Rs ${(v/1000).toFixed(0)}k`} />
                <Tooltip {...tt} formatter={(v: number) => `Rs ${v.toLocaleString('en-IN')}`} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }} />
                <Bar dataKey="revenue" name="Revenue" fill="#8B5CF6" radius={[4.4,0,0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[4,4,0,0]} />
                <Bar dataKey="profit" name="Profit" fill="#10B981" radius={[4,4,0,0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Status Donut */}
          <div className="rounded-2xl p-5" style={{ background: '#16191F', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-sm font-bold text-white mb-4">Invoice Status</h2>
            {(charts?.statusData ?? []).some(s => s.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={charts?.statusData ?? []} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                      {(charts?.statusData ?? []).map(entry => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#64748B'} />
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
                        <span className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.name.toLowerCase()}</span>
                      </div>
                      <span className="text-xs font-bold text-white">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-center py-6" style={{ color: 'rgba(255,255,255,0.25)' }}>No invoices yet</p>
            )}
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl p-5" style={{ background: '#16191F', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-sm font-bold text-white mb-3">Quick Actions</h2>
            <div className="space-y-1.5">
              {[
                { label: 'New Invoice', href: '/invoices/new', color: '#8B5CF6' },
                { label: 'Add Client', href: '/clients', color: '#3B82F6' },
                { label: 'Log Expense', href: '/expenses', color: '#10B981' },
                { label: 'View Reports', href: '/reports', color: '#F59E0B' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>{item.label}</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: item.color }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#16191F', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-bold text-white">Recent Invoices</h2>
          <Link href="/invoices" className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: '#8B5CF6' }}>
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="w-8 h-8 mb-2" style={{ color: 'rgba(255,255,255,0.1)' }} />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>No invoices yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Invoice #', 'Client', 'Amount', 'Due Date', 'Status'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: 'rgba(255,255,255,0.25)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv, i) => (
                  <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: i < recentInvoices.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td className="px-6 py-3.5">
                      <Link href={`/invoices/${inv.id}`} className="text-xs font-bold font-mono hover:opacity-80 transition-opacity" style={{ color: '#A78BFA' }}>
                        {inv.invoiceNo}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="text-xs font-semibold text-white">{inv.client?.name}</p>
                      {inv.client?.company && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{inv.client.company}</p>}
                    </td>
                    <td className="px-6 py-3.5 text-xs font-bold text-white">
                      Rs {inv.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-3.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
