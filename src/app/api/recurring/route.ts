import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { error, session } = await requireAuth()
  if (error) return error
  try {
    const recurring = await prisma.recurringInvoice.findMany({
      where: { userId: session!.userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(recurring)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error
  try {
    const { title, clientId, frequency, nextRunDate, total } = await req.json()
    if (!title || !clientId || !frequency || !nextRunDate) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const recurring = await prisma.recurringInvoice.create({
      data: {
        title,
        clientId,
        userId: session!.userId,
        frequency,
        nextRunDate: new Date(nextRunDate),
        total: parseFloat(total) || 0,
      },
    })
    return NextResponse.json(recurring, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
