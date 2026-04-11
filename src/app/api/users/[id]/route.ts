import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

// PATCH /api/users/[id] — update user role, active status, etc.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const companyId = session.companyId || session.userId

  // Cannot edit yourself
  if (id === session.userId) {
    return NextResponse.json({ error: 'Cannot modify your own account here' }, { status: 400 })
  }

  // Verify user belongs to this company
  const user = await prisma.user.findFirst({
    where: { id, companyId },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await req.json()
  const { role, isActive, name, phone } = body

  const data: Record<string, unknown> = {}
  if (role && ['MANAGER', 'SALES', 'VIEWER'].includes(role)) data.role = role
  if (typeof isActive === 'boolean') data.isActive = isActive
  if (name) data.name = name
  if (phone !== undefined) data.phone = phone || null

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      phone: true,
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/users/[id] — remove a sub-user
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const companyId = session.companyId || session.userId

  if (id === session.userId) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  const user = await prisma.user.findFirst({ where: { id, companyId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

// POST /api/users/[id]/reset-password — admin resets a user's password
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const companyId = session.companyId || session.userId

  const user = await prisma.user.findFirst({ where: { id, companyId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await req.json()
  const { password } = body
  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { id }, data: { password: hashedPassword } })

  return NextResponse.json({ success: true })
}
