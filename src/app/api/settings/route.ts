import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/settings — get user settings
export async function GET() {
  const { error, session } = await requireAuth()
  if (error) return error
  try {
    const settings = await prisma.userSettings.upsert({
      where: { userId: session!.userId },
      update: {},
      create: { userId: session!.userId },
      include: { defaultCurrency: true },
    })
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// PUT /api/settings — update user settings
export async function PUT(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error
  try {
    const body = await req.json()
    const { invoicePrefix, defaultTaxRate, defaultDueDays, defaultNotes, defaultCurrencyId, bankDetails } = body
    const settings = await prisma.userSettings.upsert({
      where: { userId: session!.userId },
      update: { invoicePrefix, defaultTaxRate, defaultDueDays, defaultNotes, defaultCurrencyId: defaultCurrencyId || null, bankDetails },
      create: { userId: session!.userId, invoicePrefix, defaultTaxRate, defaultDueDays, defaultNotes, defaultCurrencyId: defaultCurrencyId || null, bankDetails },
      include: { defaultCurrency: true },
    })
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
