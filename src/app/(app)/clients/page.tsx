'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, Users, Mail, Phone, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Client { id: string; name: string; email: string; phone?: string; company?: string; address?: string; _count?: { invoices: number } }

const inputStyle = { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }
const labelStyle = { color: 'rgba(255,255,255,0.55)' }
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
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Clients</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{clients.length} clients total</p>
        </div>
        <button onClick={openCreate} className="btn-brand h-9 px-5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
        <input placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 w-full rounded-xl text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>

      {/* Slide-out form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative w-full max-w-md h-full flex flex-col" style={{ background: '#0E1017', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <h2 className="text-lg font-bold text-white">{editing ? 'Edit Client' : 'New Client'}</h2>
            </div>
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              {(['name', 'email', 'phone', 'company', 'address'] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label className="text-sm capitalize" style={labelStyle}>{field}{field === 'name' || field === 'email' ? ' *' : ''}</Label>
                  <Input
                    type={field === 'email' ? 'email' : 'text'}
                    value={form[field] || ''}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="h-10 text-white"
                    style={inputStyle}
                    required={field === 'name' || field === 'email'}
                    placeholder={field === 'address' ? '123 Main St, City, Country' : ''}
                  />
                </div>
              ))}
            </form>
            <div className="p-6 border-t flex gap-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <Button variant="outline" onClick={closeForm} className="flex-1 border-border" style={{ color: 'rgba(255,255,255,0.45)' }}>Cancel</Button>
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
          <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: '#7B61FF', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-12 h-12 mb-4 opacity-20" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>No clients yet</p>
          <Button onClick={openCreate} variant="outline" size="sm" className="text-xs border-border">Add your first client</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
          <div key={c.id} className="rounded-2xl p-5 hover:scale-[1.01] transition-all duration-200 group" style={{ background: '#16191F', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg, #4B30CE, #1D4ED8)' }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteClient(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: 'hsl(0 72% 65%)' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="font-semibold text-white">{c.name}</p>
              {c.company && <p className="text-xs font-medium mt-0.5" style={{ color: '#A78BFA' }}><Building2 className="w-3 h-3 inline mr-1" />{c.company}</p>}
              <div className="mt-3 space-y-1">
                <p className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}><Mail className="w-3 h-3" />{c.email}</p>
                {c.phone && <p className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}><Phone className="w-3 h-3" />{c.phone}</p>}
              </div>
              <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}>
                {c._count?.invoices ?? 0} invoice{c._count?.invoices !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
