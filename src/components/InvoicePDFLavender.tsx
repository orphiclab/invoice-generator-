import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// ── Lavender Mist Palette ─────────────────────────────────────────
const LAVENDER      = '#7C3AED'   // Rich violet
const LAVENDER_DARK = '#4C1D95'   // Deep purple
const LAVENDER_MID  = '#8B5CF6'   // Vibrant purple
const LAVENDER_PALE = '#EDE9FE'   // Soft lavender
const LAVENDER_BG   = '#F5F3FF'   // Lightest lavender
const PLUM          = '#6D28D9'   // Plum accent
const WHITE         = '#FFFFFF'
const DARK          = '#1E1B4B'
const MUTED         = '#6B7280'
const BORDER        = '#E9E5F5'

const styles = StyleSheet.create({
  page: { fontSize: 10, fontFamily: 'Helvetica', backgroundColor: WHITE },

  // ── Elegant side-stripe approach — left accent + clean header ──
  topBar: { height: 5, backgroundColor: LAVENDER },
  topBarSub: { height: 2, backgroundColor: LAVENDER_DARK },

  header: { backgroundColor: WHITE, paddingHorizontal: 44, paddingTop: 30, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 2, borderBottomColor: LAVENDER_PALE },

  logoSquare: { width: 40, height: 40, borderRadius: 10, backgroundColor: LAVENDER, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  companyName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: LAVENDER_DARK, marginBottom: 3 },
  companyDetail: { fontSize: 8, color: MUTED, marginBottom: 2 },

  invoiceBlock: { alignItems: 'flex-end' },
  invoiceBigLabel: { fontSize: 36, fontFamily: 'Helvetica-Bold', color: LAVENDER_PALE, letterSpacing: -1, marginBottom: 0 },
  invoiceNo: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: LAVENDER, textAlign: 'right', letterSpacing: 0.5 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-end', marginTop: 8 },

  // ── Meta ─────────────────────────────────────────────────────────
  metaStrip: { flexDirection: 'row', backgroundColor: LAVENDER_BG, borderBottomWidth: 1, borderBottomColor: BORDER },
  metaCell: { flex: 1, paddingHorizontal: 22, paddingVertical: 12, borderRightWidth: 1, borderRightColor: BORDER },
  metaCellLast: { flex: 1, paddingHorizontal: 22, paddingVertical: 12 },
  metaLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: PLUM, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 3 },
  metaValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: DARK },

  // ── From / To ───────────────────────────────────────────────────
  ftRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDER },
  ftBox: { flex: 1, paddingHorizontal: 34, paddingVertical: 22, borderRightWidth: 1, borderRightColor: BORDER },
  ftBoxLast: { flex: 1, paddingHorizontal: 34, paddingVertical: 22 },
  ftLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: LAVENDER_MID, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 9, paddingBottom: 5, borderBottomWidth: 1.5, borderBottomColor: LAVENDER_PALE, alignSelf: 'flex-start' },
  personName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 3 },
  personDetail: { fontSize: 8.5, color: MUTED, marginBottom: 2, lineHeight: 1.4 },

  // ── Table ───────────────────────────────────────────────────────
  tableWrap: { paddingHorizontal: 34, paddingTop: 20, paddingBottom: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: LAVENDER, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 5, marginBottom: 2 },
  tableHeaderText: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: WHITE, textTransform: 'uppercase', letterSpacing: 0.8 },
  rowEven: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: LAVENDER_BG, borderBottomWidth: 1, borderBottomColor: BORDER },
  rowOdd: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER },
  cell: { fontSize: 9, color: '#374151', lineHeight: 1.4 },
  cellBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },

  // ── Totals ──────────────────────────────────────────────────────
  totalsSection: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 34, paddingTop: 16, paddingBottom: 20 },
  totalsBox: { width: 230 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  totalLabel: { fontSize: 8.5, color: MUTED },
  totalValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: DARK },
  grandRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: LAVENDER, borderRadius: 5, marginTop: 4, alignItems: 'center' },
  grandLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: WHITE },
  grandValue: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: WHITE },

  // ── Paid stamp ──────────────────────────────────────────────────
  paidStamp: { marginHorizontal: 34, marginBottom: 14, paddingVertical: 9, backgroundColor: LAVENDER_PALE, borderRadius: 5, borderWidth: 2, borderColor: LAVENDER_MID, alignItems: 'center' },
  paidText: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: LAVENDER_DARK, letterSpacing: 5, textTransform: 'uppercase' },

  // ── Notes ───────────────────────────────────────────────────────
  notesBox: { marginHorizontal: 34, marginBottom: 20, padding: 14, backgroundColor: LAVENDER_BG, borderRadius: 5, borderLeftWidth: 4, borderLeftColor: LAVENDER_MID },
  notesLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: PLUM, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 5 },
  notesText: { fontSize: 8.5, color: '#4C1D95', lineHeight: 1.6 },

  // ── Footer ──────────────────────────────────────────────────────
  footer: { backgroundColor: LAVENDER_DARK, paddingHorizontal: 44, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  footerText: { fontSize: 8, color: '#C4B5FD' },
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

export function InvoicePDFLavender({ invoice }: { invoice: Invoice | null }) {
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

        {/* ── TOP ACCENT ── */}
        <View style={styles.topBar} />
        <View style={styles.topBarSub} />

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View>
            <View style={styles.logoSquare}>
              <Text style={{ fontSize: 15, color: WHITE, fontFamily: 'Helvetica-Bold' }}>IF</Text>
            </View>
            <Text style={styles.companyName}>{invoice.user.company || invoice.user.name}</Text>
            {invoice.user.company && <Text style={styles.companyDetail}>{invoice.user.name}</Text>}
            <Text style={styles.companyDetail}>{invoice.user.email}</Text>
            {invoice.user.phone && <Text style={styles.companyDetail}>{invoice.user.phone}</Text>}
            {invoice.user.address && <Text style={styles.companyDetail}>{invoice.user.address}</Text>}
          </View>
          <View style={styles.invoiceBlock}>
            <Text style={styles.invoiceBigLabel}>INVOICE</Text>
            <Text style={styles.invoiceNo}>{invoice.invoiceNo}</Text>
            <View style={[styles.statusChip, { backgroundColor: statusStyle.bg }]}>
              <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: statusStyle.text }}>{invoice.status}</Text>
            </View>
          </View>
        </View>

        {/* ── META ── */}
        <View style={styles.metaStrip}>
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
        <View style={styles.ftRow}>
          <View style={styles.ftBox}>
            <Text style={styles.ftLabel}>From</Text>
            <Text style={styles.personName}>{invoice.user.company || invoice.user.name}</Text>
            {invoice.user.company && <Text style={styles.personDetail}>{invoice.user.name}</Text>}
            {invoice.user.address && <Text style={styles.personDetail}>{invoice.user.address}</Text>}
            <Text style={styles.personDetail}>{invoice.user.email}</Text>
            {invoice.user.phone && <Text style={styles.personDetail}>{invoice.user.phone}</Text>}
          </View>
          <View style={styles.ftBoxLast}>
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
