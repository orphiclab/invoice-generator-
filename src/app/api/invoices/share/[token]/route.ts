import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const invoice = await prisma.invoice.findUnique({
    where: { shareToken: token },
    include: {
      client: true,
      items: true,
      user: { select: { name: true, email: true, company: true, phone: true, address: true } },
    },
  })

  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  return NextResponse.json(invoice)
}
