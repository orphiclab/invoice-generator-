'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { GlobalSearch } from '@/components/GlobalSearch'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import {
  LayoutDashboard, FileText, Users, Settings, Zap, LogOut,
  Menu, X, Plus, Receipt, ClipboardList, RefreshCw, BarChart3,
  CreditCard, Package, Activity, Shield, ChevronLeft,
} from 'lucide-react'

// ── Design tokens — Fustat light theme ─────────────────────────
const SIDEBAR_BG    = '#ffffff'
const MAIN_BG       = '#edf0ed'
const TOPBAR_BG     = '#ffffff'
const BORDER_COLOR  = '#e5e7eb'
const ACTIVE_BG     = '#222222'
const ACTIVE_COLOR  = '#ffffff'
const INACTIVE_COLOR = '#6b7280'
const LABEL_COLOR   = '#9ca3af'

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
      { href: '/products',  label: 'Products',  icon: Package },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/expenses', label: 'Expenses', icon: Receipt },
      { href: '/payments', label: 'Payments', icon: CreditCard },
      { href: '/activity', label: 'Activity', icon: Activity },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/clients',  label: 'Clients',  icon: Users },
      { href: '/users',    label: 'User Management', icon: Shield },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  // Swipe-to-close gesture
  useEffect(() => {
    if (!sidebarOpen) return
    const el = sidebarRef.current
    if (!el) return

    function onTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches[0].clientX
    }
    function onTouchEnd(e: TouchEvent) {
      const diff = touchStartX.current - e.changedTouches[0].clientX
      if (diff > 60) setSidebarOpen(false) // swipe left to close
    }
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [sidebarOpen])

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

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
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-none tracking-tight" style={{ color: '#111827' }}>InvoiceFlow</p>
          <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>Smart Billing</p>
        </div>
        {/* Close button — mobile only */}
        <button className="lg:hidden p-1 rounded-lg hover:bg-gray-100 -mr-1"
          onClick={() => setSidebarOpen(false)} style={{ color: '#6b7280' }}>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* New Invoice button */}
      <Link href="/invoices/new" className="mb-6 px-1">
        <button className="w-full h-10 sm:h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-[0.97]"
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
                  <Link key={href} href={href}
                    className="flex items-center gap-2.5 px-3 py-2.5 sm:py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 active:scale-[0.97]"
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
        <Link href="/settings"
          className="flex items-center gap-2.5 px-3 py-2.5 sm:py-2 rounded-xl text-[13px] font-semibold w-full transition-colors"
          style={{ color: INACTIVE_COLOR }}>
          <Settings className="w-4 h-4" /> Settings
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 sm:py-2 rounded-xl text-[13px] font-semibold w-full transition-colors hover:bg-gray-50 active:scale-[0.97]"
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

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            style={{ animation: 'fadeIn 200ms ease-out' }}
          />
          {/* Sidebar panel */}
          <aside ref={sidebarRef}
            className="relative flex flex-col z-10 shadow-2xl"
            style={{
              width: '280px',
              maxWidth: '85vw',
              background: SIDEBAR_BG,
              borderRight: `1px solid ${BORDER_COLOR}`,
              animation: 'slideInLeft 250ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 h-[56px] sm:h-[60px] flex-shrink-0"
          style={{ background: TOPBAR_BG, borderBottom: `1px solid ${BORDER_COLOR}` }}>
          <button className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-gray-100 active:scale-95 transition-transform" onClick={() => setSidebarOpen(true)}
            style={{ color: '#6b7280' }}>
            <Menu className="w-5 h-5" />
          </button>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#222222' }}>
              <Zap className="w-3.5 h-3.5" style={{ color: '#a4f5a6' }} />
            </div>
            <span className="font-bold text-sm" style={{ color: '#111827' }}>InvoiceFlow</span>
          </div>
          <div className="flex-1" />
          <GlobalSearch />
          <NotificationDropdown />
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
