import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))
  const periodType = searchParams.get('periodType') ?? 'yearly'
  const quarter = parseInt(searchParams.get('quarter') ?? '0')

  // Determine date range
  let startDate: Date, endDate: Date
  if (periodType === 'quarterly') {
    const startMonth = quarter * 3
    startDate = new Date(year, startMonth, 1)
    endDate = new Date(year, startMonth + 3, 0, 23, 59, 59)
  } else {
    startDate = new Date(year, 0, 1)
    endDate = new Date(year, 11, 31, 23, 59, 59)
  }

  try {
    const [invoices, expenses] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId: session!.userId, issueDate: { gte: startDate, lte: endDate } },
        select: { total: true, tax: true, taxRate: true, status: true, issueDate: true },
      }),
      prisma.expense.findMany({
        where: { userId: session!.userId, date: { gte: startDate, lte: endDate } },
        select: { amount: true, category: true, date: true },
      }),
    ])

    const paidInvoices = invoices.filter(i => i.status === 'PAID')
    const totalRevenue = paidInvoices.reduce((s, i) => s + i.total, 0)
    const taxCollected = paidInvoices.reduce((s, i) => s + i.tax, 0)
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
    const profit = totalRevenue - totalExpenses

    // Monthly breakdown
    const months: Record<string, { revenue: number; expenses: number; tax: number }> = {}
    const monthCount = periodType === 'quarterly' ? 3 : 12
    const startMonth = periodType === 'quarterly' ? quarter * 3 : 0
    for (let m = 0; m < monthCount; m++) {
      const d = new Date(year, startMonth + m, 1)
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      months[key] = { revenue: 0, expenses: 0, tax: 0 }
    }
    for (const inv of paidInvoices) {
      const key = new Date(inv.issueDate).toLocaleString('default', { month: 'short', year: '2-digit' })
      if (months[key]) { months[key].revenue += inv.total; months[key].tax += inv.tax }
    }
    for (const exp of expenses) {
      const key = new Date(exp.date).toLocaleString('default', { month: 'short', year: '2-digit' })
      if (months[key]) months[key].expenses += exp.amount
    }
    const byMonth = Object.entries(months).map(([month, vals]) => ({ month, ...vals }))

    // Expense by category
    const catMap: Record<string, number> = {}
    for (const exp of expenses) catMap[exp.category] = (catMap[exp.category] || 0) + exp.amount
    const byCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([category, amount]) => ({ category, amount }))

    return NextResponse.json({
      period: periodType === 'quarterly' ? `Q${quarter + 1} ${year}` : String(year),
      totalRevenue, totalExpenses, profit, taxCollected,
      invoiceCount: invoices.length,
      paidCount: paidInvoices.length,
      byMonth, byCategory,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
