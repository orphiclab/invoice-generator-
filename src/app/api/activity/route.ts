import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/activity — get recent activity for the current user
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const entityType = url.searchParams.get('type') // optional filter

  const logs = await prisma.activityLog.findMany({
    where: {
      userId: session.userId,
      ...(entityType ? { entityType } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json(logs)
}
