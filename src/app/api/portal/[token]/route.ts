import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  try {
    const portalToken = await prisma.clientPortalToken.findUnique({
      where: { token },
      include: {
        client: {
          include: {
            invoices: {
              include: { items: true, currency: true },
              orderBy: { createdAt: 'desc' },
            },
            estimates: {
              include: { items: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    })

    if (!portalToken) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    if (new Date(portalToken.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 410 })
    }

    return NextResponse.json({
      client: {
        name: portalToken.client.name,
        company: portalToken.client.company,
        email: portalToken.client.email,
      },
      invoices: portalToken.client.invoices,
      estimates: portalToken.client.estimates,
    })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
