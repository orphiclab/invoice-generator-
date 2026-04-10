import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/estimates/[id]/convert — converts accepted estimate into an invoice
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { id } = await params

  try {
    const estimate = await prisma.estimate.findFirst({
      where: { id, userId: session!.userId },
      include: { items: true },
    })

    if (!estimate) return NextResponse.json({ error: 'Estimate not found' }, { status: 404 })
    if (estimate.invoice) return NextResponse.json({ error: 'Already converted' }, { status: 409 })

    // Generate invoice number
    const count = await prisma.invoice.count({ where: { userId: session!.userId } })
    const invoiceNo = `INV-${String(count + 1).padStart(4, '0')}`

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        clientId: estimate.clientId,
        userId: session!.userId,
        currencyId: estimate.currencyId,
        estimateId: estimate.id,
        dueDate,
        notes: estimate.notes,
        taxRate: estimate.taxRate,
        tax: estimate.tax,
        discount: estimate.discount,
        subtotal: estimate.subtotal,
        total: estimate.total,
        status: 'DRAFT',
        items: {
          create: estimate.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
    })

    // Mark estimate as converted
    await prisma.estimate.update({
      where: { id },
      data: { status: 'CONVERTED' },
    })

    return NextResponse.json({ invoiceId: invoice.id, invoiceNo }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to convert' }, { status: 500 })
  }
}
