import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/payments — list all payments for the current user's invoices
export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const invoiceId = searchParams.get('invoiceId')

  try {
    const payments = await prisma.payment.findMany({
      where: {
        invoice: { userId: session!.userId },
        ...(invoiceId ? { invoiceId } : {}),
      },
      include: {
        invoice: { select: { invoiceNo: true, client: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(payments)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
