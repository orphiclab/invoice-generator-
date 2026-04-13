import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// ── Midnight Gold Palette ─────────────────────────────────────────
const DARK      = '#0D1117'
const DARK_MID  = '#161B22'
const GOLD      = '#F5C518'
const GOLD_DIM  = '#C9A227'
const GOLD_PALE = '#FFF8DC'
const WHITE     = '#FFFFFF'
const MUTED     = '#8B949E'
const OFF_WHITE = '#F6F8FA'
const BORDER    = '#E1E4E8'

const styles = StyleSheet.create({
  page: { fontSize: 10, fontFamily: 'Helvetica', backgroundColor: WHITE },

  // ── Header ──────────────────────────────────────────────────────
  header: { backgroundColor: DARK, paddingHorizontal: 48, paddingTop: 36, paddingBottom: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  logoMark: { width: 38, height: 38, borderRadius: 4, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  companyName: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: WHITE, marginBottom: 4 },
  companyDetail: { fontSize: 8, color: MUTED, marginBottom: 2 },
  invoiceLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: GOLD, letterSpacing: 4, textTransform: 'uppercase', textAlign: 'right', marginBottom: 8 },
  invoiceNumber: { fontSize: 30, fontFamily: 'Helvetica-Bold', color: WHITE, textAlign: 'right' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 2, alignSelf: 'flex-end', marginTop: 10 },

  goldBar: { height: 3, backgroundColor: GOLD },
  darkBar: { height: 4, backgroundColor: DARK_MID },

  // ── Meta band ───────────────────────────────────────────────────
  metaBand: { flexDirection: 'row', backgroundColor: OFF_WHITE, borderBottomWidth: 1, borderBottomColor: BORDER },
  metaCell: { flex: 1, paddingHorizontal: 24, paddingVertical: 14, borderRightWidth: 1, borderRightColor: BORDER },
  metaCellLast: { flex: 1, paddingHorizontal: 24, paddingVertical: 14 },
  metaLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: GOLD_DIM, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  metaValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: DARK },

  // ── From / To ───────────────────────────────────────────────────
  fromToRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDER },
  fromBox: { flex: 1, paddingHorizontal: 36, paddingVertical: 24, borderRightWidth: 1, borderRightColor: BORDER },
  toBox: { flex: 1, paddingHorizontal: 36, paddingVertical: 24 },
  sectionLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: GOLD, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: GOLD, paddingBottom: 4, alignSelf: 'flex-start' },
  personName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 4 },
  personDetail: { fontSize: 8.5, color: MUTED, marginBottom: 2, lineHeight: 1.4 },

  // ── Table ───────────────────────────────────────────────────────
  tableWrap: { paddingHorizontal: 36, paddingTop: 22, paddingBottom: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: DARK, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 3, marginBottom: 1 },
  tableHeaderText: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: GOLD, textTransform: 'uppercase', letterSpacing: 1 },
  rowEven: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: OFF_WHITE, borderBottomWidth: 1, borderBottomColor: BORDER },
  rowOdd: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER },
  cell: { fontSize: 9, color: '#374151', lineHeight: 1.4 },
  cellBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },

  // ── Totals ──────────────────────────────────────────────────────
  totalsSection: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 36, paddingTop: 16, paddingBottom: 20 },
  totalsBox: { width: 236 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  totalLabel: { fontSize: 8.5, color: MUTED },
  totalValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: DARK },
  grandRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 13, backgroundColor: DARK, borderRadius: 3, marginTop: 4, alignItems: 'center' },
  grandLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: WHITE },
  grandValue: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: GOLD },

  // ── Paid stamp ──────────────────────────────────────────────────
  paidStamp: { marginHorizontal: 36, marginBottom: 14, paddingVertical: 9, borderWidth: 2, borderColor: GOLD, borderRadius: 3, alignItems: 'center' },
  paidText: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: GOLD, letterSpacing: 5, textTransform: 'uppercase' },

  // ── Notes ───────────────────────────────────────────────────────
  notesBox: { marginHorizontal: 36, marginBottom: 20, padding: 14, backgroundColor: GOLD_PALE, borderRadius: 3, borderLeftWidth: 3, borderLeftColor: GOLD },
  notesLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#92400E', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 },
  notesText: { fontSize: 8.5, color: '#78350F', lineHeight: 1.6 },

  // ── Footer ──────────────────────────────────────────────────────
  footer: { backgroundColor: DARK, paddingHorizontal: 48, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  footerText: { fontSize: 8, color: MUTED },
  footerBrand: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: GOLD },
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

export function InvoicePDFMidnight({ invoice }: { invoice: Invoice | null }) {
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

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <View style={styles.logoMark}>
                <Text style={{ fontSize: 15, color: DARK, fontFamily: 'Helvetica-Bold' }}>IF</Text>
              </View>
              <Text style={styles.companyName}>{invoice.user.company || invoice.user.name}</Text>
              {invoice.user.company && <Text style={styles.companyDetail}>{invoice.user.name}</Text>}
              <Text style={styles.companyDetail}>{invoice.user.email}</Text>
              {invoice.user.phone && <Text style={styles.companyDetail}>{invoice.user.phone}</Text>}
              {invoice.user.address && <Text style={styles.companyDetail}>{invoice.user.address}</Text>}
            </View>
            <View>
              <Text style={styles.invoiceLabel}>Invoice</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNo}</Text>
              <View style={[styles.statusChip, { backgroundColor: statusStyle.bg }]}>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: statusStyle.text }}>{invoice.status}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.goldBar} />

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
            <Text style={styles.sectionLabel}>From</Text>
            <Text style={styles.personName}>{invoice.user.company || invoice.user.name}</Text>
            {invoice.user.company && <Text style={styles.personDetail}>{invoice.user.name}</Text>}
            {invoice.user.address && <Text style={styles.personDetail}>{invoice.user.address}</Text>}
            <Text style={styles.personDetail}>{invoice.user.email}</Text>
            {invoice.user.phone && <Text style={styles.personDetail}>{invoice.user.phone}</Text>}
          </View>
          <View style={styles.toBox}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <Text style={styles.personName}>{invoice.client.name}</Text>
            {invoice.client.company && <Text style={styles.personDetail}>{invoice.client.company}</Text>}
            {invoice.client.address && <Text style={styles.personDetail}>{invoice.client.address}</Text>}
            <Text style={styles.personDetail}>{invoice.client.email}</Text>
            {invoice.client.phone && <Text style={styles.personDetail}>{invoice.client.phone}</Text>}
          </View>
        </View>

        {/* ── ITEMS TABLE ── */}
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
              <Text style={[styles.cellBold, { flex: 2, textAlign: 'right', color: GOLD_DIM }]}>{fmt(item.total)}</Text>
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
