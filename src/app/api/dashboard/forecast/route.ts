import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.id

  // Get outstanding invoices (SENT + OVERDUE)
  const outstanding = await prisma.invoice.findMany({
    where: { userId, status: { in: ['SENT', 'OVERDUE'] } },
    select: { id: true, invoiceNo: true, total: true, dueDate: true, status: true, client: { select: { name: true } } },
    orderBy: { dueDate: 'asc' },
  })

  // Get recurring invoices
  const recurring = await prisma.recurringInvoice.findMany({
    where: { userId, isActive: true },
    select: { id: true, title: true, total: true, frequency: true, nextRunDate: true },
    orderBy: { nextRunDate: 'asc' },
  })

  // Get paid invoices from last 6 months for trend
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const recentPaid = await prisma.invoice.findMany({
    where: { userId, status: 'PAID', issueDate: { gte: sixMonthsAgo } },
    select: { total: true, issueDate: true },
    orderBy: { issueDate: 'asc' },
  })

  // Calculate monthly revenue trend
  const monthlyRevenue: Record<string, number> = {}
  recentPaid.forEach(inv => {
    const key = `${new Date(inv.issueDate).getFullYear()}-${String(new Date(inv.issueDate).getMonth() + 1).padStart(2, '0')}`
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + inv.total
  })

  // Build 6-month forecast
  const forecast: { month: string; predicted: number; outstanding: number; recurring: number }[] = []
  const now = new Date()

  for (let i = 0; i < 6; i++) {
    const forecastDate = new Date(now)
    forecastDate.setMonth(forecastDate.getMonth() + i)
    const monthKey = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = forecastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

    // Outstanding invoices due in this month
    const outstandingForMonth = outstanding
      .filter(inv => {
        const d = new Date(inv.dueDate)
        return d.getFullYear() === forecastDate.getFullYear() && d.getMonth() === forecastDate.getMonth()
      })
      .reduce((sum, inv) => sum + inv.total, 0)

    // Recurring income for this month
    let recurringForMonth = 0
    recurring.forEach(rec => {
      const nextRun = new Date(rec.nextRunDate)
      // Simple frequency check
      const freqMonths = rec.frequency === 'WEEKLY' ? 0.25 : rec.frequency === 'BIWEEKLY' ? 0.5 : rec.frequency === 'MONTHLY' ? 1 : rec.frequency === 'QUARTERLY' ? 3 : 12

      if (freqMonths <= 1) {
        recurringForMonth += rec.total
      } else {
        // Check if this month aligns
        const monthsDiff = (forecastDate.getFullYear() - nextRun.getFullYear()) * 12 + (forecastDate.getMonth() - nextRun.getMonth())
        if (monthsDiff >= 0 && monthsDiff % freqMonths === 0) {
          recurringForMonth += rec.total
        }
      }
    })

    // Historical average for prediction baseline
    const avgMonthly = Object.values(monthlyRevenue).length > 0
      ? Object.values(monthlyRevenue).reduce((s, v) => s + v, 0) / Object.values(monthlyRevenue).length
      : 0

    forecast.push({
      month: monthLabel,
      predicted: Math.round(outstandingForMonth + recurringForMonth + (i > 0 ? avgMonthly * 0.3 : 0)),
      outstanding: Math.round(outstandingForMonth),
      recurring: Math.round(recurringForMonth),
    })
  }

  const totalOutstanding = outstanding.reduce((s, inv) => s + inv.total, 0)
  const totalRecurringMonthly = recurring.reduce((s, rec) => {
    const freqMonths = rec.frequency === 'WEEKLY' ? 0.25 : rec.frequency === 'BIWEEKLY' ? 0.5 : rec.frequency === 'MONTHLY' ? 1 : rec.frequency === 'QUARTERLY' ? 3 : 12
    return s + rec.total / freqMonths
  }, 0)

  return NextResponse.json({
    forecast,
    summary: {
      totalOutstanding: Math.round(totalOutstanding),
      monthlyRecurring: Math.round(totalRecurringMonthly),
      avgMonthlyRevenue: Math.round(
        Object.values(monthlyRevenue).length > 0
          ? Object.values(monthlyRevenue).reduce((s, v) => s + v, 0) / Object.values(monthlyRevenue).length
          : 0
      ),
      upcomingInvoices: outstanding.slice(0, 5).map(inv => ({
        invoiceNo: inv.invoiceNo,
        client: inv.client.name,
        total: inv.total,
        dueDate: inv.dueDate,
        status: inv.status,
      })),
    },
    monthlyRevenue,
  })
}
