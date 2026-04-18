'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Package, Plus, Pencil, Trash2, X, Search, Tag,
  DollarSign, Archive, ToggleLeft, ToggleRight,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string | null
  unitPrice: number
  unit: string
  category: string | null
  taxable: boolean
  isActive: boolean
  createdAt: string
  trackInventory: boolean
  stockQuantity: number
  lowStockThreshold: number
  sku: string | null
}

const UNITS = ['unit', 'hour', 'day', 'week', 'month', 'project', 'piece', 'kg', 'liter']
const CATEGORIES = ['Development', 'Design', 'Marketing', 'Consulting', 'Support', 'Hardware', 'Software', 'Other']

const emptyForm = { 
  name: '', description: '', unitPrice: '', unit: 'unit', category: '', taxable: true,
  trackInventory: false, stockQuantity: '0', lowStockThreshold: '5', sku: ''
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all')

  async function fetchProducts() {
    const res = await fetch('/api/products')
    if (res.ok) setProducts(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(p: Product) {
    setEditId(p.id)
    setForm({
      name: p.name,
      description: p.description || '',
      unitPrice: String(p.unitPrice),
      unit: p.unit,
      category: p.category || '',
      taxable: p.taxable,
      trackInventory: p.trackInventory,
      stockQuantity: String(p.stockQuantity),
      lowStockThreshold: String(p.lowStockThreshold),
      sku: p.sku || '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editId ? `/api/products/${editId}` : '/api/products'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { toast.error('Failed to save product'); return }
      toast.success(editId ? 'Product updated!' : 'Product created!')
      setShowModal(false)
      fetchProducts()
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Product deleted')
      fetchProducts()
    }
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    })
    toast.success(p.isActive ? 'Archived' : 'Restored')
    fetchProducts()
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ? true : filter === 'active' ? p.isActive : !p.isActive
    return matchSearch && matchFilter
  })

  const activeCount = products.filter(p => p.isActive).length
  const archivedCount = products.filter(p => !p.isActive).length

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: '#a28ef9', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: '#111827' }}>
            Products & Services
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
            Save frequently used items for quick invoicing
          </p>
        </div>
        <button onClick={openCreate} className="btn-brand h-9 px-4 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p className="text-2xl font-extrabold" style={{ color: '#111827' }}>{products.length}</p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: '#6b7280' }}>Total Items</p>
        </div>
        <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p className="text-2xl font-extrabold" style={{ color: '#22c55e' }}>{activeCount}</p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: '#6b7280' }}>Active</p>
        </div>
        <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #f0f2f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p className="text-2xl font-extrabold" style={{ color: '#9ca3af' }}>{archivedCount}</p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: '#6b7280' }}>Archived</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full h-9 pl-10 pr-4 rounded-2xl text-sm"
            style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
          />
        </div>
        <div className="pill-tab-bar">
          {([['all', 'All'], ['active', 'Active'], ['archived', 'Archived']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} className={`pill-tab${filter === key ? ' active' : ''}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl" style={{ border: '1px solid #f0f2f0' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f5f3ff' }}>
            <Package className="w-7 h-7" style={{ color: '#a28ef9' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#374151' }}>No products yet</p>
          <p className="text-xs mt-1 mb-4" style={{ color: '#9ca3af' }}>Add your first product or service</p>
          <button onClick={openCreate} className="btn-brand h-8 px-4 text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(p => (
            <div key={p.id}
              className="bg-white rounded-2xl p-5 transition-all hover:shadow-md group"
              style={{
                border: '1px solid #f0f2f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                opacity: p.isActive ? 1 : 0.6,
              }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: '#f5f3ff' }}>
                    <Package className="w-4.5 h-4.5" style={{ color: '#a28ef9', width: 18, height: 18 }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#111827' }}>{p.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {p.category && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: '#f3f4f6', color: '#6b7280' }}>
                          <Tag className="w-2.5 h-2.5" /> {p.category}
                        </span>
                      )}
                      {p.sku && (
                        <span className="text-[10px] font-medium" style={{ color: '#9ca3af' }}>SKU: {p.sku}</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100"
                    style={{ color: '#6b7280' }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggleActive(p)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100"
                    style={{ color: '#6b7280' }}>
                    {p.isActive ? <Archive className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50"
                    style={{ color: '#ef4444' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {p.description && (
                <p className="text-xs mb-3 line-clamp-2" style={{ color: '#6b7280' }}>{p.description}</p>
              )}

              {p.trackInventory && (
                <div className="mb-4 p-2.5 rounded-2xl bg-gray-50 flex items-center justify-between" style={{ border: '1px solid #e5e7eb' }}>
                  <div className="flex items-center gap-2">
                    <Archive className="w-3.5 h-3.5" style={{ color: p.stockQuantity <= p.lowStockThreshold ? '#ef4444' : '#6b7280' }} />
                    <span className="text-xs font-semibold" style={{ color: '#374151' }}>Stock Level</span>
                  </div>
                  <span className={`text-xs font-bold ${p.stockQuantity <= p.lowStockThreshold ? 'text-red-500' : 'text-gray-900'}`}>
                    {p.stockQuantity} {p.unit}s
                  </span>
                </div>
              )}

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xl font-extrabold" style={{ color: '#111827' }}>
                    Rs {p.unitPrice.toLocaleString('en-LK')}
                  </p>
                  <p className="text-[11px]" style={{ color: '#9ca3af' }}>per {p.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  {p.taxable && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#fff7ed', color: '#f97316' }}>
                      Taxable
                    </span>
                  )}
                  {!p.isActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#f3f4f6', color: '#9ca3af' }}>
                      Archived
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl" style={{ border: '1px solid #f0f2f0' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: '#111827' }}>
                {editId ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
                style={{ color: '#6b7280' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: '#6b7280' }}>Product / Service Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Web Development" required
                  className="w-full h-10 px-4 rounded-2xl text-sm"
                  style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: '#6b7280' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this product or service..."
                  rows={2} className="w-full px-4 py-2.5 rounded-2xl text-sm"
                  style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: '#6b7280' }}>Unit Price (Rs) *</label>
                  <input type="number" step="0.01" min="0" value={form.unitPrice}
                    onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))}
                    placeholder="0.00" required
                    className="w-full h-10 px-4 rounded-2xl text-sm"
                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: '#6b7280' }}>Unit</label>
                  <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full h-10 px-4 rounded-2xl text-sm"
                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: '#6b7280' }}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full h-10 px-4 rounded-2xl text-sm"
                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <option value="">None</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: '#6b7280' }}>Taxable</label>
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, taxable: !f.taxable }))}
                    className="w-full h-10 px-4 rounded-2xl text-sm flex items-center gap-2"
                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    {form.taxable
                      ? <ToggleRight className="w-5 h-5" style={{ color: '#22c55e' }} />
                      : <ToggleLeft className="w-5 h-5" style={{ color: '#9ca3af' }} />}
                    <span style={{ color: form.taxable ? '#22c55e' : '#9ca3af' }}>
                      {form.taxable ? 'Yes' : 'No'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold" style={{ color: '#111827' }}>Track Inventory / Stock</label>
                  <p className="text-[10px]" style={{ color: '#9ca3af' }}>Enable to deduct stock on invoices</p>
                </div>
                <button type="button" onClick={() => setForm(f => ({ ...f, trackInventory: !f.trackInventory }))}>
                  {form.trackInventory
                    ? <ToggleRight className="w-7 h-7" style={{ color: '#a28ef9' }} />
                    : <ToggleLeft className="w-7 h-7" style={{ color: '#e5e7eb' }} />}
                </button>
              </div>

              {form.trackInventory && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold" style={{ color: '#6b7280' }}>Current Stock *</label>
                      <input type="number" step="1" value={form.stockQuantity}
                        onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))}
                        placeholder="0" required
                        className="w-full h-10 px-4 rounded-2xl text-sm"
                        style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold" style={{ color: '#6b7280' }}>Low Stock Alert Threshold</label>
                      <input type="number" step="1" value={form.lowStockThreshold}
                        onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))}
                        placeholder="5" required
                        className="w-full h-10 px-4 rounded-2xl text-sm"
                        style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: '#6b7280' }}>SKU (Stock Keeping Unit)</label>
                    <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                      placeholder="e.g. PRD-1001"
                      className="w-full h-10 px-4 rounded-2xl text-sm"
                      style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }} />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="h-9 px-5 rounded-2xl text-sm font-semibold"
                  style={{ color: '#6b7280', border: '1px solid #e5e7eb' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-brand h-9 px-6 text-sm">
                  {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
