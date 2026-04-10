import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/invoices/[id]/duplicate
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params

  try {
    const original = await prisma.invoice.findFirst({
      where: { id, userId: session!.userId },
      include: { items: true },
    })
    if (!original) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Get user settings for invoice numbering
    const settings = await prisma.userSettings.findUnique({ where: { userId: session!.userId } })
    const prefix = settings?.invoicePrefix ?? 'INV'
    const count = await prisma.invoice.count({ where: { userId: session!.userId } })
    const invoiceNo = `${prefix}-${String(count + 1).padStart(4, '0')}`

    const duplicate = await prisma.invoice.create({
      data: {
        invoiceNo,
        clientId: original.clientId,
        userId: session!.userId,
        currencyId: original.currencyId,
        status: 'DRAFT',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        notes: original.notes,
        taxRate: original.taxRate,
        tax: original.tax,
        discount: original.discount,
        subtotal: original.subtotal,
        total: original.total,
        items: {
          create: original.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
    })

    return NextResponse.json({ id: duplicate.id, invoiceNo: duplicate.invoiceNo }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to duplicate' }, { status: 500 })
  }
}
