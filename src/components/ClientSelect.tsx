'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, ChevronDown, X, User } from 'lucide-react'

interface Client { id: string; name: string; company?: string; email?: string }

interface Props {
  clients: Client[]
  value: string            // selected client id
  onChange: (id: string) => void
  required?: boolean
  placeholder?: string
}

export function ClientSelect({ clients, value, onChange, required, placeholder = 'Search clients…' }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = clients.find(c => c.id === value)

  const filtered = query.trim()
    ? clients.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.company ?? '').toLowerCase().includes(query.toLowerCase()) ||
        (c.email ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : clients

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  // Close on Escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); setQuery('') }
  }, [])

  function select(id: string) {
    onChange(id)
    setOpen(false)
    setQuery('')
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div ref={wrapperRef} className="relative w-full" onKeyDown={handleKeyDown}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full h-9 flex items-center justify-between px-3 rounded-2xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/40"
        style={{
          background: '#ffffff',
          borderColor: open ? '#a28ef9' : '#e5e7eb',
          color: selected ? '#111827' : '#9ca3af',
        }}
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#a28ef9,#60a5fa)' }}>
                {selected.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate font-medium text-gray-900">
                {selected.name}{selected.company ? <span className="text-gray-400 ml-1">· {selected.company}</span> : null}
              </span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <span className="flex items-center gap-1 flex-shrink-0 ml-2">
          {selected && (
            <span onClick={clear} className="p-0.5 rounded hover:bg-gray-100 transition-colors" title="Clear">
              <X className="w-3 h-3 text-gray-400" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Hidden native input for form validation */}
      <input
        type="text"
        required={required}
        value={value}
        onChange={() => {}}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: '#fff', border: '1px solid #e5e7eb', maxHeight: 320 }}
        >
          {/* Search input */}
          <div className="px-3 pt-3 pb-2" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#9ca3af' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type to search…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: '#111827' }}
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="p-0.5">
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
            <p className="text-[10px] mt-1.5 px-0.5" style={{ color: '#9ca3af' }}>
              {filtered.length} of {clients.length} client{clients.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Client list */}
          <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <User className="w-6 h-6" style={{ color: '#d1d5db' }} />
                <p className="text-xs" style={{ color: '#9ca3af' }}>No clients match "{query}"</p>
              </div>
            ) : (
              filtered.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => select(c.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-purple-50"
                  style={{ background: value === c.id ? 'rgba(162,142,249,0.08)' : undefined }}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#a28ef9,#60a5fa)' }}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate" style={{ color: value === c.id ? '#7c5ef9' : '#111827' }}>
                      {c.name}
                    </span>
                    {(c.company || c.email) && (
                      <span className="block text-[11px] truncate" style={{ color: '#9ca3af' }}>
                        {c.company || c.email}
                      </span>
                    )}
                  </span>
                  {value === c.id && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(162,142,249,0.15)', color: '#7c5ef9' }}>
                      Selected
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
