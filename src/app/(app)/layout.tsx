'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { GlobalSearch } from '@/components/GlobalSearch'
import {
  LayoutDashboard, FileText, Users, Settings, Zap, LogOut,
  Menu, X, Plus, Receipt, ClipboardList, RefreshCw, BarChart3,
  CreditCard, Bell,
} from 'lucide-react'

// ── Design tokens — Fustat light theme ─────────────────────────
const SIDEBAR_BG    = '#ffffff'
const MAIN_BG       = '#edf0ed'   // sage grey page background
const TOPBAR_BG     = '#ffffff'
const BORDER_COLOR  = '#e5e7eb'
const ACTIVE_BG     = '#222222'   // dark pill for active
const ACTIVE_COLOR  = '#ffffff'   // white text on dark pill
const INACTIVE_COLOR = '#6b7280'  // grey for inactive
const LABEL_COLOR   = '#9ca3af'   // lighter group label
const BADGE_BG      = '#a28ef9'   // lavender badge

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/reports',   label: 'Reports',   icon: BarChart3 },
    ],
  },
  {
    label: 'Billing',
    items: [
      { href: '/invoices',  label: 'Invoices',  icon: FileText },
      { href: '/estimates', label: 'Estimates', icon: ClipboardList },
      { href: '/recurring', label: 'Recurring', icon: RefreshCw },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/expenses', label: 'Expenses', icon: Receipt },
      { href: '/payments', label: 'Payments', icon: CreditCard },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/clients',  label: 'Clients',  icon: Users },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out')
    router.push('/login')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-5 px-3">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-7">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#222222' }}>
          <Zap className="w-4 h-4" style={{ color: '#a4f5a6' }} />
        </div>
        <div>
          <p className="font-bold text-sm leading-none tracking-tight" style={{ color: '#111827' }}>InvoiceFlow</p>
          <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>Smart Billing</p>
        </div>
      </div>

      {/* New Invoice button */}
      <Link href="/invoices/new" onClick={() => setSidebarOpen(false)} className="mb-6 px-1">
        <button className="w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
          style={{ background: '#a28ef9', color: '#ffffff', boxShadow: '0 4px 14px rgba(162,142,249,0.35)' }}>
          <Plus className="w-3.5 h-3.5" /> New Invoice
        </button>
      </Link>

      {/* Nav groups */}
      <nav className="flex-1 space-y-5 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-1.5 px-3"
              style={{ color: LABEL_COLOR }}>{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                return (
                  <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150"
                    style={active
                      ? { background: ACTIVE_BG, color: ACTIVE_COLOR }
                      : { color: INACTIVE_COLOR }}>
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? ACTIVE_COLOR : INACTIVE_COLOR }} />
                    <span className="flex-1">{label}</span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#a4f5a6' }} />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom — Settings + Logout */}
      <div className="pt-3 mt-2 space-y-0.5" style={{ borderTop: `1px solid ${BORDER_COLOR}` }}>
        <Link href="/settings" onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold w-full transition-colors"
          style={{ color: INACTIVE_COLOR }}>
          <Settings className="w-4 h-4" /> Settings
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold w-full transition-colors hover:bg-gray-50"
          style={{ color: INACTIVE_COLOR }}>
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: MAIN_BG }}>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col flex-shrink-0"
        style={{ width: '220px', background: SIDEBAR_BG, borderRight: `1px solid ${BORDER_COLOR}` }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col"
            style={{ width: '220px', background: SIDEBAR_BG, borderRight: `1px solid ${BORDER_COLOR}` }}>
            <button className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)} style={{ color: '#6b7280' }}>
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 h-[60px] flex-shrink-0"
          style={{ background: TOPBAR_BG, borderBottom: `1px solid ${BORDER_COLOR}` }}>
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}
            style={{ color: '#6b7280' }}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <GlobalSearch />
          {/* Bell */}
          <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors relative hover:bg-gray-50"
            style={{ color: '#6b7280', border: `1px solid ${BORDER_COLOR}` }}>
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-[1.5px] border-white"
              style={{ background: BADGE_BG }} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
