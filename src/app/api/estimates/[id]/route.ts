import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params
  try {
    const estimate = await prisma.estimate.findFirst({
      where: { id, userId: session!.userId },
      include: {
        client: true,
        currency: true,
        items: true,
        invoice: { select: { id: true, invoiceNo: true } },
      },
    })
    if (!estimate) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(estimate)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params
  try {
    const body = await req.json()
    const { status, expiryDate, notes, taxRate, discount, currencyId, items } = body

    let updateData: Record<string, unknown> = {}

    // If only updating status
    if (status && !items) {
      updateData = { status }
    } else {
      let subtotal = 0
      const estimateItems = (items || []).map((item: { description: string; quantity: number; unitPrice: number }) => {
        const total = item.quantity * item.unitPrice
        subtotal += total
        return { description: item.description, quantity: item.quantity, unitPrice: item.unitPrice, total }
      })
      const taxAmt = (subtotal * (parseFloat(taxRate) || 0)) / 100
      const discountAmt = parseFloat(discount) || 0
      const total = subtotal + taxAmt - discountAmt

      // Delete existing items and recreate
      await prisma.estimateItem.deleteMany({ where: { estimateId: id } })

      updateData = {
        status,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        notes: notes || null,
        taxRate: parseFloat(taxRate) || 0,
        tax: taxAmt,
        discount: discountAmt,
        subtotal,
        total,
        currencyId: currencyId || null,
        items: { create: estimateItems },
      }
    }

    const estimate = await prisma.estimate.updateMany({
      where: { id, userId: session!.userId },
      data: { ...(updateData as object) },
    })
    if (!estimate.count) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params
  try {
    await prisma.estimate.deleteMany({ where: { id, userId: session!.userId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
