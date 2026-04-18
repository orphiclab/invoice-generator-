import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// ── Studio Creative Palette ───────────────────────────────────────
const OLIVE        = '#4D5B2F'
const OLIVE_LIGHT  = '#8DA44E'
const LIME         = '#C7D93D'
const YELLOW       = '#F5E642'
const CREAM        = '#FEFCE8'
const OFF_WHITE    = '#FAFAF5'
const WHITE        = '#FFFFFF'
const DARK         = '#1C1917'
const MUTED        = '#57534E'
const BORDER       = '#E7E5E4'
const WARM         = '#292524'

const styles = StyleSheet.create({
  page: { fontSize: 10, fontFamily: 'Helvetica', backgroundColor: WHITE },

  // ── Decorative top bar with dots ────────────────────────────────
  topBar: { height: 6, backgroundColor: OLIVE },
  topBarAccent: { flexDirection: 'row', height: 3, backgroundColor: LIME },

  // ── Header band — company name + contacts ───────────────────────
  headerBand: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 44, paddingTop: 22, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: BORDER },
  companyBlock: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  companyLogo: { width: 36, height: 36, borderRadius: 18, backgroundColor: OLIVE, alignItems: 'center', justifyContent: 'center' },
  companyInfo: {},
  companyName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 2 },
  companySubtext: { fontSize: 8, color: OLIVE_LIGHT, fontStyle: 'italic' },
  contactRow: { flexDirection: 'row', gap: 16 },
  contactItem: { fontSize: 7, color: MUTED },

  // ── Big INVOICE word ────────────────────────────────────────────
  invoiceSection: { paddingHorizontal: 44, paddingTop: 16, paddingBottom: 12 },
  invoiceWord: { fontSize: 42, fontFamily: 'Helvetica-Bold', color: OLIVE, letterSpacing: -1, marginBottom: 6 },
  invoiceSubline: { fontSize: 8, color: MUTED, marginBottom: 14 },

  // ── Two-column: left (invoice info + client), right (items) ────
  bodyRow: { flexDirection: 'row', paddingHorizontal: 44, marginBottom: 0 },
  bodyLeft: { width: 190, paddingRight: 20 },
  bodyRight: { flex: 1 },

  metaLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: OLIVE_LIGHT, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 },
  metaValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 8 },

  // Client card — boxed
  clientCard: { padding: 10, borderWidth: 1.5, borderColor: LIME, borderRadius: 4, marginBottom: 12 },
  clientName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 4 },
  clientDetail: { fontSize: 8, color: MUTED, marginBottom: 2, lineHeight: 1.4 },

  // Items table with colored header
  tableHeader: { flexDirection: 'row', backgroundColor: OLIVE, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 1 },
  tableHeaderText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: LIME, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  tableRowAlt: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: BORDER, backgroundColor: OFF_WHITE },
  tableCell: { fontSize: 9, color: '#44403C', lineHeight: 1.4 },
  tableCellBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },

  // ── Total block — highlighted ───────────────────────────────────
  totalArea: { paddingHorizontal: 44, paddingTop: 12, paddingBottom: 8 },
  totalHighlight: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: YELLOW, borderRadius: 6, marginBottom: 6 },
  totalHighlightLabel: { fontSize: 8, color: OLIVE },
  totalHighlightAmount: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: DARK },

  subtotalRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 44, marginBottom: 2 },
  subtotalBox: { width: 200 },
  subLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  subLabel: { fontSize: 8, color: MUTED },
  subValue: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: DARK },

  grandTotalRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 44, marginBottom: 12 },
  grandTotalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: 200, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: OLIVE, borderRadius: 4 },
  grandLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: WHITE },
  grandValue: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: LIME },

  // ── Notes / Payment terms ───────────────────────────────────────
  notesSection: { paddingHorizontal: 44, marginBottom: 12 },
  notesBox: { padding: 12, backgroundColor: CREAM, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: LIME },
  notesLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: OLIVE, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  notesText: { fontSize: 8, color: MUTED, lineHeight: 1.5 },

  // ── Paid stamp ──────────────────────────────────────────────────
  paidStamp: { marginHorizontal: 44, marginBottom: 12, paddingVertical: 8, backgroundColor: CREAM, borderRadius: 4, borderWidth: 2, borderColor: OLIVE_LIGHT, alignItems: 'center' },
  paidText: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: OLIVE, letterSpacing: 5, textTransform: 'uppercase' },

  // ── Signature area ──────────────────────────────────────────────
  signatureArea: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 44, paddingVertical: 12, borderTopWidth: 1, borderTopColor: BORDER },
  signatureLine: { width: 160, borderTopWidth: 1, borderTopColor: OLIVE, paddingTop: 6, alignItems: 'center' },
  signatureName: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: DARK },
  signatureTitle: { fontSize: 7, color: MUTED, textTransform: 'uppercase', letterSpacing: 1 },

  // ── Thank You Banner ────────────────────────────────────────────
  thankYouBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, backgroundColor: WARM, marginTop: 'auto' },
  thankYouDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: LIME, marginHorizontal: 14 },
  thankYouText: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: WHITE, letterSpacing: 8, textTransform: 'uppercase' },

  statusChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 3 },
})

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PAID:    { bg: '#D1FAE5', text: '#065F46' },
  SENT:    { bg: '#DBEAFE', text: '#1E40AF' },
  DRAFT:   { bg: '#F3F4F6', text: '#374151' },
  OVERDUE: { bg: '#FEE2E2', text: '#991B1B' },
}

interface InvoiceItem { description: string; quantity: number; unitPrice: number; total: number }
interface Invoice {
  invoiceNo: string; status: string; total: number; subtotal: number; tax: number; discount: number
  dueDate: string; issueDate: string; notes?: string; lateFeeAmount?: number
  client: { name: string; email: string; phone?: string; company?: string; address?: string }
  user: { name: string; email: string; company?: string; phone?: string; address?: string }
  items: InvoiceItem[]
  currency?: { symbol: string; code: string }
  bankDetails?: string | null
}

export function InvoicePDFStudio({ invoice }: { invoice: Invoice | null }) {
  if (!invoice) return <Document><Page size="A4"><Text>No invoice data</Text></Page></Document>

  const sym = invoice.currency?.symbol ?? 'Rs '
  const fmt = (n: number) => `${sym}${n.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })
  const taxAmt = (invoice.subtotal * invoice.tax) / 100
  const discountAmt = (invoice.subtotal * invoice.discount) / 100
  const statusStyle = STATUS_COLORS[invoice.status] ?? STATUS_COLORS.DRAFT

  return (
    <Document title={`Invoice ${invoice.invoiceNo}`}>
      <Page size="A4" style={styles.page}>

        {/* ── TOP BARS ── */}
        <View style={styles.topBar} />
        <View style={styles.topBarAccent} />

        {/* ── HEADER BAND ── */}
        <View style={styles.headerBand}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.companyLogo}>
              <Text style={{ fontSize: 14, color: LIME, fontFamily: 'Helvetica-Bold' }}>IF</Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.companyName}>{invoice.user.company || invoice.user.name}</Text>
              <Text style={styles.companySubtext}>Creative Agency</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.contactItem}>{invoice.user.email}</Text>
            {invoice.user.phone && <Text style={styles.contactItem}>{invoice.user.phone}</Text>}
            {invoice.user.address && <Text style={styles.contactItem}>{invoice.user.address}</Text>}
            <View style={[styles.statusChip, { backgroundColor: statusStyle.bg, marginTop: 4 }]}>
              <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: statusStyle.text }}>{invoice.status}</Text>
            </View>
          </View>
        </View>

        {/* ── BIG INVOICE WORD ── */}
        <View style={styles.invoiceSection}>
          <Text style={styles.invoiceWord}>INVOICE</Text>
          <Text style={styles.invoiceSubline}>This invoice has been generated for the following services provided on terms agreed beforehand.</Text>
        </View>

        {/* ── TWO-COLUMN BODY ── */}
        <View style={styles.bodyRow}>
          {/* Left — Meta + Client Card */}
          <View style={styles.bodyLeft}>
            <Text style={styles.metaLabel}>Invoice No</Text>
            <Text style={styles.metaValue}>{invoice.invoiceNo}</Text>
            <Text style={styles.metaLabel}>Date Invoice</Text>
            <Text style={styles.metaValue}>{fmtDate(invoice.issueDate)}</Text>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>{fmtDate(invoice.dueDate)}</Text>

            <Text style={[styles.metaLabel, { marginTop: 4 }]}>Invoice To</Text>
            <View style={styles.clientCard}>
              <Text style={styles.clientName}>{invoice.client.name}</Text>
              {invoice.client.company && <Text style={styles.clientDetail}>{invoice.client.company}</Text>}
              {invoice.client.address && <Text style={styles.clientDetail}>{invoice.client.address}</Text>}
              <Text style={styles.clientDetail}>{invoice.client.email}</Text>
              {invoice.client.phone && <Text style={styles.clientDetail}>{invoice.client.phone}</Text>}
            </View>
          </View>

          {/* Right — Items Table */}
          <View style={styles.bodyRight}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 4 }]}>Item Description</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Rate</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Subtotal</Text>
            </View>
            {invoice.items.map((item, i) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCell, { flex: 4 }]}>{item.description}</Text>
                <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>{fmt(item.unitPrice)}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.quantity}</Text>
                <Text style={[styles.tableCellBold, { flex: 1.5, textAlign: 'right' }]}>{fmt(item.total)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── TOTAL HIGHLIGHT BOX ── */}
        <View style={styles.totalArea}>
          <View style={styles.totalHighlight}>
            <View>
              <Text style={styles.totalHighlightLabel}>Balance Due - For Business Invoice</Text>
            </View>
            <Text style={styles.totalHighlightAmount}>{fmt(invoice.total)}</Text>
          </View>
        </View>

        {/* ── SUBTOTALS ── */}
        <View style={styles.subtotalRow}>
          <View style={styles.subtotalBox}>
            <View style={styles.subLine}>
              <Text style={styles.subLabel}>Subtotal</Text>
              <Text style={styles.subValue}>{fmt(invoice.subtotal)}</Text>
            </View>
            {invoice.tax > 0 && (
              <View style={styles.subLine}>
                <Text style={styles.subLabel}>Tax ({invoice.tax}%)</Text>
                <Text style={styles.subValue}>{fmt(taxAmt)}</Text>
              </View>
            )}
            {invoice.discount > 0 && (
              <View style={styles.subLine}>
                <Text style={styles.subLabel}>Discount ({invoice.discount}%)</Text>
                <Text style={[styles.subValue, { color: '#16A34A' }]}>-{fmt(discountAmt)}</Text>
              </View>
            )}
            {!!invoice.lateFeeAmount && invoice.lateFeeAmount > 0 && (
              <View style={styles.subLine}>
                <Text style={styles.subLabel}>Late Fee</Text>
                <Text style={[styles.subValue, { color: '#DC2626' }]}>{fmt(invoice.lateFeeAmount)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.grandTotalRow}>
          <View style={styles.grandTotalBox}>
            <Text style={styles.grandLabel}>TOTAL</Text>
            <Text style={styles.grandValue}>{fmt(invoice.total)}</Text>
          </View>
        </View>

        {/* ── PAID STAMP ── */}
        {invoice.status === 'PAID' && (
          <View style={styles.paidStamp}>
            <Text style={styles.paidText}>✓  Paid</Text>
          </View>
        )}

        {/* ── NOTES ── */}
        {(invoice.notes || invoice.bankDetails) && (
          <View style={styles.notesSection}>
            <View style={styles.notesBox}>
              {invoice.notes && (
                <>
                  <Text style={styles.notesLabel}>Our Payment Methods</Text>
                  <Text style={styles.notesText}>{invoice.notes}</Text>
                </>
              )}
              {invoice.bankDetails && (
                <View style={{ marginTop: invoice.notes ? 8 : 0 }}>
                  <Text style={styles.notesLabel}>Terms & Conditions</Text>
                  <Text style={styles.notesText}>{invoice.bankDetails}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── SIGNATURE ── */}
        <View style={styles.signatureArea}>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureName}>{invoice.user.name}</Text>
            <Text style={styles.signatureTitle}>{invoice.user.company ? 'Manager' : 'Owner'}</Text>
          </View>
        </View>

        {/* ── THANK YOU BANNER ── */}
        <View style={styles.thankYouBanner}>
          <View style={styles.thankYouDot} />
          <Text style={styles.thankYouText}>Thank You</Text>
          <View style={styles.thankYouDot} />
        </View>

      </Page>
    </Document>
  )
}
