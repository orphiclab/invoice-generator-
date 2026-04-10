import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Invite a member by email to a team
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error
  try {
    const { teamId, email, role } = await req.json()
    if (!teamId || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Check requester is owner/admin of team
    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId: session!.userId, role: { in: ['OWNER', 'ADMIN'] } },
    })
    if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    // Find user by email
    const invitee = await prisma.user.findUnique({ where: { email } })
    if (!invitee) return NextResponse.json({ error: 'No user found with that email' }, { status: 404 })

    // Add to team
    const member = await prisma.teamMember.upsert({
      where: { userId_teamId: { userId: invitee.id, teamId } },
      update: { role: role ?? 'MEMBER' },
      create: { userId: invitee.id, teamId, role: role ?? 'MEMBER' },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(member, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to invite' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error
  try {
    const { teamId, userId } = await req.json()
    // Only owner can remove members
    const team = await prisma.team.findFirst({ where: { id: teamId, ownerId: session!.userId } })
    if (!team) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    await prisma.teamMember.deleteMany({ where: { teamId, userId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
