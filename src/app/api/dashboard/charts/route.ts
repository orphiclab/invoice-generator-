import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const now = new Date()
    const twelveMonthsAgo = new Date(now)
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
    twelveMonthsAgo.setDate(1)
    twelveMonthsAgo.setHours(0, 0, 0, 0)

    // Get all paid invoices in last 12 months
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: session!.userId,
        issueDate: { gte: twelveMonthsAgo },
      },
      select: {
        total: true,
        status: true,
        issueDate: true,
        client: { select: { name: true } },
      },
    })

    // Monthly revenue (paid only)
    const monthlyMap: Record<string, number> = {}
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now)
      d.setMonth(d.getMonth() - i)
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      monthlyMap[key] = 0
    }
    for (const inv of invoices) {
      if (inv.status !== 'PAID') continue
      const d = new Date(inv.issueDate)
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      if (key in monthlyMap) {
        monthlyMap[key] += inv.total
      }
    }
    const monthlyRevenue = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue }))

    // Revenue by client (top 6)
    const clientRevMap: Record<string, number> = {}
    for (const inv of invoices) {
      if (inv.status !== 'PAID') continue
      const name = inv.client.name
      clientRevMap[name] = (clientRevMap[name] || 0) + inv.total
    }
    const revenueByClient = Object.entries(clientRevMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, revenue]) => ({ name, revenue }))

    // Status breakdown
    const statusCounts = await prisma.invoice.groupBy({
      by: ['status'],
      where: { userId: session!.userId },
      _count: { status: true },
    })
    const statusData = statusCounts.map((s) => ({
      name: s.status,
      value: s._count.status,
    }))

    // Expenses last 12 months
    const expenses = await prisma.expense.findMany({
      where: {
        userId: session!.userId,
        date: { gte: twelveMonthsAgo },
      },
      select: { amount: true, date: true, category: true },
    })

    const expMonthlyMap: Record<string, number> = {}
    for (const key of Object.keys(monthlyMap)) expMonthlyMap[key] = 0
    for (const exp of expenses) {
      const d = new Date(exp.date)
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      if (key in expMonthlyMap) expMonthlyMap[key] += exp.amount
    }
    const profitLoss = monthlyRevenue.map(({ month, revenue }) => ({
      month,
      revenue: Math.round(revenue),
      expenses: Math.round(expMonthlyMap[month] || 0),
      profit: Math.round(revenue - (expMonthlyMap[month] || 0)),
    }))

    return NextResponse.json({ monthlyRevenue, revenueByClient, statusData, profitLoss })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to load chart data' }, { status: 500 })
  }
}
