import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { logActivity } from '@/lib/activity'

export async function GET() {
  const { error, session } = await requireAuth()
  if (error) return error

  const clients = await prisma.client.findMany({
    where: { userId: session!.userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { invoices: true } } },
  })

  return NextResponse.json(clients)
}

export async function POST(request: Request) {
  const { error, session } = await requireAuth()
  if (error) return error

  const body = await request.json()
  const { name, email, phone, company, address } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  const client = await prisma.client.create({
    data: { name, email, phone, company, address, userId: session!.userId },
  })

  await logActivity({
    userId: session!.userId,
    action: 'created',
    entityType: 'client',
    entityId: client.id,
    entityName: client.name,
  })

  return NextResponse.json(client, { status: 201 })
}
