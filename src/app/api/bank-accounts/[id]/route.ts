import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { id } = await params

  try {
    const account = await prisma.bankAccount.findUnique({ where: { id } })
    if (!account || account.userId !== session!.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.bankAccount.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete bank account' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { id } = await params

  try {
    const { name, details, isDefault } = await req.json()
    
    const account = await prisma.bankAccount.findUnique({ where: { id } })
    if (!account || account.userId !== session!.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (isDefault) {
      await prisma.bankAccount.updateMany({
        where: { userId: session!.userId },
        data: { isDefault: false },
      })
    }

    const updated = await prisma.bankAccount.update({
      where: { id },
      data: { name, details, isDefault },
    })
    
    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update bank account' }, { status: 500 })
  }
}
