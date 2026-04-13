import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// ── Rose Studio Palette ───────────────────────────────────────────
const ROSE       = '#BE185D'   // Deep rose
const ROSE_DARK  = '#831843'   // Darker rose
const ROSE_MID   = '#DB2777'   // Vibrant rose
const ROSE_PALE  = '#FCE7F3'   // Soft blush
const ROSE_LIGHT = '#FDF2F8'   // Very soft pink bg
const WHITE      = '#FFFFFF'
const DARK       = '#1F2937'
const MUTED      = '#6B7280'
const BORDER     = '#F3E8EE'
const WARM_GREY  = '#F9FAFB'

const styles = StyleSheet.create({
  page: { fontSize: 10, fontFamily: 'Helvetica', backgroundColor: WHITE },

  // ── Slim top accent bar ──────────────────────────────────────────
  topAccentBar: { height: 6, backgroundColor: ROSE_MID },
  topAccentBar2: { height: 2, backgroundColor: ROSE_DARK },

  // ── Header (clean white with pink accents) ───────────────────────
  header: { backgroundColor: WHITE, paddingHorizontal: 44, paddingTop: 28, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },

  // Left — Company
  logoCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: ROSE_MID, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  companyName: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: ROSE_DARK, marginBottom: 3 },
  companyDetail: { fontSize: 8, color: MUTED, marginBottom: 2 },

  // Right — Invoice info
  invoiceBlock: { alignItems: 'flex-end' },
  bigInvoiceWord: { fontSize: 34, fontFamily: 'Helvetica-Bold', color: ROSE_PALE, letterSpacing: -1, marginBottom: 2 },
  invoiceNumber: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: ROSE, textAlign: 'right', letterSpacing: 1 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-end', marginTop: 8 },

  // ── Blush divider line ───────────────────────────────────────────
  blushDivider: { height: 1, backgroundColor: ROSE_PALE, marginHorizontal: 44 },
  roseLine: { height: 2, backgroundColor: ROSE_MID, marginHorizontal: 44, marginBottom: 0 },

  // ── Meta band ───────────────────────────────────────────────────
  metaBand: { flexDirection: 'row', backgroundColor: ROSE_LIGHT, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#FBCFE8' },
  metaCell: { flex: 1, paddingHorizontal: 22, paddingVertical: 12, borderRightWidth: 1, borderRightColor: '#FBCFE8' },
  metaCellLast: { flex: 1, paddingHorizontal: 22, paddingVertical: 12 },
  metaLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: ROSE_MID, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 3 },
  metaValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: DARK },

  // ── From / To ───────────────────────────────────────────────────
  fromToRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDER },
  fromBox: { flex: 1, paddingHorizontal: 32, paddingVertical: 22, borderRightWidth: 1, borderRightColor: BORDER },
  toBox: { flex: 1, paddingHorizontal: 32, paddingVertical: 22 },
  ftLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: ROSE_MID, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 9, paddingBottom: 5, borderBottomWidth: 1.5, borderBottomColor: ROSE_PALE, alignSelf: 'flex-start' },
  personName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 3 },
  personDetail: { fontSize: 8.5, color: MUTED, marginBottom: 2, lineHeight: 1.4 },

  // ── Table ───────────────────────────────────────────────────────
  tableWrap: { paddingHorizontal: 32, paddingTop: 20, paddingBottom: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: ROSE, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 4, marginBottom: 2 },
  tableHeaderText: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: WHITE, textTransform: 'uppercase', letterSpacing: 0.8 },
  rowEven: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: ROSE_LIGHT, borderBottomWidth: 1, borderBottomColor: BORDER },
  rowOdd: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER },
  cell: { fontSize: 9, color: '#374151', lineHeight: 1.4 },
  cellBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },

  // ── Totals ──────────────────────────────────────────────────────
  totalsSection: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 32, paddingTop: 16, paddingBottom: 20 },
  totalsBox: { width: 230 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  totalLabel: { fontSize: 8.5, color: MUTED },
  totalValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: DARK },
  grandRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: ROSE, borderRadius: 4, marginTop: 4, alignItems: 'center' },
  grandLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: WHITE },
  grandValue: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: WHITE },

  // ── Paid stamp ──────────────────────────────────────────────────
  paidStamp: { marginHorizontal: 32, marginBottom: 14, paddingVertical: 9, backgroundColor: ROSE_PALE, borderRadius: 4, borderWidth: 1.5, borderColor: ROSE_MID, alignItems: 'center' },
  paidText: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: ROSE_DARK, letterSpacing: 5, textTransform: 'uppercase' },

  // ── Notes ───────────────────────────────────────────────────────
  notesBox: { marginHorizontal: 32, marginBottom: 20, padding: 14, backgroundColor: ROSE_LIGHT, borderRadius: 4, borderLeftWidth: 4, borderLeftColor: ROSE_MID },
  notesLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: ROSE, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 5 },
  notesText: { fontSize: 8.5, color: ROSE_DARK, lineHeight: 1.6 },

  // ── Footer ──────────────────────────────────────────────────────
  footer: { backgroundColor: ROSE_DARK, paddingHorizontal: 44, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  footerText: { fontSize: 8, color: '#FBCFE8' },
  footerBrand: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: WHITE },
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

export function InvoicePDFRose({ invoice }: { invoice: Invoice | null }) {
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

        {/* ── TOP ACCENT BAR ── */}
        <View style={styles.topAccentBar} />
        <View style={styles.topAccentBar2} />

        {/* ── HEADER ── */}
        <View style={styles.header}>
          {/* Left — Company */}
          <View>
            <View style={styles.logoCircle}>
              <Text style={{ fontSize: 15, color: WHITE, fontFamily: 'Helvetica-Bold' }}>IF</Text>
            </View>
            <Text style={styles.companyName}>{invoice.user.company || invoice.user.name}</Text>
            {invoice.user.company && <Text style={styles.companyDetail}>{invoice.user.name}</Text>}
            <Text style={styles.companyDetail}>{invoice.user.email}</Text>
            {invoice.user.phone && <Text style={styles.companyDetail}>{invoice.user.phone}</Text>}
            {invoice.user.address && <Text style={styles.companyDetail}>{invoice.user.address}</Text>}
          </View>
          {/* Right — Invoice label */}
          <View style={styles.invoiceBlock}>
            <Text style={styles.bigInvoiceWord}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNo}</Text>
            <View style={[styles.statusChip, { backgroundColor: statusStyle.bg }]}>
              <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: statusStyle.text }}>{invoice.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.roseLine} />

        {/* ── META BAND ── */}
        <View style={styles.metaBand}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Invoice No</Text>
            <Text style={styles.metaValue}>{invoice.invoiceNo}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Issue Date</Text>
            <Text style={styles.metaValue}>{fmtDate(invoice.issueDate)}</Text>
          </View>
          <View style={styles.metaCellLast}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>{fmtDate(invoice.dueDate)}</Text>
          </View>
        </View>

        {/* ── FROM / TO ── */}
        <View style={styles.fromToRow}>
          <View style={styles.fromBox}>
            <Text style={styles.ftLabel}>From</Text>
            <Text style={styles.personName}>{invoice.user.company || invoice.user.name}</Text>
            {invoice.user.company && <Text style={styles.personDetail}>{invoice.user.name}</Text>}
            {invoice.user.address && <Text style={styles.personDetail}>{invoice.user.address}</Text>}
            <Text style={styles.personDetail}>{invoice.user.email}</Text>
            {invoice.user.phone && <Text style={styles.personDetail}>{invoice.user.phone}</Text>}
          </View>
          <View style={styles.toBox}>
            <Text style={styles.ftLabel}>Bill To</Text>
            <Text style={styles.personName}>{invoice.client.name}</Text>
            {invoice.client.company && <Text style={styles.personDetail}>{invoice.client.company}</Text>}
            {invoice.client.address && <Text style={styles.personDetail}>{invoice.client.address}</Text>}
            <Text style={styles.personDetail}>{invoice.client.email}</Text>
            {invoice.client.phone && <Text style={styles.personDetail}>{invoice.client.phone}</Text>}
          </View>
        </View>

        {/* ── TABLE ── */}
        <View style={styles.tableWrap}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 5 }]}>Description</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'right' }]}>Unit Price</Text>
            <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'right' }]}>Amount</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
              <Text style={[styles.cell, { flex: 5 }]}>{item.description}</Text>
              <Text style={[styles.cell, { flex: 1.5, textAlign: 'center' }]}>{item.quantity}</Text>
              <Text style={[styles.cell, { flex: 2, textAlign: 'right' }]}>{fmt(item.unitPrice)}</Text>
              <Text style={[styles.cellBold, { flex: 2, textAlign: 'right' }]}>{fmt(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* ── TOTALS ── */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{fmt(invoice.subtotal)}</Text>
            </View>
            {invoice.tax > 0 && (
              <View style={styles.totalLine}>
                <Text style={styles.totalLabel}>Tax ({invoice.tax}%)</Text>
                <Text style={styles.totalValue}>{fmt(taxAmt)}</Text>
              </View>
            )}
            {invoice.discount > 0 && (
              <View style={styles.totalLine}>
                <Text style={styles.totalLabel}>Discount ({invoice.discount}%)</Text>
                <Text style={[styles.totalValue, { color: '#16A34A' }]}>-{fmt(discountAmt)}</Text>
              </View>
            )}
            {!!invoice.lateFeeAmount && invoice.lateFeeAmount > 0 && (
              <View style={styles.totalLine}>
                <Text style={styles.totalLabel}>Late Fee</Text>
                <Text style={[styles.totalValue, { color: '#DC2626' }]}>{fmt(invoice.lateFeeAmount)}</Text>
              </View>
            )}
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>Total Due</Text>
              <Text style={styles.grandValue}>{fmt(invoice.total)}</Text>
            </View>
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
          <View style={styles.notesBox}>
            {invoice.notes && (
              <>
                <Text style={styles.notesLabel}>Notes & Payment Terms</Text>
                <Text style={styles.notesText}>{invoice.notes}</Text>
              </>
            )}
            {invoice.bankDetails && (
              <View style={{ marginTop: invoice.notes ? 10 : 0 }}>
                <Text style={styles.notesLabel}>Bank Details</Text>
                <Text style={styles.notesText}>{invoice.bankDetails}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── FOOTER ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerBrand}>InvoiceFlow</Text>
          <Text style={styles.footerText}>{invoice.user.email}</Text>
        </View>

      </Page>
    </Document>
  )
}
