import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { logActivity } from '@/lib/activity'

// GET /api/products — list all products/services for the user
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const products = await prisma.product.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}

// POST /api/products — create a new product/service
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, description, unitPrice, unit, category, taxable } = body

  if (!name || unitPrice === undefined) {
    return NextResponse.json({ error: 'Name and unit price are required' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: description || null,
      unitPrice: parseFloat(unitPrice),
      unit: unit || 'unit',
      category: category || null,
      taxable: taxable !== false,
      userId: session.userId,
    },
  })

  await logActivity({
    userId: session.userId,
    action: 'created',
    entityType: 'product',
    entityId: product.id,
    entityName: product.name,
  })

  return NextResponse.json(product, { status: 201 })
}
