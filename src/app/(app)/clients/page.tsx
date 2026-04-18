'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, Users, Mail, Phone, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Client { id: string; name: string; email: string; phone?: string; company?: string; address?: string; _count?: { invoices: number } }

const inputStyle = { background: '#f9fafb', borderColor: '#e5e7eb', color: '#111827' }
const labelStyle = { color: '#6b7280' }
const blank: Omit<Client, 'id'> = { name: '', email: '', phone: '', company: '', address: '' }

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/clients')
    const d = await r.json()
    setClients(Array.isArray(d) ? d : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.company || '').toLowerCase().includes(q)
  })

  function openCreate() { setEditing(null); setForm(blank); setShowForm(true) }
  function openEdit(c: Client) { setEditing(c); setForm({ name: c.name, email: c.email, phone: c.phone || '', company: c.company || '', address: c.address || '' }); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditing(null); setForm(blank) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const url = editing ? `/api/clients/${editing.id}` : '/api/clients'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast.success(editing ? 'Client updated' : 'Client created'); closeForm(); load() }
    else { const d = await res.json(); toast.error(d.error || 'Error saving client') }
    setSaving(false)
  }

  async function deleteClient(id: string) {
    if (!confirm('Delete client and all their invoices?')) return
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Client deleted'); load() }
    else toast.error('Failed to delete')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>Clients</h1>
          <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{clients.length} clients total</p>
        </div>
        <button onClick={openCreate} className="btn-brand h-9 px-4 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
        <input placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-9 rounded-xl text-sm outline-none"
          style={{ background: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }} />
      </div>

      {/* Slide-out form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative w-full max-w-md h-full flex flex-col" style={{ background: '#ffffff', borderLeft: '1px solid #e5e7eb' }}>
            <div className="p-6 border-b" style={{ borderColor: '#e5e7eb' }}>
              <h2 className="text-base font-bold" style={{ color: '#111827' }}>{editing ? 'Edit Client' : 'New Client'}</h2>
            </div>
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              {(['name', 'email', 'phone', 'company', 'address'] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label className="text-sm capitalize" style={labelStyle}>{field}{field === 'name' || field === 'email' ? ' *' : ''}</Label>
                  <Input
                    type={field === 'email' ? 'email' : 'text'}
                    value={form[field] || ''}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="text-gray-900"
                    style={inputStyle}
                    required={field === 'name' || field === 'email'}
                    placeholder={field === 'address' ? '123 Main St, City, Country' : ''}
                  />
                </div>
              ))}
            </form>
            <div className="p-6 border-t flex gap-3" style={{ borderColor: '#e5e7eb' }}>
              <Button variant="outline" onClick={closeForm} className="flex-1 border-border" style={{ color: '#6b7280' }}>Cancel</Button>
              <button onClick={handleSave as unknown as () => void} disabled={saving} className="btn-brand flex-1 text-sm">
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-16 text-center"
          style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f9fafb' }}>
            <Users className="w-7 h-7" style={{ color: '#d1d5db' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#374151' }}>No clients yet</p>
          <p className="text-xs mt-1 mb-4" style={{ color: '#9ca3af' }}>Add your first client to start creating invoices</p>
          <button onClick={openCreate} className="btn-brand h-8 px-4 text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 hover:shadow-md transition-all duration-200 group"
              style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="flex items-start justify-between mb-4">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #a28ef9, #7c5cfc)' }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: '#6b7280' }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteClient(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: '#ef4444' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-bold" style={{ color: '#111827' }}>{c.name}</p>
              {c.company && <p className="text-xs font-medium mt-0.5 flex items-center gap-1" style={{ color: '#a28ef9' }}><Building2 className="w-3 h-3" />{c.company}</p>}
              <div className="mt-3 space-y-1.5">
                <p className="text-xs flex items-center gap-1.5" style={{ color: '#6b7280' }}><Mail className="w-3 h-3 flex-shrink-0" /><span className="truncate">{c.email}</span></p>
                {c.phone && <p className="text-xs flex items-center gap-1.5" style={{ color: '#6b7280' }}><Phone className="w-3 h-3 flex-shrink-0" />{c.phone}</p>}
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #f3f4f6' }}>
                <span className="text-[11px]" style={{ color: '#9ca3af' }}>{c._count?.invoices ?? 0} invoice{c._count?.invoices !== 1 ? 's' : ''}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#f5f3ff', color: '#a28ef9' }}>Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
