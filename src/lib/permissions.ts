import 'server-only'
import { getSession, SessionPayload } from './session'

/**
 * Permission matrix for each role.
 * Each permission maps to which roles can perform it.
 */
const PERMISSIONS = {
  // Invoice permissions
  'invoice:create':  ['ADMIN', 'MANAGER', 'SALES'],
  'invoice:read':    ['ADMIN', 'MANAGER', 'SALES', 'VIEWER'],
  'invoice:update':  ['ADMIN', 'MANAGER', 'SALES'],
  'invoice:delete':  ['ADMIN', 'MANAGER'],

  // Client permissions
  'client:create':   ['ADMIN', 'MANAGER', 'SALES'],
  'client:read':     ['ADMIN', 'MANAGER', 'SALES', 'VIEWER'],
  'client:update':   ['ADMIN', 'MANAGER', 'SALES'],
  'client:delete':   ['ADMIN', 'MANAGER'],

  // Expense permissions
  'expense:create':  ['ADMIN', 'MANAGER'],
  'expense:read':    ['ADMIN', 'MANAGER', 'VIEWER'],
  'expense:update':  ['ADMIN', 'MANAGER'],
  'expense:delete':  ['ADMIN', 'MANAGER'],

  // Estimate permissions
  'estimate:create': ['ADMIN', 'MANAGER', 'SALES'],
  'estimate:read':   ['ADMIN', 'MANAGER', 'SALES', 'VIEWER'],
  'estimate:update': ['ADMIN', 'MANAGER', 'SALES'],
  'estimate:delete': ['ADMIN', 'MANAGER'],

  // Product permissions
  'product:create':  ['ADMIN', 'MANAGER'],
  'product:read':    ['ADMIN', 'MANAGER', 'SALES', 'VIEWER'],
  'product:update':  ['ADMIN', 'MANAGER'],
  'product:delete':  ['ADMIN', 'MANAGER'],

  // Payment permissions
  'payment:create':  ['ADMIN', 'MANAGER'],
  'payment:read':    ['ADMIN', 'MANAGER', 'SALES', 'VIEWER'],

  // Reports & dashboard
  'report:read':     ['ADMIN', 'MANAGER', 'VIEWER'],
  'dashboard:read':  ['ADMIN', 'MANAGER', 'SALES', 'VIEWER'],

  // Settings & user management
  'settings:manage': ['ADMIN'],
  'user:manage':     ['ADMIN'],

  // Recurring
  'recurring:create': ['ADMIN', 'MANAGER'],
  'recurring:read':   ['ADMIN', 'MANAGER', 'VIEWER'],
  'recurring:update': ['ADMIN', 'MANAGER'],
  'recurring:delete': ['ADMIN', 'MANAGER'],
} as const

export type Permission = keyof typeof PERMISSIONS

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const allowed = PERMISSIONS[permission]
  return allowed ? (allowed as readonly string[]).includes(role) : false
}

/**
 * Require a specific permission. Returns session if authorized, or throws.
 */
export async function requirePermission(permission: Permission): Promise<{
  error?: Response
  session: SessionPayload | null
}> {
  const session = await getSession()
  if (!session) {
    return {
      error: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
      session: null,
    }
  }

  if (!hasPermission(session.role, permission)) {
    return {
      error: new Response(JSON.stringify({ error: 'Forbidden — insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
      session,
    }
  }

  return { session }
}

/**
 * Get the effective userId for data queries.
 * For ADMIN users: their own userId
 * For sub-users: their companyId (the admin's userId)
 * This ensures all users in a company see the same data.
 */
export function getCompanyUserId(session: SessionPayload): string {
  return session.companyId || session.userId
}
