import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// ── Color Palette — Green Modern Agency ─────────────────────────────
const GREEN_DARK   = '#1B4332'  // Deep forest green — header bg
const GREEN_MID    = '#2D6A4F'  // Mid green — accents
const GREEN_LIGHT  = '#40916C'  // Light green — table header
const GREEN_PALE   = '#D8F3DC'  // Pale mint — subtle bg
const GREEN_ACCENT = '#52B788'  // Accent green — borders, totals
const WHITE        = '#FFFFFF'
const OFF_WHITE    = '#F8FAF9'
const DARK         = '#1A2421'
const MUTED        = '#6B7C75'
const LIGHT_BORDER = '#B7E4C7'

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: WHITE,
  },

  // ── Header ──────────────────────────────────────────────────────
  header: {
    backgroundColor: GREEN_DARK,
    paddingHorizontal: 40,
    paddingTop: 32,
    paddingBottom: 0,
    position: 'relative',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    marginBottom: 3,
  },
  companyDetail: {
    fontSize: 8,
    color: '#95C4A5',
    marginBottom: 2,
  },
  invoiceWordLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: GREEN_ACCENT,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'right',
    marginBottom: 6,
  },
  invoiceNumber: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    textAlign: 'right',
    letterSpacing: -0.5,
  },

  // ── Green wave divider (simulated with thick border-bottom) ──────
  headerWave: {
    backgroundColor: GREEN_DARK,
    height: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerBottomStrip: {
    backgroundColor: GREEN_MID,
    height: 6,
  },

  // ── Meta strip (dates, status) ───────────────────────────────────
  metaStrip: {
    flexDirection: 'row',
    backgroundColor: GREEN_PALE,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_BORDER,
  },
  metaCell: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: LIGHT_BORDER,
  },
  metaCellLast: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  metaLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: GREEN_MID,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginTop: 2,
  },

  // ── From / To section ───────────────────────────────────────────
  fromToSection: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_BORDER,
  },
  fromBox: {
    flex: 1,
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: LIGHT_BORDER,
  },
  toBox: {
    flex: 1,
    paddingLeft: 28,
  },
  fromToLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: GREEN_MID,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: GREEN_ACCENT,
    paddingBottom: 4,
    alignSelf: 'flex-start',
  },
  personName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 3,
  },
  personDetail: {
    fontSize: 8.5,
    color: MUTED,
    marginBottom: 2,
    lineHeight: 1.4,
  },

  // ── Items Table ──────────────────────────────────────────────────
  tableContainer: {
    paddingHorizontal: 40,
    paddingTop: 20,
    paddingBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: GREEN_DARK,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 4,
    marginBottom: 1,
  },
  tableHeaderText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRowEven: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: OFF_WHITE,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_BORDER,
  },
  tableRowOdd: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_BORDER,
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },

  // ── Totals ───────────────────────────────────────────────────────
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 40,
    paddingTop: 12,
    paddingBottom: 16,
  },
  totalsBox: {
    width: 220,
    borderWidth: 1,
    borderColor: LIGHT_BORDER,
    borderRadius: 6,
    overflow: 'hidden',
  },
  totalLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_BORDER,
  },
  totalLineLabel: {
    fontSize: 8.5,
    color: MUTED,
  },
  totalLineValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: GREEN_DARK,
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
  },
  grandTotalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: GREEN_ACCENT,
  },

  // ── Notes ────────────────────────────────────────────────────────
  notesSection: {
    marginHorizontal: 40,
    marginBottom: 20,
    padding: 14,
    backgroundColor: GREEN_PALE,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: GREEN_ACCENT,
  },
  notesLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: GREEN_MID,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 8.5,
    color: MUTED,
    lineHeight: 1.6,
  },

  // ── Footer ───────────────────────────────────────────────────────
  footer: {
    backgroundColor: GREEN_DARK,
    paddingHorizontal: 40,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 8,
    color: '#95C4A5',
  },
  footerBrand: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: GREEN_ACCENT,
  },

  // ── Paid stamp ───────────────────────────────────────────────────
  paidStamp: {
    marginHorizontal: 40,
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#D1FAE5',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#34D399',
    alignItems: 'center',
  },
  paidText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#065F46',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
})

// ── Status colors ─────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PAID:    { bg: '#D1FAE5', text: '#065F46' },
  SENT:    { bg: '#DBEAFE', text: '#1E40AF' },
  DRAFT:   { bg: '#F3F4F6', text: '#374151' },
  OVERDUE: { bg: '#FEE2E2', text: '#991B1B' },
}

interface InvoiceItem { description: string; quantity: number; unitPrice: number; total: number }
interface Invoice {
  invoiceNo: string; status: string; total: number; subtotal: number; tax: number; discount: number
  dueDate: string; issueDate: string; notes?: string
  lateFeeAmount?: number
  client: { name: string; email: string; phone?: string; company?: string; address?: string }
  user: { name: string; email: string; company?: string; phone?: string; address?: string }
  items: InvoiceItem[]
  currency?: { symbol: string; code: string }
  bankDetails?: string | null
}

export function InvoicePDF({ invoice }: { invoice: Invoice | null }) {
  if (!invoice) return (
    <Document><Page size="A4"><Text>No invoice data</Text></Page></Document>
  )

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
            {/* Left — Company info */}
            <View>
              <View style={styles.logoCircle}>
                <Text style={{ fontSize: 16, color: WHITE, fontFamily: 'Helvetica-Bold' }}>IF</Text>
              </View>
              <Text style={styles.companyName}>{invoice.user.company || invoice.user.name}</Text>
              {invoice.user.company && <Text style={styles.companyDetail}>{invoice.user.name}</Text>}
              <Text style={styles.companyDetail}>{invoice.user.email}</Text>
              {invoice.user.phone && <Text style={styles.companyDetail}>{invoice.user.phone}</Text>}
              {invoice.user.address && <Text style={styles.companyDetail}>{invoice.user.address}</Text>}
            </View>
            {/* Right — Invoice label */}
            <View>
              <Text style={styles.invoiceWordLabel}>Invoice</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNo}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, alignSelf: 'flex-end', marginTop: 8 }]}>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: statusStyle.text }}>
                  {invoice.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.headerBottomStrip} />

        {/* ── META STRIP ── */}
        <View style={styles.metaStrip}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Invoice Number</Text>
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
        <View style={styles.fromToSection}>
          <View style={styles.fromBox}>
            <Text style={styles.fromToLabel}>From</Text>
            <Text style={styles.personName}>{invoice.user.company || invoice.user.name}</Text>
            {invoice.user.company && <Text style={styles.personDetail}>{invoice.user.name}</Text>}
            {invoice.user.address && <Text style={styles.personDetail}>{invoice.user.address}</Text>}
            <Text style={styles.personDetail}>{invoice.user.email}</Text>
            {invoice.user.phone && <Text style={styles.personDetail}>{invoice.user.phone}</Text>}
          </View>
          <View style={styles.toBox}>
            <Text style={styles.fromToLabel}>Bill To</Text>
            <Text style={styles.personName}>{invoice.client.name}</Text>
            {invoice.client.company && <Text style={styles.personDetail}>{invoice.client.company}</Text>}
            {invoice.client.address && <Text style={styles.personDetail}>{invoice.client.address}</Text>}
            <Text style={styles.personDetail}>{invoice.client.email}</Text>
            {invoice.client.phone && <Text style={styles.personDetail}>{invoice.client.phone}</Text>}
          </View>
        </View>

        {/* ── LINE ITEMS TABLE ── */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 5 }]}>Description</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'right' }]}>Unit Price</Text>
            <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'right' }]}>Amount</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
              <Text style={[styles.tableCell, { flex: 5 }]}>{item.description}</Text>
              <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'center' }]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>{fmt(item.unitPrice)}</Text>
              <Text style={[styles.tableCellBold, { flex: 2, textAlign: 'right' }]}>{fmt(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* ── TOTALS ── */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalLineRow}>
              <Text style={styles.totalLineLabel}>Subtotal</Text>
              <Text style={styles.totalLineValue}>{fmt(invoice.subtotal)}</Text>
            </View>
            {invoice.tax > 0 && (
              <View style={styles.totalLineRow}>
                <Text style={styles.totalLineLabel}>Tax ({invoice.tax}%)</Text>
                <Text style={styles.totalLineValue}>{fmt(taxAmt)}</Text>
              </View>
            )}
            {invoice.discount > 0 && (
              <View style={styles.totalLineRow}>
                <Text style={styles.totalLineLabel}>Discount ({invoice.discount}%)</Text>
                <Text style={[styles.totalLineValue, { color: GREEN_MID }]}>-{fmt(discountAmt)}</Text>
              </View>
            )}
            {invoice.lateFeeAmount && invoice.lateFeeAmount > 0 && (
              <View style={styles.totalLineRow}>
                <Text style={styles.totalLineLabel}>Late Fee</Text>
                <Text style={[styles.totalLineValue, { color: '#DC2626' }]}>{fmt(invoice.lateFeeAmount)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{fmt(invoice.total)}</Text>
            </View>
          </View>
        </View>

        {/* ── PAID STAMP ── */}
        {invoice.status === 'PAID' && (
          <View style={styles.paidStamp}>
            <Text style={styles.paidText}>✓ Paid</Text>
          </View>
        )}

        {/* ── NOTES & BANK DETAILS ── */}
        {(invoice.notes || invoice.bankDetails) && (
          <View style={styles.notesSection}>
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
