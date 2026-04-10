'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Building2, Phone, MapPin, Users, Link2, FileText } from 'lucide-react'
import TeamSettingsPage from './team/page'

interface Currency { id: string; code: string; symbol: string; name: string }

const inputStyle = { background: '#f9fafb', borderColor: '#e5e7eb', color: '#111827' }
const labelStyle = { color: 'rgba(255,255,255,0.55)' }

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'invoicing', label: 'Invoicing', icon: FileText },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'portal', label: 'Client Portal', icon: Link2 },
]

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', address: '' })
  const [invSettings, setInvSettings] = useState({ invoicePrefix: 'INV', defaultTaxRate: 0, defaultDueDays: 30, defaultNotes: '', defaultCurrencyId: '' })
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [savingInv, setSavingInv] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) setForm({ name: d.name || '', email: d.email || '', company: d.company || '', phone: d.phone || '', address: d.address || '' })
      })
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && !d.error) setInvSettings({
          invoicePrefix: d.invoicePrefix ?? 'INV',
          defaultTaxRate: d.defaultTaxRate ?? 0,
          defaultDueDays: d.defaultDueDays ?? 30,
          defaultNotes: d.defaultNotes ?? '',
          defaultCurrencyId: d.defaultCurrencyId ?? '',
        })
      })
    fetch('/api/currencies')
      .then(r => r.json())
      .then((d: Currency[]) => {
        if (Array.isArray(d)) {
          setCurrencies(d)
          // If no default is saved yet, prefer LKR
          setInvSettings(prev => {
            if (!prev.defaultCurrencyId) {
              const lkr = d.find(c => c.code === 'LKR')
              return lkr ? { ...prev, defaultCurrencyId: lkr.id } : prev
            }
            return prev
          })
        }
      })
  }, [])

  async function saveInvSettings(e: React.FormEvent) {
    e.preventDefault()
    setSavingInv(true)
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invSettings),
    })
    if (res.ok) toast.success('Invoice defaults saved!')
    else toast.error('Failed to save')
    setSavingInv(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) toast.success('Profile updated!')
    else toast.error('Failed to update profile')
    setLoading(false)
  }

  const tabStyle = (active: boolean) => ({
    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
    borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer',
    transition: 'all 0.15s',
    background: active ? '#a28ef9' : 'transparent',
    color: active ? 'white' : '#6b7280',
    boxShadow: active ? '0 2px 8px rgba(124,58,237,0.4)' : 'none',
  })

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
      <h1 className="text-gray-900">Settings</h1>
        <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Manage your account and workspace</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: '#f9fafb' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={tabStyle(tab === id)}>
            <Icon style={{ width: 14, height: 14 }} />
            {label}
          </button>
        ))}
      </div>

      {/* Invoicing Defaults Tab */}
      {tab === 'invoicing' && (
        <form onSubmit={saveInvSettings} className="space-y-6">
          <div className="rounded-2xl p-6" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h2 className="text-gray-900">
              <FileText className="w-4 h-4" style={{ color: '#a28ef9' }} />
              Invoice Defaults
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm" style={labelStyle}>Invoice Number Prefix</Label>
                <div className="flex items-center gap-2">
                  <Input value={invSettings.invoicePrefix} onChange={e => setInvSettings(s => ({ ...s, invoicePrefix: e.target.value.toUpperCase() }))} className="text-gray-900" maxLength={6} />
                  <span className="text-sm whitespace-nowrap" style={{ color: '#9ca3af' }}>→ {invSettings.invoicePrefix}-0001</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm" style={labelStyle}>Default Tax Rate (%)</Label>
                <Input type="number" min={0} max={100} step={0.1} value={invSettings.defaultTaxRate} onChange={e => setInvSettings(s => ({ ...s, defaultTaxRate: parseFloat(e.target.value) || 0 }))} className="text-gray-900" style={inputStyle} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm" style={labelStyle}>Default Due Days</Label>
                <Input type="number" min={1} max={365} value={invSettings.defaultDueDays} onChange={e => setInvSettings(s => ({ ...s, defaultDueDays: parseInt(e.target.value) || 30 }))} className="text-gray-900" style={inputStyle} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm" style={labelStyle}>Default Currency</Label>
                <select
                  value={invSettings.defaultCurrencyId}
                  onChange={e => setInvSettings(s => ({ ...s, defaultCurrencyId: e.target.value }))}
                  className="text-gray-900"
                  style={{ background: '#f9fafb', borderColor: '#e5e7eb', border: '1px solid #e5e7eb', color: '#111827' }}
                >
                  <option value="">Select currency…</option>
                  {currencies.map(c => (
                    <option key={c.id} value={c.id}>{c.code} ({c.symbol}) — {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-sm" style={labelStyle}>Default Notes / Payment Terms</Label>
                <textarea value={invSettings.defaultNotes ?? ''} onChange={e => setInvSettings(s => ({ ...s, defaultNotes: e.target.value }))} rows={3} placeholder="Payment due within 30 days. Bank details: ..." className="text-gray-900" style={{ ...inputStyle, border: `1px solid #e5e7eb` }} />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingInv} className="btn-brand h-9 px-8 text-sm">
              {savingInv ? 'Saving…' : 'Save Defaults'}
            </button>
          </div>
        </form>
      )}

      {/* Profile Tab */}
      {tab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl p-6" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h2 className="text-gray-900">
              <User className="w-4 h-4" style={{ color: '#a28ef9' }} />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm" style={labelStyle}>Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="text-gray-900" style={inputStyle} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm" style={labelStyle}>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="text-gray-900" style={inputStyle} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h2 className="text-gray-900">
              <Building2 className="w-4 h-4" style={{ color: '#a28ef9' }} />
              Business Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm" style={labelStyle}><Building2 className="w-3 h-3 inline mr-1" />Company Name</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="text-gray-900" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm" style={labelStyle}><Phone className="w-3 h-3 inline mr-1" />Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="text-gray-900" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-sm" style={labelStyle}><MapPin className="w-3 h-3 inline mr-1" />Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="text-gray-900" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-brand h-9 px-8 text-sm">
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Team Tab */}
      {tab === 'team' && (
        <div className="rounded-2xl p-6" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
          <TeamSettingsPage />
        </div>
      )}

      {/* Client Portal Tab */}
      {tab === 'portal' && (
        <PortalSettings />
      )}
    </div>
  )
}

function PortalSettings() {
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [expiryDays, setExpiryDays] = useState('30')
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : []))
  }, [])

  async function generate() {
    if (!selectedClient) { toast.error('Select a client'); return }
    setGenerating(true)
    try {
      const res = await fetch('/api/portal/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClient, expiryDays: parseInt(expiryDays) }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      setGeneratedUrl(data.url)
      toast.success('Portal link generated!')
    } catch {
      toast.error('Failed to generate')
    } finally {
      setGenerating(false)
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const selectStyle = { background: '#ffffff', border: '1px solid #e5e7eb', color: '#111827', padding: '10px 12px', borderRadius: '12px', fontSize: '14px', outline: 'none', width: '100%' }

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-gray-900">
          <Link2 className="w-4 h-4" style={{ color: '#a28ef9' }} /> Client Portal
        </h2>
        <p className="text-sm" style={{ color: '#6b7280' }}>Generate a shareable link for clients to view their invoices and estimates</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium block mb-1.5" style={{ color: '#6b7280' }}>Client</label>
          <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} style={selectStyle}>
            <option value="">Select client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: '#6b7280' }}>Expires in (days)</label>
          <input type="number" min="1" max="365" value={expiryDays} onChange={e => setExpiryDays(e.target.value)} style={selectStyle} />
        </div>
      </div>
      <Button onClick={generate} disabled={generating} className="text-gray-900" style={{ background: 'linear-gradient(135deg, #6B50EE, #3B82F6)' }}>
        {generating ? 'Generating...' : 'Generate Portal Link'}
      </Button>

      {generatedUrl && (
        <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <p className="text-xs font-medium" style={{ color: '#9B8AFF' }}>Portal Link Ready</p>
          <div className="flex items-center gap-2">
            <code className="text-gray-900" style={{ color: 'rgba(255,255,255,0.5)' }}>{generatedUrl}</code>
            <Button onClick={copyUrl} variant="ghost" className="text-xs h-8 px-3 flex-shrink-0" style={{ color: copied ? '#16a34a' : '#9B8AFF' }}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
