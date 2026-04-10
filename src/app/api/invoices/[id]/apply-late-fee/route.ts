import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/invoices/[id]/apply-late-fee
// Body: { lateFeeRate: number } — percentage per month (e.g. 2 = 2%)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { id } = await params
  const { lateFeeRate } = await req.json()

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session!.userId },
  })

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (invoice.status === 'PAID') return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
  if (invoice.lateFeeApplied) return NextResponse.json({ error: 'Late fee already applied' }, { status: 400 })

  // Calculate days overdue
  const now = new Date()
  const dueDate = new Date(invoice.dueDate)
  const daysOverdue = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))

  if (daysOverdue === 0) {
    return NextResponse.json({ error: 'Invoice is not yet overdue' }, { status: 400 })
  }

  // Calculate late fee: (rate% per month) × (days/30) × subtotal
  const rate = lateFeeRate ?? invoice.lateFeeRate ?? 2 // default 2% per month
  const months = daysOverdue / 30
  const lateFeeAmount = parseFloat((invoice.subtotal * (rate / 100) * months).toFixed(2))
  const newTotal = invoice.total + lateFeeAmount

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      lateFeeRate: rate,
      lateFeeAmount,
      lateFeeApplied: true,
      total: newTotal,
      status: 'OVERDUE',
    },
    include: { client: true, items: true, currency: true },
  })

  return NextResponse.json({ invoice: updated, lateFeeAmount, daysOverdue })
}
