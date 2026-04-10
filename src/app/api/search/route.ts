import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/search?q=... — universal search across invoices, clients, estimates, expenses
export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  const q = new URL(req.url).searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ invoices: [], clients: [], estimates: [], expenses: [] })

  const userId = session!.userId

  try {
    const [invoices, clients, estimates, expenses] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          userId,
          OR: [
            { invoiceNo: { contains: q, mode: 'insensitive' } },
            { client: { name: { contains: q, mode: 'insensitive' } } },
            { notes: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { client: { select: { name: true } } },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.estimate.findMany({
        where: {
          userId,
          OR: [
            { estimateNo: { contains: q, mode: 'insensitive' } },
            { client: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        include: { client: { select: { name: true } } },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.expense.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { date: 'desc' },
      }),
    ])

    return NextResponse.json({ invoices, clients, estimates, expenses })
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
