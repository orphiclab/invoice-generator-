import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  try {
    const expenses = await prisma.expense.findMany({
      where: {
        userId: session!.userId,
        ...(category ? { category } : {}),
        ...(from || to ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          }
        } : {}),
      },
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(expenses)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const body = await req.json()
    const { title, amount, date, category, description } = body

    if (!title || !amount || !date || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        date: new Date(date),
        category,
        description: description || null,
        userId: session!.userId,
      },
    })

    await logActivity({
      userId: session!.userId,
      action: 'created',
      entityType: 'expense',
      entityId: expense.id,
      entityName: expense.title,
      metadata: { amount: expense.amount, category },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
