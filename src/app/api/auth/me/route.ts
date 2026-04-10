import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  const { error, session } = await requireAuth()
  if (error) return error

  const user = await prisma.user.findUnique({
    where: { id: session!.userId },
    select: { id: true, name: true, email: true, company: true, phone: true, address: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PUT(request: Request) {
  const { error, session } = await requireAuth()
  if (error) return error

  const body = await request.json()
  const { name, email, company, phone, address, password } = body

  const data: Record<string, string> = {}
  if (name) data.name = name
  if (email) data.email = email
  if (company !== undefined) data.company = company
  if (phone !== undefined) data.phone = phone
  if (address !== undefined) data.address = address
  if (password) data.password = await bcrypt.hash(password, 12)

  const user = await prisma.user.update({
    where: { id: session!.userId },
    data,
    select: { id: true, name: true, email: true, company: true, phone: true, address: true },
  })
  return NextResponse.json(user)
}
