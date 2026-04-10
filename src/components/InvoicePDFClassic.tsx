import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const BRAND = '#1a2744'
const ACCENT = '#6366f1'
const LIGHT_BG = '#f3f4f6'
const MUTED = '#6b7280'
const DARK = '#111827'

const styles = StyleSheet.create({
  page: { fontSize: 10, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  headerBand: { backgroundColor: BRAND, paddingHorizontal: 40, paddingVertical: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  logoBox: { width: 32, height: 32, backgroundColor: ACCENT, borderRadius: 6, marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  companyName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#ffffff', marginBottom: 4 },
  companyDetail: { fontSize: 8, color: '#94a3b8', marginBottom: 2 },
  invoiceLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: ACCENT, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'right', marginBottom: 4 },
  invoiceNo: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#ffffff', textAlign: 'right' },
  metaStrip: { flexDirection: 'row', backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  metaCell: { flex: 1, paddingHorizontal: 24, paddingVertical: 12, borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  metaCellLast: { flex: 1, paddingHorizontal: 24, paddingVertical: 12 },
  metaLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  metaValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },
  fromToRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  fromToCell: { flex: 1, paddingHorizontal: 28, paddingVertical: 20, borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  fromToCellLast: { flex: 1, paddingHorizontal: 28, paddingVertical: 20 },
  sectionTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#9ca3af', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  clientName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 2 },
  clientDetail: { fontSize: 8, color: MUTED, marginBottom: 1.5 },
  tableContainer: { paddingHorizontal: 28, paddingVertical: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: LIGHT_BG, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 4, marginBottom: 2 },
  tableHeaderText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: LIGHT_BG },
  tableCell: { fontSize: 9, color: '#374151' },
  tableCellBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },
  totalsRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 28, paddingBottom: 4 },
  totalsBox: { width: 200 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalLineLabel: { fontSize: 9, color: MUTED },
  totalLineValue: { fontSize: 9, color: '#374151', fontFamily: 'Helvetica-Bold' },
  grandTotalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, marginTop: 4, borderTopWidth: 1.5, borderTopColor: ACCENT },
  grandTotalLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: DARK },
  grandTotalValue: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: ACCENT },
  notesBox: { marginHorizontal: 28, marginTop: 8, marginBottom: 20, padding: 12, backgroundColor: '#f9fafb', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: ACCENT },
  notesTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  notesText: { fontSize: 8, color: MUTED, lineHeight: 1.5 },
  badgePaid: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#dcfce7', borderRadius: 4, alignSelf: 'flex-end', marginTop: 8 },
  badgeSent: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#dbeafe', borderRadius: 4, alignSelf: 'flex-end', marginTop: 8 },
  badgeDraft: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#f3f4f6', borderRadius: 4, alignSelf: 'flex-end', marginTop: 8 },
  badgeOverdue: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#fee2e2', borderRadius: 4, alignSelf: 'flex-end', marginTop: 8 },
})

const STATUS_BADGE: Record<string, object> = { PAID: styles.badgePaid, SENT: styles.badgeSent, DRAFT: styles.badgeDraft, OVERDUE: styles.badgeOverdue }
const STATUS_COLORS: Record<string, string> = { PAID: '#166534', SENT: '#1d4ed8', DRAFT: '#374151', OVERDUE: '#991b1b' }

interface InvoiceItem { description: string; quantity: number; unitPrice: number; total: number }
interface Invoice {
  invoiceNo: string; status: string; total: number; subtotal: number; tax: number; discount: number
  dueDate: string; issueDate: string; notes?: string; lateFeeAmount?: number
  client: { name: string; email: string; phone?: string; company?: string; address?: string }
  user: { name: string; email: string; company?: string; phone?: string; address?: string }
  items: InvoiceItem[]
  currency?: { symbol: string; code: string }
}

export function InvoicePDFClassic({ invoice }: { invoice: Invoice | null }) {
  if (!invoice) return <Document><Page size="A4"><Text>No invoice data</Text></Page></Document>
  const sym = invoice.currency?.symbol ?? 'Rs '
  const fmt = (n: number) => `${sym}${n.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })
  const taxAmt = (invoice.subtotal * invoice.tax) / 100
  const discountAmt = (invoice.subtotal * invoice.discount) / 100

  return (
    <Document title={invoice.invoiceNo}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <View>
            <View style={styles.logoBox}><Text style={{ fontSize: 14, color: '#ffffff', fontFamily: 'Helvetica-Bold' }}>IF</Text></View>
            <Text style={styles.companyName}>{invoice.user.company || invoice.user.name}</Text>
            {invoice.user.company && <Text style={styles.companyDetail}>{invoice.user.name}</Text>}
            <Text style={styles.companyDetail}>{invoice.user.email}</Text>
            {invoice.user.phone && <Text style={styles.companyDetail}>{invoice.user.phone}</Text>}
            {invoice.user.address && <Text style={styles.companyDetail}>{invoice.user.address}</Text>}
          </View>
          <View>
            <Text style={styles.invoiceLabel}>Invoice</Text>
            <Text style={styles.invoiceNo}>{invoice.invoiceNo}</Text>
            <View style={STATUS_BADGE[invoice.status] || styles.badgeDraft}>
              <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: STATUS_COLORS[invoice.status] || '#374151' }}>{invoice.status}</Text>
            </View>
          </View>
        </View>
        <View style={styles.metaStrip}>
          <View style={styles.metaCell}><Text style={styles.metaLabel}>Invoice No</Text><Text style={styles.metaValue}>{invoice.invoiceNo}</Text></View>
          <View style={styles.metaCell}><Text style={styles.metaLabel}>Issue Date</Text><Text style={styles.metaValue}>{fmtDate(invoice.issueDate)}</Text></View>
          <View style={styles.metaCellLast}><Text style={styles.metaLabel}>Due Date</Text><Text style={styles.metaValue}>{fmtDate(invoice.dueDate)}</Text></View>
        </View>
        <View style={styles.fromToRow}>
          <View style={styles.fromToCell}>
            <Text style={styles.sectionTitle}>Invoice From</Text>
            <Text style={styles.clientName}>{invoice.user.company || invoice.user.name}</Text>
            {invoice.user.company && <Text style={styles.clientDetail}>{invoice.user.name}</Text>}
            {invoice.user.address && <Text style={styles.clientDetail}>{invoice.user.address}</Text>}
            <Text style={styles.clientDetail}>{invoice.user.email}</Text>
            {invoice.user.phone && <Text style={styles.clientDetail}>{invoice.user.phone}</Text>}
          </View>
          <View style={styles.fromToCellLast}>
            <Text style={styles.sectionTitle}>Invoice To</Text>
            <Text style={styles.clientName}>{invoice.client.name}</Text>
            {invoice.client.company && <Text style={styles.clientDetail}>{invoice.client.company}</Text>}
            {invoice.client.address && <Text style={styles.clientDetail}>{invoice.client.address}</Text>}
            <Text style={styles.clientDetail}>{invoice.client.email}</Text>
            {invoice.client.phone && <Text style={styles.clientDetail}>{invoice.client.phone}</Text>}
          </View>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 5 }]}>Item</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'right' }]}>Rate</Text>
            <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'right' }]}>Amount</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 5 }]}>{item.description}</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>{fmt(item.unitPrice)}</Text>
              <Text style={[styles.tableCellBold, { flex: 2, textAlign: 'right' }]}>{fmt(item.total)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.totalsRow}>
          <View style={styles.totalsBox}>
            <View style={styles.totalLine}><Text style={styles.totalLineLabel}>Subtotal</Text><Text style={styles.totalLineValue}>{fmt(invoice.subtotal)}</Text></View>
            {invoice.tax > 0 && <View style={styles.totalLine}><Text style={styles.totalLineLabel}>Tax ({invoice.tax}%)</Text><Text style={styles.totalLineValue}>{fmt(taxAmt)}</Text></View>}
            {invoice.discount > 0 && <View style={styles.totalLine}><Text style={styles.totalLineLabel}>Discount ({invoice.discount}%)</Text><Text style={[styles.totalLineValue, { color: '#166534' }]}>-{fmt(discountAmt)}</Text></View>}
            {!!invoice.lateFeeAmount && invoice.lateFeeAmount > 0 && <View style={styles.totalLine}><Text style={styles.totalLineLabel}>Late Fee</Text><Text style={[styles.totalLineValue, { color: '#DC2626' }]}>{fmt(invoice.lateFeeAmount)}</Text></View>}
            <View style={styles.grandTotalLine}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{fmt(invoice.total)}</Text>
            </View>
          </View>
        </View>
        {invoice.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
