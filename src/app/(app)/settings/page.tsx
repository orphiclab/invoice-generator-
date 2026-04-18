'use client'

import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  User, Building2, Phone, MapPin, Users, Link2, FileText,
  Upload, Globe, Mail, Hash, Palette, Image as ImageIcon,
  Landmark, Trash2, Plus, PenSquare,
} from 'lucide-react'
import TeamSettingsPage from './team/page'
import { BankAccountManager } from '@/components/BankAccountManager'

interface Currency { id: string; code: string; symbol: string; name: string }

const inputStyle = { background: '#f9fafb', borderColor: '#e5e7eb', color: '#111827' }
const labelStyle = { color: '#6b7280' }

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'invoicing', label: 'Invoicing', icon: FileText },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'portal', label: 'Client Portal', icon: Link2 },
]

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', address: '' })
  const [invSettings, setInvSettings] = useState({ invoicePrefix: 'INV', defaultTaxRate: 0, defaultDueDays: 30, defaultNotes: '', defaultCurrencyId: '', bankDetails: '' })
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [savingInv, setSavingInv] = useState(false)

  // Company settings state
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    companyWebsite: '',
    taxId: '',
    registrationNo: '',
    brandColor: '#a28ef9',
    logoUrl: '',
  })
  const [savingCompany, setSavingCompany] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) {
          setForm({ name: d.name || '', email: d.email || '', company: d.company || '', phone: d.phone || '', address: d.address || '' })
          // Pre-fill company form from user data
          setCompanyForm(prev => ({
            ...prev,
            companyName: d.company || '',
            companyEmail: d.email || '',
            companyPhone: d.phone || '',
            companyAddress: d.address || '',
          }))
        }
      })
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && !d.error) {
          setInvSettings({
            invoicePrefix: d.invoicePrefix ?? 'INV',
            defaultTaxRate: d.defaultTaxRate ?? 0,
            defaultDueDays: d.defaultDueDays ?? 30,
            defaultNotes: d.defaultNotes ?? '',
            defaultCurrencyId: d.defaultCurrencyId ?? '',
            bankDetails: d.bankDetails ?? '',
          })
          // Load company-specific settings if available
          if (d.companyWebsite || d.taxId || d.registrationNo || d.brandColor) {
            setCompanyForm(prev => ({
              ...prev,
              companyWebsite: d.companyWebsite || '',
              taxId: d.taxId || '',
              registrationNo: d.registrationNo || '',
              brandColor: d.brandColor || '#a28ef9',
              logoUrl: d.logoUrl || '',
            }))
            if (d.logoUrl) setLogoPreview(d.logoUrl)
          }
        }
      })
    fetch('/api/currencies')
      .then(r => r.json())
      .then((d: Currency[]) => {
        if (Array.isArray(d)) {
          setCurrencies(d)
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

  async function saveCompanySettings(e: React.FormEvent) {
    e.preventDefault()
    setSavingCompany(true)
    try {
      // Save company info to user profile
      await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: companyForm.companyName,
          phone: companyForm.companyPhone,
          address: companyForm.companyAddress,
        }),
      })
      // Save extended company settings
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invSettings,
          companyWebsite: companyForm.companyWebsite,
          taxId: companyForm.taxId,
          registrationNo: companyForm.registrationNo,
          brandColor: companyForm.brandColor,
          logoUrl: companyForm.logoUrl,
        }),
      })
      toast.success('Company settings saved!')
    } catch {
      toast.error('Failed to save')
    }
    setSavingCompany(false)
  }

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

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setLogoPreview(dataUrl)
      setCompanyForm(prev => ({ ...prev, logoUrl: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const cardStyle = { border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto pb-24 lg:pb-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>Settings</h1>
        <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Manage your account and workspace</p>
      </div>

      {/* Tab Bar — scrollable on mobile */}
      <div className="pill-tab-bar mb-6 overflow-x-auto -mx-2 px-2 pb-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`pill-tab flex items-center gap-1.5 whitespace-nowrap${tab === id ? ' active' : ''}`}>
            <Icon style={{ width: 13, height: 13 }} />
            {label}
          </button>
        ))}
      </div>

      {/* Company Tab */}
      {tab === 'company' && (
        <form onSubmit={saveCompanySettings} className="space-y-6">
          {/* Logo & Branding */}
          <div className="bg-white rounded-2xl p-6" style={cardStyle}>
            <h2 className="text-base font-bold flex items-center gap-2 mb-5" style={{ color: '#111827' }}>
              <ImageIcon className="w-4 h-4" style={{ color: '#a28ef9' }} />
              Logo & Branding
            </h2>
            <div className="flex items-start gap-6">
              {/* Logo upload */}
              <div className="flex flex-col items-center gap-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-2xl flex items-center justify-center cursor-pointer transition-all hover:opacity-80 overflow-hidden"
                  style={{
                    background: logoPreview ? 'transparent' : '#f3f4f6',
                    border: '2px dashed #d1d5db',
                  }}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="Company logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-5 h-5 mx-auto mb-1" style={{ color: '#9ca3af' }} />
                      <p className="text-[10px]" style={{ color: '#9ca3af' }}>Upload</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <p className="text-[10px]" style={{ color: '#9ca3af' }}>Max 2MB, PNG/JPG</p>
              </div>
              {/* Brand color */}
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-sm flex items-center gap-1.5" style={labelStyle}>
                    <Palette className="w-3 h-3" /> Brand Color
                  </Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <input type="color" value={companyForm.brandColor}
                      onChange={e => setCompanyForm(f => ({ ...f, brandColor: e.target.value }))}
                      className="w-10 h-10 rounded-xl border-0 cursor-pointer" />
                    <input value={companyForm.brandColor}
                      onChange={e => setCompanyForm(f => ({ ...f, brandColor: e.target.value }))}
                      className="w-28 px-3 py-2 rounded-xl text-sm font-mono outline-none" style={inputStyle} />
                    <div className="flex gap-1.5">
                      {['#a28ef9', '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#222222'].map(c => (
                        <button key={c} type="button" onClick={() => setCompanyForm(f => ({ ...f, brandColor: c }))}
                          className="w-6 h-6 rounded-lg transition-transform hover:scale-110"
                          style={{ background: c, border: companyForm.brandColor === c ? '2px solid #111827' : '1px solid #e5e7eb' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white rounded-2xl p-6" style={cardStyle}>
            <h2 className="text-base font-bold flex items-center gap-2 mb-5" style={{ color: '#111827' }}>
              <Building2 className="w-4 h-4" style={{ color: '#a28ef9' }} />
              Company Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm" style={labelStyle}>Company Name</Label>
                <Input value={companyForm.companyName} onChange={e => setCompanyForm(f => ({ ...f, companyName: e.target.value }))}
                  placeholder="Acme Inc." className="text-gray-900" style={inputStyle} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1" style={labelStyle}>
                  <Mail className="w-3 h-3" /> Company Email
                </Label>
                <Input type="email" value={companyForm.companyEmail} onChange={e => setCompanyForm(f => ({ ...f, companyEmail: e.target.value }))}
                  placeholder="billing@company.com" className="text-gray-900" style={inputStyle} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1" style={labelStyle}>
                  <Phone className="w-3 h-3" /> Phone Number
                </Label>
                <Input value={companyForm.companyPhone} onChange={e => setCompanyForm(f => ({ ...f, companyPhone: e.target.value }))}
                  placeholder="+94 77 123 4567" className="text-gray-900" style={inputStyle} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1" style={labelStyle}>
                  <Globe className="w-3 h-3" /> Website
                </Label>
                <Input value={companyForm.companyWebsite} onChange={e => setCompanyForm(f => ({ ...f, companyWebsite: e.target.value }))}
                  placeholder="https://company.com" className="text-gray-900" style={inputStyle} />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-sm flex items-center gap-1" style={labelStyle}>
                  <MapPin className="w-3 h-3" /> Address
                </Label>
                <textarea value={companyForm.companyAddress} onChange={e => setCompanyForm(f => ({ ...f, companyAddress: e.target.value }))}
                  placeholder="123 Business St, Colombo 03, Sri Lanka" rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ ...inputStyle, border: '1px solid #e5e7eb' }} />
              </div>
            </div>
          </div>

          {/* Tax & Registration */}
          <div className="bg-white rounded-2xl p-6" style={cardStyle}>
            <h2 className="text-base font-bold flex items-center gap-2 mb-5" style={{ color: '#111827' }}>
              <Hash className="w-4 h-4" style={{ color: '#a28ef9' }} />
              Tax & Registration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm" style={labelStyle}>Tax ID / VAT Number</Label>
                <Input value={companyForm.taxId} onChange={e => setCompanyForm(f => ({ ...f, taxId: e.target.value }))}
                  placeholder="e.g. LK123456789" className="text-gray-900" style={inputStyle} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm" style={labelStyle}>Business Registration No.</Label>
                <Input value={companyForm.registrationNo} onChange={e => setCompanyForm(f => ({ ...f, registrationNo: e.target.value }))}
                  placeholder="e.g. PV-12345" className="text-gray-900" style={inputStyle} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={savingCompany} className="btn-brand h-9 px-8 text-sm">
              {savingCompany ? 'Saving…' : 'Save Company Settings'}
            </button>
          </div>
        </form>
      )}

      {/* Invoicing Defaults Tab */}
      {tab === 'invoicing' && (
        <form onSubmit={saveInvSettings} className="space-y-6">
          <div className="bg-white rounded-2xl p-6" style={cardStyle}>
            <h2 className="text-base font-bold flex items-center gap-2 mb-5" style={{ color: '#111827' }}>
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
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }}
                >
                  <option value="">Select currency…</option>
                  {currencies.map(c => (
                    <option key={c.id} value={c.id}>{c.code} ({c.symbol}) — {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-sm" style={labelStyle}>Default Notes / Payment Terms</Label>
                <textarea value={invSettings.defaultNotes ?? ''} onChange={e => setInvSettings(s => ({ ...s, defaultNotes: e.target.value }))} rows={3} placeholder="Payment due within 30 days..."
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ ...inputStyle, border: '1px solid #e5e7eb' }} />
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

      {/* Bank Accounts Section in Invoicing */}
      {tab === 'invoicing' && (
        <BankAccountManager />
      )}

      {/* Profile Tab */}
      {tab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl p-6" style={cardStyle}>
            <h2 className="text-base font-bold flex items-center gap-2 mb-5" style={{ color: '#111827' }}>
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

          <div className="bg-white rounded-2xl p-6" style={cardStyle}>
            <h2 className="text-base font-bold flex items-center gap-2 mb-5" style={{ color: '#111827' }}>
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
        <div className="bg-white rounded-2xl p-6" style={cardStyle}>
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
    <div className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div>
        <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#111827' }}>
          <Link2 className="w-4 h-4" style={{ color: '#a28ef9' }} /> Client Portal
        </h2>
        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Generate a shareable link for clients to view their invoices and estimates</p>
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
      <button onClick={generate} disabled={generating} className="btn-brand h-9 px-5 text-sm">
        {generating ? 'Generating...' : 'Generate Portal Link'}
      </button>

      {generatedUrl && (
        <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <p className="text-xs font-medium" style={{ color: '#9B8AFF' }}>Portal Link Ready</p>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono flex-1 truncate" style={{ color: '#6b7280' }}>{generatedUrl}</code>
            <Button onClick={copyUrl} variant="ghost" className="text-xs h-8 px-3 flex-shrink-0" style={{ color: copied ? '#16a34a' : '#9B8AFF' }}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

