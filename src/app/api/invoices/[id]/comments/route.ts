import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const comments = await prisma.invoiceComment.findMany({
    where: { invoiceId: id },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(comments)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { text } = await req.json()

  if (!text?.trim()) return NextResponse.json({ error: 'Comment text is required' }, { status: 400 })

  const comment = await prisma.invoiceComment.create({
    data: {
      text: text.trim(),
      invoiceId: id,
      userId: session.id,
      userName: session.name,
    },
  })

  return NextResponse.json(comment, { status: 201 })
}
