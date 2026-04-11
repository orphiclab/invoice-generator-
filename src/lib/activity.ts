import 'server-only'
import { prisma } from '@/lib/prisma'

/**
 * Log an activity event for audit trail.
 * Call this from any API route after a successful action.
 */
export async function logActivity(params: {
  userId: string
  action: string       // created, updated, deleted, sent, paid, converted, etc.
  entityType: string   // invoice, estimate, client, expense, payment, etc.
  entityId?: string
  entityName?: string  // human-readable: "INV-0012", "John Doe"
  metadata?: Record<string, unknown>
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        metadata: params.metadata ?? undefined,
      },
    })
  } catch (err) {
    // Never let activity logging break the main flow
    console.error('[ActivityLog] Failed to log:', err)
  }
}

/**
 * Create a notification for a user.
 */
export async function createNotification(params: {
  userId: string
  type: string
  title: string
  message: string
  linkTo?: string
  metadata?: Record<string, unknown>
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        linkTo: params.linkTo,
        metadata: params.metadata ?? undefined,
      },
    })
  } catch (err) {
    console.error('[Notification] Failed to create:', err)
  }
}
