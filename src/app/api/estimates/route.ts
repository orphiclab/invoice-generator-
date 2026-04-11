import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  try {
    const estimates = await prisma.estimate.findMany({
      where: {
        userId: session!.userId,
        ...(status ? { status: status as never } : {}),
      },
      include: {
        client: { select: { id: true, name: true, company: true } },
        currency: { select: { code: true, symbol: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(estimates)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch estimates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const body = await req.json()
    const { clientId, expiryDate, notes, taxRate, discount, currencyId, items } = body

    // Generate estimate number
    const count = await prisma.estimate.count({ where: { userId: session!.userId } })
    const estimateNo = `EST-${String(count + 1).padStart(4, '0')}`

    let subtotal = 0
    const estimateItems = (items || []).map((item: { description: string; quantity: number; unitPrice: number }) => {
      const total = item.quantity * item.unitPrice
      subtotal += total
      return { description: item.description, quantity: item.quantity, unitPrice: item.unitPrice, total }
    })

    const taxAmt = (subtotal * (parseFloat(taxRate) || 0)) / 100
    const discountAmt = parseFloat(discount) || 0
    const total = subtotal + taxAmt - discountAmt

    const estimate = await prisma.estimate.create({
      data: {
        estimateNo,
        clientId,
        userId: session!.userId,
        expiryDate: new Date(expiryDate),
        notes: notes || null,
        taxRate: parseFloat(taxRate) || 0,
        tax: taxAmt,
        discount: discountAmt,
        subtotal,
        total,
        currencyId: currencyId || null,
        items: { create: estimateItems },
      },
      include: { client: true, items: true },
    })

    await logActivity({
      userId: session!.userId,
      action: 'created',
      entityType: 'estimate',
      entityId: estimate.id,
      entityName: estimate.estimateNo,
      metadata: { total, clientId },
    })

    return NextResponse.json(estimate, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create estimate' }, { status: 500 })
  }
}
