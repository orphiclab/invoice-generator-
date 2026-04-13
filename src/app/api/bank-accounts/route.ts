import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const accounts = await prisma.bankAccount.findMany({
      where: { userId: session!.userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(accounts)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch bank accounts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const { name, details, isDefault } = await req.json()

    if (!name || !details) {
      return NextResponse.json({ error: 'Name and details are required' }, { status: 400 })
    }

    if (isDefault) {
      await prisma.bankAccount.updateMany({
        where: { userId: session!.userId },
        data: { isDefault: false },
      })
    }

    const account = await prisma.bankAccount.create({
      data: {
        userId: session!.userId,
        name,
        details,
        isDefault: isDefault || false,
      },
    })
    return NextResponse.json(account)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create bank account' }, { status: 500 })
  }
}
