import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/invoices/[id]/record-payment — record a manual/partial payment
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { id } = await params
  const { amount, method, note, paidAt } = await req.json()

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session!.userId },
    include: { payments: { where: { status: 'COMPLETED' } } },
  })

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (invoice.status === 'PAID') return NextResponse.json({ error: 'Invoice already fully paid' }, { status: 400 })

  const alreadyPaid = invoice.payments.reduce((s, p) => s + p.amount, 0)
  const remaining = invoice.total - alreadyPaid

  if (amount > remaining + 0.01) {
    return NextResponse.json({ error: `Amount exceeds remaining balance of ${remaining.toFixed(2)}` }, { status: 400 })
  }

  const isFullPayment = Math.abs(amount - remaining) < 0.01

  // Create the payment record
  const payment = await prisma.payment.create({
    data: {
      invoiceId: id,
      amount,
      currency: invoice.currencyId ? 'lkr' : 'lkr',
      status: 'COMPLETED',
      provider: method ?? 'manual',
      method: method ?? 'manual',
      note: note ?? null,
      paymentType: isFullPayment ? 'full' : 'partial',
      paidAt: paidAt ? new Date(paidAt) : new Date(),
    },
  })

  // Update invoice status
  const newStatus = isFullPayment ? 'PAID' : 'SENT'
  await prisma.invoice.update({
    where: { id },
    data: { status: newStatus },
  })

  return NextResponse.json({
    payment,
    invoiceStatus: newStatus,
    amountPaid: alreadyPaid + amount,
    remaining: remaining - amount,
    isFullPayment,
  })
}

// GET /api/invoices/[id]/record-payment — get payment history
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { id } = await params

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session!.userId },
    include: {
      payments: { orderBy: { createdAt: 'desc' } },
      currency: true,
    },
  })

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const amountPaid = invoice.payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((s, p) => s + p.amount, 0)

  return NextResponse.json({
    payments: invoice.payments,
    total: invoice.total,
    amountPaid,
    remaining: invoice.total - amountPaid,
    currency: invoice.currency,
  })
}
