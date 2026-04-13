'use client'
import dynamic from 'next/dynamic'
import { X, Download } from 'lucide-react'
import { InvoicePDF } from '@/components/InvoicePDF'
import { InvoicePDFClassic } from '@/components/InvoicePDFClassic'
import { InvoicePDFMidnight } from '@/components/InvoicePDFMidnight'
import { InvoicePDFOcean } from '@/components/InvoicePDFOcean'
import { InvoicePDFRose } from '@/components/InvoicePDFRose'

// PDFViewer must be dynamically imported — it only runs in the browser
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  { ssr: false }
)

export type TemplateId = 'green' | 'classic' | 'midnight' | 'ocean' | 'rose'

const TEMPLATES: { id: TemplateId; label: string; emoji: string; desc: string }[] = [
  { id: 'green',    emoji: '🌿', label: 'Green Modern',   desc: 'Forest green — fresh & professional' },
  { id: 'classic',  emoji: '🌌', label: 'Classic Dark',   desc: 'Navy blue — trusted & authoritative'  },
  { id: 'midnight', emoji: '🌙', label: 'Midnight Gold',  desc: 'Black & gold — ultra premium'         },
  { id: 'ocean',    emoji: '🌊', label: 'Ocean Blue',     desc: 'Deep ocean — clean & corporate'       },
  { id: 'rose',     emoji: '🌸', label: 'Rose Studio',    desc: 'Deep rose — creative & elegant'       },
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
  }
  const TemplateComponent = components[template]
  const current = TEMPLATES.find(t => t.id === template)!

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(8px)' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0 gap-4"
        style={{ background: '#0E1015', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Template Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold uppercase tracking-widest flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Template
          </span>
          <div className="flex items-center gap-1 p-1 rounded-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => onTemplateChange(t.id)}
                title={t.desc}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                style={{
                  background: template === t.id ? 'rgba(162,142,249,0.2)' : 'transparent',
                  color: template === t.id ? '#a28ef9' : 'rgba(255,255,255,0.4)',
                  border: template === t.id ? '1px solid rgba(162,142,249,0.35)' : '1px solid transparent',
                }}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {current.emoji} {current.label}
            </span>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{current.desc}</span>
          </div>
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all btn-brand"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-all"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
        <PDFViewer
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
          showToolbar={false}
        >
          {/* @ts-expect-error invoice prop type */}
          <TemplateComponent invoice={invoice} />
        </PDFViewer>
      </div>
    </div>
  )
}
