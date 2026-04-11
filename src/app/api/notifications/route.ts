import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/notifications — list notifications for the current user
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const unreadOnly = url.searchParams.get('unread') === 'true'
  const limit = parseInt(url.searchParams.get('limit') || '30')

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.userId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  const unreadCount = await prisma.notification.count({
    where: { userId: session.userId, isRead: false },
  })

  return NextResponse.json({ notifications, unreadCount })
}

// PATCH /api/notifications — mark notifications as read
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { ids, markAll } = body as { ids?: string[]; markAll?: boolean }

  if (markAll) {
    await prisma.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    })
  } else if (ids && ids.length > 0) {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId: session.userId },
      data: { isRead: true },
    })
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/notifications — clear all notifications
export async function DELETE() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.notification.deleteMany({
    where: { userId: session.userId },
  })

  return NextResponse.json({ success: true })
}
