import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params

  const client = await prisma.client.findFirst({
    where: { id, userId: session!.userId },
    include: { invoices: { orderBy: { createdAt: 'desc' } } },
  })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(client)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params

  const body = await request.json()
  const { name, email, phone, company, address } = body

  const client = await prisma.client.findFirst({ where: { id, userId: session!.userId } })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.client.update({
    where: { id },
    data: { name, email, phone, company, address },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error
  const { id } = await params

  const client = await prisma.client.findFirst({ where: { id, userId: session!.userId } })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.client.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
