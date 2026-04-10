import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Generate a client portal token
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error
  try {
    const { clientId, expiryDays } = await req.json()
    if (!clientId) return NextResponse.json({ error: 'Missing clientId' }, { status: 400 })

    // Verify ownership
    const client = await prisma.client.findFirst({ where: { id: clientId, userId: session!.userId } })
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (expiryDays ?? 30))

    const portalToken = await prisma.clientPortalToken.create({
      data: { clientId, expiresAt },
    })

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${portalToken.token}`
    return NextResponse.json({ token: portalToken.token, url, expiresAt })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
