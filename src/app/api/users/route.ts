import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

// GET /api/users — list all users in the company (admin only)
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const companyId = session.companyId || session.userId

  // Get admin + all sub-users
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { id: companyId },
        { companyId: companyId },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      phone: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(users)
}

// POST /api/users — create a new user (admin only)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Only admins can create users' }, { status: 403 })

  const body = await req.json()
  const { name, email, password, role, phone } = body

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Name, email, password, and role are required' }, { status: 400 })
  }

  if (!['MANAGER', 'SALES', 'VIEWER'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role. Use MANAGER, SALES, or VIEWER' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const companyId = session.companyId || session.userId

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      companyId,
      phone: phone || null,
    },
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

  return NextResponse.json(user, { status: 201 })
}
