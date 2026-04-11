import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { logActivity, createNotification } from '@/lib/activity'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session!.userId },
    include: { client: true, items: true, user: { select: { name: true, email: true, company: true, phone: true, address: true } } },
  })
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(invoice)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params

  const body = await request.json()
  const { clientId, invoiceNo, status, issueDate, dueDate, notes, items, tax, discount } = body

  const invoice = await prisma.invoice.findFirst({ where: { id, userId: session!.userId } })
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const subtotal = items
    ? items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice, 0)
    : invoice.subtotal
  const taxAmount = (subtotal * (tax ?? invoice.tax)) / 100
  const discountAmount = (subtotal * (discount ?? invoice.discount)) / 100
  const total = subtotal + taxAmount - discountAmount

  // Delete old items and recreate
  if (items) {
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } })
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      ...(clientId && { clientId }),
      ...(invoiceNo && { invoiceNo }),
      ...(status && { status }),
      ...(issueDate && { issueDate: new Date(issueDate) }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(notes !== undefined && { notes }),
      ...(tax !== undefined && { tax }),
      ...(discount !== undefined && { discount }),
      subtotal,
      total,
      ...(items && {
        items: {
          create: items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      }),
    },
    include: { client: true, items: true },
  })

  // Log activity — detect status change
  const action = status && status !== invoice.status
    ? (status === 'PAID' ? 'paid' : status === 'SENT' ? 'sent' : 'updated')
    : 'updated'
  await logActivity({
    userId: session!.userId,
    action,
    entityType: 'invoice',
    entityId: updated.id,
    entityName: updated.invoiceNo,
    metadata: { total: updated.total, status: updated.status },
  })

  if (status === 'PAID' && status !== invoice.status) {
    await createNotification({
      userId: session!.userId,
      type: 'payment_received',
      title: 'Invoice Paid!',
      message: `${updated.invoiceNo} — Rs ${updated.total.toLocaleString()} has been marked as paid`,
      linkTo: `/invoices/${updated.id}`,
    })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params

  const invoice = await prisma.invoice.findFirst({ where: { id, userId: session!.userId } })
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.invoice.delete({ where: { id } })

  await logActivity({
    userId: session!.userId,
    action: 'deleted',
    entityType: 'invoice',
    entityId: id,
    entityName: invoice.invoiceNo,
  })

  return NextResponse.json({ success: true })
}
