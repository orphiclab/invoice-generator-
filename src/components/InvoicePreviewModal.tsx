'use client'
import dynamic from 'next/dynamic'
import { X, Download } from 'lucide-react'
import { InvoicePDF } from '@/components/InvoicePDF'
import { InvoicePDFClassic } from '@/components/InvoicePDFClassic'

// PDFViewer must be dynamically imported — it only runs in the browser
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  { ssr: false }
)

interface Props {
  invoice: object | null
  template: 'green' | 'classic'
  onClose: () => void
  onTemplateChange: (t: 'green' | 'classic') => void
  onDownload: () => void
}

export function InvoicePreviewModal({ invoice, template, onClose, onTemplateChange, onDownload }: Props) {
  const TemplateComponent = template === 'green' ? InvoicePDF : InvoicePDFClassic

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ background: '#111318', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {(['green', 'classic'] as const).map(t => (
              <button
                key={t}
                onClick={() => onTemplateChange(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: template === t ? 'rgba(123,97,255,0.25)' : 'transparent',
                  color: template === t ? '#7B61FF' : 'rgba(255,255,255,0.45)',
                }}
              >
                {t === 'green' ? '🌿 Green Modern' : '🌌 Classic Dark'}
              </button>
            ))}
          </div>
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
            PDF Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
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
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '8px',
          }}
          showToolbar={false}
        >
          {/* @ts-expect-error invoice prop type */}
          <TemplateComponent invoice={invoice} />
        </PDFViewer>
      </div>
    </div>
  )
}
