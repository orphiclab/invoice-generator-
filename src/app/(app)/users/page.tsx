'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Users, Plus, Shield, Eye, Pencil, Trash2, X,
  UserCheck, UserX, KeyRound, ShieldCheck, ShieldAlert,
  Briefcase, Lock,
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'SALES' | 'VIEWER'
  isActive: boolean
  createdAt: string
  phone?: string
}

const ROLE_CONFIG = {
  ADMIN:   { label: 'Admin',   color: '#a28ef9', bg: '#f5f3ff', icon: ShieldCheck, desc: 'Full access — company owner' },
  MANAGER: { label: 'Manager', color: '#3b82f6', bg: '#eff6ff', icon: ShieldAlert, desc: 'Invoices, clients, expenses, reports' },
  SALES:   { label: 'Sales',   color: '#22c55e', bg: '#f0fdf4', icon: Briefcase,   desc: 'Invoices & clients only' },
  VIEWER:  { label: 'Viewer',  color: '#6b7280', bg: '#f9fafb', icon: Eye,         desc: 'Read-only access' },
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [resetModal, setResetModal] = useState<string | null>(null)
  const [resetPw, setResetPw] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SALES', phone: '' })
  const [saving, setSaving] = useState(false)

  async function loadUsers() {
    const res = await fetch('/api/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success(`${form.name} added as ${form.role}`)
      setShowModal(false)
      setForm({ name: '', email: '', password: '', role: 'SALES', phone: '' })
      loadUsers()
    } finally { setSaving(false) }
  }

  async function toggleActive(user: User) {
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive }),
    })
    if (res.ok) {
      toast.success(`${user.name} ${user.isActive ? 'deactivated' : 'activated'}`)
      loadUsers()
    }
  }

  async function changeRole(userId: string, role: string) {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    if (res.ok) {
      toast.success('Role updated')
      loadUsers()
    }
  }

  async function deleteUser(user: User) {
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return
    const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success(`${user.name} removed`)
      loadUsers()
    }
  }

  async function handleResetPassword(userId: string) {
    if (resetPw.length < 6) { toast.error('Password must be at least 6 characters'); return }
    const res = await fetch(`/api/users/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: resetPw }),
    })
    if (res.ok) {
      toast.success('Password reset successfully')
      setResetModal(null)
      setResetPw('')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
    </div>
  )

  const admin = users.find(u => u.role === 'ADMIN')
  const members = users.filter(u => u.role !== 'ADMIN')

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>
            <Users className="w-6 h-6 inline-block mr-2" style={{ color: '#a28ef9' }} />
            User Management
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Manage team members and permissions</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-brand h-9 px-4 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Role permissions overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Object.entries(ROLE_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon
          const count = users.filter(u => u.role === key).length
          return (
            <div key={key} className="bg-white rounded-2xl p-4" style={{ border: '1px solid #f0f2f0' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: cfg.bg }}>
                  <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: '#111827' }}>{cfg.label}</p>
                  <p className="text-[10px]" style={{ color: '#9ca3af' }}>{count} user{count !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <p className="text-[10px]" style={{ color: '#6b7280' }}>{cfg.desc}</p>
            </div>
          )
        })}
      </div>

      {/* Admin card */}
      {admin && (
        <div className="bg-white rounded-2xl p-5 mb-4" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #a28ef9, #7c5cfc)' }}>
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#111827' }}>{admin.name} <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ml-1" style={{ background: '#f5f3ff', color: '#a28ef9' }}>Admin</span></p>
                <p className="text-xs" style={{ color: '#6b7280' }}>{admin.email}</p>
              </div>
            </div>
            <Shield className="w-5 h-5" style={{ color: '#a28ef9' }} />
          </div>
        </div>
      )}

      {/* Team members */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="text-sm font-bold" style={{ color: '#111827' }}>Team Members</h2>
          <p className="text-[11px]" style={{ color: '#9ca3af' }}>{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 mx-auto mb-2" style={{ color: '#d1d5db' }} />
            <p className="text-sm font-semibold" style={{ color: '#374151' }}>No team members yet</p>
            <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Add sales reps, managers, or viewers</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#f9fafb' }}>
            {members.map(user => {
              const cfg = ROLE_CONFIG[user.role]
              const Icon = cfg.icon
              return (
                <div key={user.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs ${!user.isActive ? 'opacity-40' : ''}`}
                      style={{ background: cfg.color }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={!user.isActive ? 'opacity-50' : ''}>
                      <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                        {user.name}
                        {!user.isActive && <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#ef4444' }}>Deactivated</span>}
                      </p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Role badge */}
                    <select value={user.role} onChange={e => changeRole(user.id, e.target.value)}
                      className="text-[11px] font-bold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      <option value="MANAGER">Manager</option>
                      <option value="SALES">Sales</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    {/* Toggle active */}
                    <button onClick={() => toggleActive(user)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title={user.isActive ? 'Deactivate' : 'Activate'}>
                      {user.isActive ? <UserCheck className="w-3.5 h-3.5" style={{ color: '#22c55e' }} /> : <UserX className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />}
                    </button>
                    {/* Reset password */}
                    <button onClick={() => { setResetModal(user.id); setResetPw('') }} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Reset password">
                      <KeyRound className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
                    </button>
                    {/* Delete */}
                    <button onClick={() => deleteUser(user)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete user">
                      <Trash2 className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold" style={{ color: '#111827' }}>Add Team Member</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" style={{ color: '#6b7280' }} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Full Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Password *</label>
                <input required type="password" minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }}
                  placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#6b7280' }}>Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: '#6b7280' }}>Role *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MANAGER', 'SALES', 'VIEWER'] as const).map(r => {
                    const cfg = ROLE_CONFIG[r]
                    const Icon = cfg.icon
                    return (
                      <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                        className="p-3 rounded-xl text-center transition-all"
                        style={{
                          border: form.role === r ? `2px solid ${cfg.color}` : '1px solid #e5e7eb',
                          background: form.role === r ? cfg.bg : '#fff',
                        }}>
                        <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: cfg.color }} />
                        <p className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-brand w-full h-10 text-sm">
                {saving ? 'Creating...' : 'Add User'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setResetModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#111827' }}>
                <Lock className="w-4 h-4" style={{ color: '#f59e0b' }} /> Reset Password
              </h2>
              <button onClick={() => setResetModal(null)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" style={{ color: '#6b7280' }} /></button>
            </div>
            <input type="password" placeholder="New password (min. 6 chars)" value={resetPw} onChange={e => setResetPw(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none mb-4" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }} />
            <button onClick={() => handleResetPassword(resetModal)} className="btn-brand w-full h-10 text-sm">
              Reset Password
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
