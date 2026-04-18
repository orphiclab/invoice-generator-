'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  Bell, Check, CheckCheck, Trash2, X,
  FileText, CreditCard, ClipboardList, RefreshCw,
  AlertCircle, DollarSign, Users, Package,
} from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  linkTo: string | null
  createdAt: string
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  payment_received: DollarSign,
  invoice_overdue: AlertCircle,
  invoice_sent: FileText,
  estimate_accepted: ClipboardList,
  estimate_rejected: ClipboardList,
  recurring_generated: RefreshCw,
  client_created: Users,
  product_created: Package,
  payment_completed: CreditCard,
}

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  payment_received:   { bg: '#f0fdf4', color: '#22c55e' },
  invoice_overdue:    { bg: '#fef2f2', color: '#ef4444' },
  invoice_sent:       { bg: '#f5f3ff', color: '#a28ef9' },
  estimate_accepted:  { bg: '#ecfdf5', color: '#10b981' },
  estimate_rejected:  { bg: '#fef2f2', color: '#ef4444' },
  recurring_generated:{ bg: '#fefce8', color: '#eab308' },
  client_created:     { bg: '#f0fdf4', color: '#22c55e' },
  product_created:    { bg: '#fdf2f8', color: '#ec4899' },
  payment_completed:  { bg: '#ecfdf5', color: '#10b981' },
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

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=20')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    })
    fetchNotifications()
  }

  async function markOneRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    })
    fetchNotifications()
  }

  async function clearAll() {
    await fetch('/api/notifications', { method: 'DELETE' })
    fetchNotifications()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications() }}
        className="w-9 h-9 rounded-2xl flex items-center justify-center transition-colors relative hover:bg-gray-50"
        style={{ color: '#6b7280', border: '1px solid #e5e7eb' }}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold px-1"
            style={{ background: '#a28ef9', color: 'white', boxShadow: '0 2px 6px rgba(162,142,249,0.5)' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 max-h-[480px] bg-white rounded-2xl overflow-hidden z-50"
          style={{
            width: 'min(380px, calc(100vw - 1.5rem))',
            border: '1px solid #f0f2f0',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold" style={{ color: '#111827' }}>Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: '#f5f3ff', color: '#a28ef9' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                  style={{ color: '#a28ef9' }}>
                  <CheckCheck className="w-3 h-3" /> Read all
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50"
                  style={{ color: '#9ca3af' }}
                  title="Clear all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f9fafb' }}>
                  <Bell className="w-6 h-6" style={{ color: '#d1d5db' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#374151' }}>All caught up!</p>
                <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const Icon = TYPE_ICONS[n.type] || Bell
                const colors = TYPE_COLORS[n.type] || { bg: '#f3f4f6', color: '#6b7280' }

                const Content = (
                  <div
                    className="flex items-start gap-3 px-5 py-3 transition-all hover:bg-gray-50 cursor-pointer group"
                    style={{
                      background: n.isRead ? 'transparent' : 'rgba(162,142,249,0.03)',
                      borderBottom: '1px solid #f9fafb',
                    }}
                    onClick={() => { if (!n.isRead) markOneRead(n.id) }}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: colors.bg }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: colors.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${n.isRead ? '' : 'font-bold'}`} style={{ color: '#111827' }}>
                        {n.title}
                      </p>
                      <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: '#6b7280' }}>
                        {n.message}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: '#9ca3af' }}>{timeAgo(n.createdAt)}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: '#a28ef9' }} />
                    )}
                  </div>
                )

                return n.linkTo ? (
                  <Link key={n.id} href={n.linkTo} onClick={() => setOpen(false)}>
                    {Content}
                  </Link>
                ) : (
                  <div key={n.id}>{Content}</div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
