import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { logActivity } from '@/lib/activity'

// PUT /api/products/:id — update a product
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, description, unitPrice, unit, category, taxable, isActive } = body

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(unitPrice !== undefined && { unitPrice: parseFloat(unitPrice) }),
      ...(unit !== undefined && { unit }),
      ...(category !== undefined && { category }),
      ...(taxable !== undefined && { taxable }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  await logActivity({
    userId: session.userId,
    action: 'updated',
    entityType: 'product',
    entityId: product.id,
    entityName: product.name,
  })

  return NextResponse.json(product)
}

// DELETE /api/products/:id — delete a product
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.product.delete({ where: { id } })

  await logActivity({
    userId: session.userId,
    action: 'deleted',
    entityType: 'product',
    entityId: id,
    entityName: existing.name,
  })

  return NextResponse.json({ success: true })
}
