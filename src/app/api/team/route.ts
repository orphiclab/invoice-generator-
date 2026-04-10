import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { error, session } = await requireAuth()
  if (error) return error
  try {
    const members = await prisma.teamMember.findMany({
      where: { userId: session!.userId },
      include: { team: { include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } } } },
    })
    const ownedTeams = await prisma.team.findMany({
      where: { ownerId: session!.userId },
      include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
    })
    return NextResponse.json({ teams: ownedTeams, memberships: members })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error
  try {
    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const team = await prisma.team.create({
      data: {
        name,
        ownerId: session!.userId,
        members: { create: { userId: session!.userId, role: 'OWNER' } },
      },
      include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
    })
    return NextResponse.json(team, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
