'use client'

import { useEffect, useState } from 'react'
import {
  Activity, FileText, Users, Receipt, ClipboardList, CreditCard,
  Package, RefreshCw, Filter, ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'

interface Log {
  id: string
  action: string
  entityType: string
  entityId: string | null
  entityName: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

const ENTITY_ICONS: Record<string, typeof FileText> = {
  invoice: FileText,
  estimate: ClipboardList,
  client: Users,
  expense: Receipt,
  payment: CreditCard,
  product: Package,
  recurring: RefreshCw,
}

const ENTITY_COLORS: Record<string, { bg: string; color: string }> = {
  invoice:   { bg: '#f5f3ff', color: '#a28ef9' },
  estimate:  { bg: '#eff6ff', color: '#3b82f6' },
  client:    { bg: '#f0fdf4', color: '#22c55e' },
  expense:   { bg: '#fff7ed', color: '#f97316' },
  payment:   { bg: '#ecfdf5', color: '#10b981' },
  product:   { bg: '#fdf2f8', color: '#ec4899' },
  recurring: { bg: '#fefce8', color: '#eab308' },
}

const ACTION_LABELS: Record<string, string> = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
  sent: 'Sent',
  paid: 'Marked as paid',
  converted: 'Converted',
  archived: 'Archived',
  restored: 'Restored',
}

const ENTITY_LINKS: Record<string, string> = {
  invoice: '/invoices',
  estimate: '/estimates',
  client: '/clients',
  expense: '/expenses',
  payment: '/payments',
  product: '/products',
  recurring: '/recurring',
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })
}

function groupByDate(logs: Log[]): Record<string, Log[]> {
  const groups: Record<string, Log[]> = {}
  for (const log of logs) {
    const d = new Date(log.createdAt)
    const today = new Date()
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)

    let key: string
    if (d.toDateString() === today.toDateString()) key = 'Today'
    else if (d.toDateString() === yesterday.toDateString()) key = 'Yesterday'
    else key = d.toLocaleDateString('en-LK', { weekday: 'long', day: 'numeric', month: 'long' })

    if (!groups[key]) groups[key] = []
    groups[key].push(log)
  }
  return groups
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const params = filter !== 'all' ? `?type=${filter}` : ''
    fetch(`/api/activity${params}`)
      .then(r => r.json())
      .then(d => { setLogs(Array.isArray(d) ? d : []); setLoading(false) })
  }, [filter])

  const grouped = groupByDate(logs)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>
          Activity Timeline
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
          Track everything happening in your workspace
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4" style={{ color: '#9ca3af' }} />
        <div className="pill-tab-bar">
          {[
            ['all', 'All'],
            ['invoice', 'Invoices'],
            ['client', 'Clients'],
            ['expense', 'Expenses'],
            ['product', 'Products'],
            ['payment', 'Payments'],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`pill-tab${filter === key ? ' active' : ''}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl" style={{ border: '1px solid #f0f2f0' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f5f3ff' }}>
            <Activity className="w-7 h-7" style={{ color: '#a28ef9' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#374151' }}>No activity yet</p>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Actions you take will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, items]) => (
            <div key={day}>
              {/* Day header */}
              <div className="flex items-center gap-3 mb-3">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9ca3af' }}>{day}</p>
                <div className="flex-1 h-px" style={{ background: '#f0f2f0' }} />
              </div>

              {/* Items */}
              <div className="space-y-1">
                {items.map(log => {
                  const Icon = ENTITY_ICONS[log.entityType] || Activity
                  const colors = ENTITY_COLORS[log.entityType] || { bg: '#f3f4f6', color: '#6b7280' }
                  const linkBase = ENTITY_LINKS[log.entityType]
                  const linkTo = log.entityId && linkBase ? `${linkBase}/${log.entityId}` : null

                  return (
                    <div key={log.id}
                      className="flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-white group"
                      style={{ border: '1px solid transparent' }}>
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: colors.bg }}>
                        <Icon className="w-4 h-4" style={{ color: colors.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ color: '#111827' }}>
                          <span className="font-bold capitalize">{ACTION_LABELS[log.action] || log.action}</span>
                          {' '}
                          <span style={{ color: '#6b7280' }}>{log.entityType}</span>
                          {log.entityName && (
                            <>
                              {' '}
                              <span className="font-semibold" style={{ color: colors.color }}>
                                {log.entityName}
                              </span>
                            </>
                          )}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>
                          {timeAgo(log.createdAt)}
                        </p>
                      </div>

                      {/* Link */}
                      {linkTo && (
                        <Link href={linkTo}
                          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                          style={{ color: '#6b7280' }}>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
