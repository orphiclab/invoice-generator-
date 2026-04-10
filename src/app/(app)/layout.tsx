'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { GlobalSearch } from '@/components/GlobalSearch'
import {
  LayoutDashboard, FileText, Users, Settings, Zap, LogOut,
  Menu, X, Plus, Receipt, ClipboardList, RefreshCw, BarChart3,
  CreditCard, Bell, ChevronRight,
} from 'lucide-react'

// Exact neutral dark colors — no purple in backgrounds
const SIDEBAR_BG = '#0E1017'     // neutral dark — same as topbar
const MAIN_BG = '#111318'        // slightly lighter neutral dark
const TOPBAR_BG = '#0E1017'      // same as sidebar
const BORDER_COLOR = 'rgba(255,255,255,0.06)'
const ACTIVE_BG = 'rgba(255,255,255,0.07)'   // no purple — subtle white tint
const ACTIVE_COLOR = '#7B61FF'               // purple accent TEXT only
const INACTIVE_COLOR = 'rgba(255,255,255,0.38)'
const LABEL_COLOR = 'rgba(255,255,255,0.18)'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Billing',
    items: [
      { href: '/invoices', label: 'Invoices', icon: FileText },
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
      { href: '/clients', label: 'Clients', icon: Users },
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
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7B61FF, #4F35CC)', boxShadow: '0 4px 12px rgba(123,97,255,0.4)' }}>
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-white leading-none tracking-tight">InvoiceFlow</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Smart Billing</p>
        </div>
      </div>

      {/* New Invoice */}
      <Link href="/invoices/new" onClick={() => setSidebarOpen(false)} className="mb-6 px-1">
        <button className="w-full h-9 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #7B61FF, #4F35CC)', boxShadow: '0 4px 16px rgba(123,97,255,0.3)' }}>
          <Plus className="w-3.5 h-3.5" /> New Invoice
        </button>
      </Link>

      {/* Nav Groups */}
      <nav className="flex-1 space-y-5 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-1 px-3"
              style={{ color: LABEL_COLOR }}>{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                return (
                  <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150"
                    style={active
                      ? { background: ACTIVE_BG, color: ACTIVE_COLOR }
                      : { color: INACTIVE_COLOR }}>
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? ACTIVE_COLOR : INACTIVE_COLOR }} />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight className="w-3 h-3" style={{ color: ACTIVE_COLOR, opacity: 0.5 }} />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="pt-3 mt-2" style={{ borderTop: `1px solid ${BORDER_COLOR}` }}>
        <button onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium w-full transition-colors hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.28)' }}>
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: MAIN_BG }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col flex-shrink-0"
        style={{ width: '216px', background: SIDEBAR_BG, borderRight: `1px solid ${BORDER_COLOR}` }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col"
            style={{ width: '216px', background: SIDEBAR_BG, borderRight: `1px solid ${BORDER_COLOR}` }}>
            <button className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10"
              onClick={() => setSidebarOpen(false)} style={{ color: 'rgba(255,255,255,0.4)' }}>
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 h-[56px] flex-shrink-0"
          style={{ background: TOPBAR_BG, borderBottom: `1px solid ${BORDER_COLOR}` }}>
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-white/10" onClick={() => setSidebarOpen(true)}
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <GlobalSearch />
          <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors relative hover:bg-white/8"
            style={{ color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)' }}>
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#7B61FF' }} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
