import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { randomBytes } from 'crypto'
import { logActivity, createNotification } from '@/lib/activity'

export async function GET(request: Request) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const clientId = searchParams.get('clientId')

  const where: Record<string, unknown> = { userId: session!.userId }
  if (status) where.status = status
  if (clientId) where.clientId = clientId

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
      items: true,
    },
  })

  return NextResponse.json(invoices)
}

export async function POST(request: Request) {
  const { error, session } = await requireAuth()
  if (error) return error

  const body = await request.json()
  const { clientId, invoiceNo, status, issueDate, dueDate, notes, items, tax, discount, currencyId, bankDetails } = body

  if (!clientId || !invoiceNo || !dueDate || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const client = await prisma.client.findFirst({ where: { id: clientId, userId: session!.userId } })
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const subtotal = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice, 0)
  const taxAmount = (subtotal * (tax || 0)) / 100
  const discountAmount = (subtotal * (discount || 0)) / 100
  const total = subtotal + taxAmount - discountAmount

  const shareToken = randomBytes(16).toString('hex')

  const invoice = await prisma.invoice.create({
    data: {
      userId: session!.userId,
      clientId,
      invoiceNo,
      status: status || 'DRAFT',
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      dueDate: new Date(dueDate),
      notes,
      bankDetails,
      subtotal,
      tax: tax || 0,
      discount: discount || 0,
      total,
      shareToken,
      ...(currencyId && { currencyId }),
      items: {
        create: items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          productId: item.productId || null,
        })),
      },
    },
    include: { client: true, items: true },
  })

  // Stock deduction for products with trackInventory = true
  await Promise.all(items.filter((i: any) => i.productId).map(async (item: any) => {
    const product = await prisma.product.findFirst({
      where: { id: item.productId, userId: session!.userId, trackInventory: true }
    })
    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: { stockQuantity: { decrement: item.quantity } }
      })
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          userId: session!.userId,
          type: 'OUT',
          quantity: item.quantity,
          reason: `Invoice ${invoice.invoiceNo}`
        }
      })
      
      // Stock Alert Notification
      const newStock = product.stockQuantity - item.quantity
      if (newStock <= product.lowStockThreshold) {
        await createNotification({
          userId: session!.userId,
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: `Product "${product.name}" is low on stock (${newStock} units remaining)`,
          linkTo: `/products`,
        })
      }
    }
  }))

  await logActivity({
    userId: session!.userId,
    action: 'created',
    entityType: 'invoice',
    entityId: invoice.id,
    entityName: invoice.invoiceNo,
    metadata: { total, clientName: client.name },
  })

  await createNotification({
    userId: session!.userId,
    type: 'invoice_created',
    title: 'Invoice Created',
    message: `Invoice ${invoice.invoiceNo} for Rs ${total.toLocaleString()} created for ${client.name}`,
    linkTo: `/invoices/${invoice.id}`,
  })

  return NextResponse.json(invoice, { status: 201 })
}
