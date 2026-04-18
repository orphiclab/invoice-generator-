'use client'
import dynamic from 'next/dynamic'
import { X, Download } from 'lucide-react'
import { InvoicePDF } from '@/components/InvoicePDF'
import { InvoicePDFClassic } from '@/components/InvoicePDFClassic'
import { InvoicePDFMidnight } from '@/components/InvoicePDFMidnight'
import { InvoicePDFOcean } from '@/components/InvoicePDFOcean'
import { InvoicePDFRose } from '@/components/InvoicePDFRose'
import { InvoicePDFSunset } from '@/components/InvoicePDFSunset'
import { InvoicePDFLavender } from '@/components/InvoicePDFLavender'
import { InvoicePDFEmerald } from '@/components/InvoicePDFEmerald'
import { InvoicePDFCarbon } from '@/components/InvoicePDFCarbon'
import { InvoicePDFRuby } from '@/components/InvoicePDFRuby'
import { InvoicePDFBauhaus } from '@/components/InvoicePDFBauhaus'
import { InvoicePDFStudio } from '@/components/InvoicePDFStudio'

// PDFViewer must be dynamically imported — it only runs in the browser
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  { ssr: false }
)

export type TemplateId = 'green' | 'classic' | 'midnight' | 'ocean' | 'rose' | 'sunset' | 'lavender' | 'emerald' | 'carbon' | 'ruby' | 'bauhaus' | 'studio'

const TEMPLATES: { id: TemplateId; label: string; emoji: string; desc: string }[] = [
  { id: 'green',    emoji: '🌿', label: 'Green',      desc: 'Forest green — fresh & professional' },
  { id: 'classic',  emoji: '🌌', label: 'Classic',     desc: 'Navy blue — trusted & authoritative'  },
  { id: 'midnight', emoji: '🌙', label: 'Midnight',    desc: 'Black & gold — ultra premium'         },
  { id: 'ocean',    emoji: '🌊', label: 'Ocean',       desc: 'Deep ocean — clean & corporate'       },
  { id: 'rose',     emoji: '🌸', label: 'Rose',        desc: 'Deep rose — creative & elegant'       },
  { id: 'sunset',   emoji: '🔥', label: 'Sunset',      desc: 'Warm orange — bold & energetic'       },
  { id: 'lavender', emoji: '💜', label: 'Lavender',    desc: 'Rich violet — refined & modern'       },
  { id: 'emerald',  emoji: '💎', label: 'Emerald',     desc: 'Teal & mint — executive & polished'   },
  { id: 'carbon',   emoji: '⚡', label: 'Carbon',      desc: 'Charcoal mono — minimal & powerful'   },
  { id: 'ruby',     emoji: '❤️', label: 'Ruby',        desc: 'Bold crimson — confident & striking'  },
  { id: 'bauhaus',  emoji: '🔷', label: 'Bauhaus',     desc: 'Geometric bold — creative & unique'   },
  { id: 'studio',   emoji: '🎨', label: 'Studio',      desc: 'Agency style — thank-you & signature' },
]

interface Props {
  invoice: object | null
  template: TemplateId
  onClose: () => void
  onTemplateChange: (t: TemplateId) => void
  onDownload: () => void
}

export function InvoicePreviewModal({ invoice, template, onClose, onTemplateChange, onDownload }: Props) {
  const components: Record<TemplateId, React.ComponentType<{ invoice: object | null }>> = {
    green:    InvoicePDF,
    classic:  InvoicePDFClassic,
    midnight: InvoicePDFMidnight,
    ocean:    InvoicePDFOcean,
    rose:     InvoicePDFRose,
    sunset:   InvoicePDFSunset,
    lavender: InvoicePDFLavender,
    emerald:  InvoicePDFEmerald,
    carbon:   InvoicePDFCarbon,
    ruby:     InvoicePDFRuby,
    bauhaus:  InvoicePDFBauhaus,
    studio:   InvoicePDFStudio,
  }
  const TemplateComponent = components[template]
  const current = TEMPLATES.find(t => t.id === template)!

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)' }}
    >
      {/* Top bar — minimal: title + actions */}
      <div
        className="flex items-center justify-between px-4 sm:px-5 py-2.5 flex-shrink-0"
        style={{ background: '#0a0c10', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[3px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Preview
          </span>
          <span className="text-xs font-semibold" style={{ color: '#a28ef9' }}>
            {current.emoji} {current.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #7B61FF, #a28ef9)', boxShadow: '0 2px 10px rgba(123,97,255,0.3)' }}
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content: template sidebar + PDF viewer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Template Sidebar */}
        <div
          className="w-[180px] flex-shrink-0 overflow-y-auto py-3 px-2 hidden sm:block"
          style={{ background: '#0d0f14', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[9px] font-bold uppercase tracking-[2px] px-2 mb-2" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Templates
          </p>
          <div className="flex flex-col gap-0.5">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => onTemplateChange(t.id)}
                title={t.desc}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all text-left"
                style={{
                  background: template === t.id ? 'rgba(162,142,249,0.15)' : 'transparent',
                  color: template === t.id ? '#a28ef9' : 'rgba(255,255,255,0.45)',
                  borderLeft: template === t.id ? '2px solid #a28ef9' : '2px solid transparent',
                }}
              >
                <span className="text-sm">{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile template bar — horizontal scroll */}
        <div
          className="flex sm:hidden overflow-x-auto gap-1 px-3 py-2 flex-shrink-0"
          style={{ background: '#0d0f14', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => onTemplateChange(t.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all"
              style={{
                background: template === t.id ? 'rgba(162,142,249,0.2)' : 'transparent',
                color: template === t.id ? '#a28ef9' : 'rgba(255,255,255,0.35)',
                border: template === t.id ? '1px solid rgba(162,142,249,0.3)' : '1px solid transparent',
              }}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden flex items-center justify-center p-3 sm:p-5">
          <PDFViewer
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
            showToolbar={false}
          >
            {/* @ts-expect-error invoice prop type */}
            <TemplateComponent invoice={invoice} />
          </PDFViewer>
        </div>
      </div>
    </div>
  )
}
