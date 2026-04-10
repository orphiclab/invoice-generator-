import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const { error, session } = await requireAuth()
  if (error) return error

  const [totalInvoices, totalClients, invoices] = await Promise.all([
    prisma.invoice.count({ where: { userId: session!.userId } }),
    prisma.client.count({ where: { userId: session!.userId } }),
    prisma.invoice.findMany({
      where: { userId: session!.userId },
      select: { status: true, total: true },
    }),
  ])

  const totalRevenue = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
  const outstanding = invoices.filter((i) => i.status === 'SENT' || i.status === 'OVERDUE').reduce((s, i) => s + i.total, 0)

  const byStatus = {
    DRAFT: invoices.filter((i) => i.status === 'DRAFT').length,
    SENT: invoices.filter((i) => i.status === 'SENT').length,
    PAID: invoices.filter((i) => i.status === 'PAID').length,
    OVERDUE: invoices.filter((i) => i.status === 'OVERDUE').length,
  }

  return NextResponse.json({ totalInvoices, totalClients, totalRevenue, outstanding, byStatus })
}
