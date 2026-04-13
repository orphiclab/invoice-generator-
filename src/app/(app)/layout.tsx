'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { GlobalSearch } from '@/components/GlobalSearch'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { useTheme } from '@/components/ThemeProvider'
import {
  LayoutDashboard, FileText, Users, Settings, Zap, LogOut,
  Menu, X, Plus, Receipt, ClipboardList, RefreshCw, BarChart3,
  CreditCard, Package, Activity, Shield, ChevronLeft, Sun, Moon, TrendingUp,
  Landmark,
} from 'lucide-react'

// ── Design tokens — theme aware ────────────────────────────────
function useTokens() {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  return {
    SIDEBAR_BG:    dark ? '#0f1729' : '#ffffff',
    MAIN_BG:       dark ? '#0b1120' : '#edf0ed',
    TOPBAR_BG:     dark ? '#111827' : '#ffffff',
    BORDER_COLOR:  dark ? '#1e293b' : '#e5e7eb',
    ACTIVE_BG:     dark ? '#a28ef9' : '#222222',
    ACTIVE_COLOR:  '#ffffff',
    INACTIVE_COLOR: dark ? '#64748b' : '#6b7280',
    LABEL_COLOR:   dark ? '#475569' : '#9ca3af',
    TEXT_PRIMARY:  dark ? '#e2e8f0' : '#111827',
    TEXT_SECONDARY: dark ? '#94a3b8' : '#6b7280',
    CARD_BG:       dark ? '#111827' : '#ffffff',
  }
}

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/reports',   label: 'Reports',   icon: BarChart3 },
      { href: '/forecast',  label: 'Forecast',  icon: TrendingUp },
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
      { href: '/bank-accounts', label: 'Bank Details', icon: Landmark },
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
  const { theme, toggleTheme } = useTheme()
  const tokens = useTokens()
  const { SIDEBAR_BG, MAIN_BG, TOPBAR_BG, BORDER_COLOR, ACTIVE_BG, ACTIVE_COLOR, INACTIVE_COLOR, LABEL_COLOR, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BG } = tokens
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
    <div className="flex fixed inset-0 overflow-hidden" style={{ background: MAIN_BG }}>

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
        <header className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 h-[56px] sm:h-[60px] flex-shrink-0 relative z-20"
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
          <div className="hidden sm:block">
            <GlobalSearch />
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
            {theme === 'dark' ? <Sun className="w-4 h-4" style={{ color: '#f59e0b' }} /> : <Moon className="w-4 h-4" style={{ color: INACTIVE_COLOR }} />}
          </button>
          <NotificationDropdown />
        </header>

        <main className="flex-1 overflow-y-auto relative z-10 w-full min-h-0">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden flex-shrink-0 flex items-end justify-around relative z-30"
          style={{
            background: SIDEBAR_BG,
            borderTop: `1px solid ${BORDER_COLOR}`,
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
          }}>
          {[
            { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
            { href: '/invoices', label: 'Invoices', icon: FileText },
            { href: '/invoices/new', label: 'New', icon: Plus, isFab: true },
            { href: '/clients', label: 'Clients', icon: Users },
            { href: '', label: 'More', icon: Menu, isMore: true },
          ].map((item) => {
            const active = item.href && (pathname === item.href || (item.href !== '/dashboard' && item.href !== '/invoices/new' && pathname.startsWith(item.href)))

            // Center FAB button
            if (item.isFab) {
              return (
                <Link key="fab" href={item.href} className="flex flex-col items-center -mt-6 mb-2">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    style={{ background: '#a28ef9', boxShadow: '0 4px 16px rgba(162,142,249,0.4)' }}>
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold mt-1" style={{ color: '#a28ef9' }}>New</span>
                </Link>
              )
            }

            // More button opens sidebar
            if (item.isMore) {
              return (
                <button key="more" onClick={() => setSidebarOpen(true)}
                  className="flex flex-col items-center py-2 px-3 pb-3 active:scale-90 transition-transform">
                  <Menu className="w-6 h-6" style={{ color: sidebarOpen ? '#a28ef9' : INACTIVE_COLOR }} />
                  <span className="text-[10px] font-semibold mt-1" style={{ color: sidebarOpen ? '#a28ef9' : INACTIVE_COLOR }}>More</span>
                </button>
              )
            }

            // Regular nav items
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center py-2 px-3 pb-3 active:scale-90 transition-transform">
                <Icon className="w-6 h-6" style={{ color: active ? '#a28ef9' : INACTIVE_COLOR }} />
                <span className="text-[10px] font-semibold mt-1" style={{ color: active ? '#a28ef9' : INACTIVE_COLOR }}>{item.label}</span>
              </Link>
            )
          })}
        </nav>
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
