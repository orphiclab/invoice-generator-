import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// ── Bauhaus Bold Palette ──────────────────────────────────────────
const NAVY       = '#1B2559'
const NAVY_DARK  = '#0F1740'
const ACCENT     = '#5B6ABF'
const LIGHT_BLUE = '#E8EAFF'
const WARM_GREY  = '#F5F5F7'
const WHITE      = '#FFFFFF'
const DARK       = '#111827'
const MUTED      = '#6B7280'
const BORDER     = '#E5E7EB'

const styles = StyleSheet.create({
  page: { fontSize: 10, fontFamily: 'Helvetica', backgroundColor: WHITE, position: 'relative' },

  // ── Geometric top blocks ────────────────────────────────────────
  topRow: { flexDirection: 'row', height: 8 },
  topBlock1: { flex: 3, backgroundColor: NAVY },
  topBlock2: { flex: 1, backgroundColor: ACCENT },
  topBlock3: { flex: 2, backgroundColor: NAVY_DARK },

  // ── Header — side-by-side: left has date/invoice, right has logo ─
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 44, paddingTop: 28, paddingBottom: 20 },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: 'flex-end' },

  // Small date line at top-left
  dateLine: { fontSize: 8, color: MUTED, marginBottom: 4 },
  dateValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 16 },

  // Big INVOICE word
  invoiceWord: { fontSize: 38, fontFamily: 'Helvetica-Bold', color: NAVY, letterSpacing: -1, marginBottom: 2 },
  invoiceSubtext: { fontSize: 8, fontStyle: 'italic', color: ACCENT, marginBottom: 16 },

  // Invoice To section — larger name
  invoiceToLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: ACCENT, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  clientName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 4 },
  clientDetail: { fontSize: 8.5, color: MUTED, marginBottom: 2, lineHeight: 1.4 },

  // Right side — company logo area
  logoBox: { width: 56, height: 56, backgroundColor: NAVY, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  companyName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: DARK, textAlign: 'right', marginBottom: 3 },
  companyDetail: { fontSize: 8, color: MUTED, textAlign: 'right', marginBottom: 2 },

  // ── Divider ─────────────────────────────────────────────────────
  divider: { height: 2, backgroundColor: NAVY, marginHorizontal: 44, marginBottom: 4 },
  dividerThin: { height: 0.5, backgroundColor: ACCENT, marginHorizontal: 44, marginBottom: 16 },

  // ── Two-column body: left = terms, right = items table ──────────
  bodyRow: { flexDirection: 'row', paddingHorizontal: 44, marginBottom: 16 },
  bodyLeft: { width: 180, paddingRight: 20 },
  bodyRight: { flex: 1 },

  // Terms & conditions
  termsTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
  termsCheckRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5 },
  termsCheckbox: { width: 10, height: 10, borderWidth: 1.5, borderColor: ACCENT, marginRight: 6, marginTop: 1 },
  termsText: { fontSize: 7.5, color: MUTED, lineHeight: 1.5, flex: 1 },

  // ── Items Table ─────────────────────────────────────────────────
  tableHeader: { flexDirection: 'row', backgroundColor: LIGHT_BLUE, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 1 },
  tableHeaderText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  tableCell: { fontSize: 9, color: '#374151', lineHeight: 1.4 },
  tableCellBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },

  // ── Totals — aligned right below table ──────────────────────────
  totalsArea: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 44, paddingTop: 8, paddingBottom: 12 },
  totalsBox: { width: 200 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalLabel: { fontSize: 8.5, color: MUTED },
  totalValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: DARK },

  // Grand total — bold navy block
  grandTotalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: NAVY, borderRadius: 4, marginTop: 4 },
  grandTotalLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: WHITE },
  grandTotalValue: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: WHITE },

  // ── Paid stamp ──────────────────────────────────────────────────
  paidStamp: { marginHorizontal: 44, marginBottom: 12, paddingVertical: 8, backgroundColor: LIGHT_BLUE, borderRadius: 4, borderWidth: 2, borderColor: ACCENT, alignItems: 'center' },
  paidText: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: NAVY, letterSpacing: 5, textTransform: 'uppercase' },

  // ── Notes ───────────────────────────────────────────────────────
  notesBox: { marginHorizontal: 44, marginBottom: 16, padding: 12, backgroundColor: WARM_GREY, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: ACCENT },
  notesLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: ACCENT, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 },
  notesText: { fontSize: 8, color: MUTED, lineHeight: 1.5 },

  // ── Footer — contact info bar + Thank You ───────────────────────
  footerContactBar: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 10, paddingHorizontal: 44, backgroundColor: WARM_GREY, borderTopWidth: 1, borderTopColor: BORDER },
  footerContact: { fontSize: 7.5, color: MUTED },

  // Manager badge
  managerArea: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 44, paddingVertical: 12 },
  managerName: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: DARK, marginRight: 8 },
  managerBadge: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: ACCENT, borderRadius: 3 },
  managerBadgeText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: WHITE, textTransform: 'uppercase', letterSpacing: 1 },

  // Bottom geometric blocks
  bottomRow: { flexDirection: 'row', height: 6, marginTop: 'auto' },
  bottomBlock1: { flex: 2, backgroundColor: ACCENT },
  bottomBlock2: { flex: 1, backgroundColor: NAVY },
  bottomBlock3: { flex: 3, backgroundColor: NAVY_DARK },

  statusChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 3, alignSelf: 'flex-end', marginTop: 6 },
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

export function InvoicePDFBauhaus({ invoice }: { invoice: Invoice | null }) {
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

        {/* ── GEOMETRIC TOP BLOCKS ── */}
        <View style={styles.topRow}>
          <View style={styles.topBlock1} />
          <View style={styles.topBlock2} />
          <View style={styles.topBlock3} />
        </View>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.dateLine}>Date:</Text>
            <Text style={styles.dateValue}>{fmtDate(invoice.issueDate)}</Text>

            <Text style={styles.invoiceWord}>Invoice</Text>
            <Text style={styles.invoiceSubtext}>&quot;Professional billing made simple&quot;</Text>

            <Text style={styles.invoiceToLabel}>Invoice To</Text>
            <Text style={styles.clientName}>{invoice.client.name}</Text>
            {invoice.client.company && <Text style={styles.clientDetail}>{invoice.client.company}</Text>}
            {invoice.client.address && <Text style={styles.clientDetail}>{invoice.client.address}</Text>}
            <Text style={styles.clientDetail}>{invoice.client.email}</Text>
            {invoice.client.phone && <Text style={styles.clientDetail}>{invoice.client.phone}</Text>}
          </View>

          <View style={styles.headerRight}>
            <View style={styles.logoBox}>
              <Text style={{ fontSize: 20, color: WHITE, fontFamily: 'Helvetica-Bold' }}>IF</Text>
            </View>
            <Text style={styles.companyName}>{invoice.user.company || invoice.user.name}</Text>
            {invoice.user.company && <Text style={styles.companyDetail}>{invoice.user.name}</Text>}
            <Text style={styles.companyDetail}>{invoice.user.email}</Text>
            {invoice.user.phone && <Text style={styles.companyDetail}>{invoice.user.phone}</Text>}
            {invoice.user.address && <Text style={styles.companyDetail}>{invoice.user.address}</Text>}
            <View style={[styles.statusChip, { backgroundColor: statusStyle.bg }]}>
              <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: statusStyle.text }}>{invoice.status}</Text>
            </View>
          </View>
        </View>

        {/* ── DIVIDER ── */}
        <View style={styles.divider} />
        <View style={styles.dividerThin} />

        {/* ── TWO-COLUMN BODY ── */}
        <View style={styles.bodyRow}>
          {/* Left — Terms & info */}
          <View style={styles.bodyLeft}>
            <Text style={{ fontSize: 7.5, color: MUTED, marginBottom: 3 }}>Invoice No: {invoice.invoiceNo}</Text>
            <Text style={{ fontSize: 7.5, color: MUTED, marginBottom: 3 }}>Due Date: {fmtDate(invoice.dueDate)}</Text>
            <Text style={{ fontSize: 7.5, color: MUTED, marginBottom: 12 }}>Issue Date: {fmtDate(invoice.issueDate)}</Text>

            {(invoice.notes || invoice.bankDetails) && (
              <>
                <Text style={styles.termsTitle}>Terms & Conditions</Text>
                {invoice.notes && (
                  <View style={styles.termsCheckRow}>
                    <View style={styles.termsCheckbox} />
                    <Text style={styles.termsText}>{invoice.notes}</Text>
                  </View>
                )}
                {invoice.bankDetails && (
                  <View style={styles.termsCheckRow}>
                    <View style={styles.termsCheckbox} />
                    <Text style={styles.termsText}>{invoice.bankDetails}</Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Right — Items Table */}
          <View style={styles.bodyRight}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 4 }]}>Item Description</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Rate</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
            </View>
            {invoice.items.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 4 }]}>{item.description}</Text>
                <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>{fmt(item.unitPrice)}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.quantity}</Text>
                <Text style={[styles.tableCellBold, { flex: 1.5, textAlign: 'right' }]}>{fmt(item.total)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── TOTALS ── */}
        <View style={styles.totalsArea}>
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
            <View style={styles.grandTotalBox}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>{fmt(invoice.total)}</Text>
            </View>
          </View>
        </View>

        {/* ── PAID STAMP ── */}
        {invoice.status === 'PAID' && (
          <View style={styles.paidStamp}>
            <Text style={styles.paidText}>✓  Paid</Text>
          </View>
        )}

        {/* ── MANAGER AREA ── */}
        <View style={styles.managerArea}>
          <Text style={styles.managerName}>{invoice.user.name}</Text>
          <View style={styles.managerBadge}>
            <Text style={styles.managerBadgeText}>Manager</Text>
          </View>
        </View>

        {/* ── FOOTER CONTACT BAR ── */}
        <View style={styles.footerContactBar}>
          {invoice.user.phone && <Text style={styles.footerContact}>📞 {invoice.user.phone}</Text>}
          <Text style={styles.footerContact}>✉ {invoice.user.email}</Text>
          {invoice.user.address && <Text style={styles.footerContact}>📍 {invoice.user.address}</Text>}
        </View>

        {/* ── GEOMETRIC BOTTOM BLOCKS ── */}
        <View style={styles.bottomRow}>
          <View style={styles.bottomBlock1} />
          <View style={styles.bottomBlock2} />
          <View style={styles.bottomBlock3} />
        </View>

      </Page>
    </Document>
  )
}
