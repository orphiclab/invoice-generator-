import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/invoices/[id]/send-reminder
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth()
  if (error) return error

  const { id } = await params

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session!.userId },
    include: {
      client: true,
      items: true,
      currency: true,
      user: { select: { name: true, email: true, company: true } },
    },
  })

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (invoice.status === 'PAID') return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const shareUrl = `${appUrl}/share/${invoice.shareToken ?? invoice.id}`
  const currSymbol = invoice.currency?.symbol ?? 'Rs'
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-LK')
  const daysOverdue = Math.max(0, Math.floor(
    (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
  ))

  const isOverdue = daysOverdue > 0
  const subject = isOverdue
    ? `⚠️ Payment Overdue: Invoice ${invoice.invoiceNo} (${daysOverdue} days late)`
    : `Friendly Reminder: Invoice ${invoice.invoiceNo} due ${dueDate}`

  const emailBody = isOverdue
    ? `Hi ${invoice.client.name},\n\nThis is a reminder that Invoice ${invoice.invoiceNo} for ${currSymbol}${invoice.total.toLocaleString()} was due on ${dueDate} and is now ${daysOverdue} days overdue.\n\nPlease arrange payment at your earliest convenience.\n\nView invoice: ${shareUrl}\n\nThank you,\n${invoice.user.name ?? invoice.user.company ?? 'InvoiceFlow'}`
    : `Hi ${invoice.client.name},\n\nThis is a friendly reminder that Invoice ${invoice.invoiceNo} for ${currSymbol}${invoice.total.toLocaleString()} is due on ${dueDate}.\n\nView invoice: ${shareUrl}\n\nThank you,\n${invoice.user.name ?? invoice.user.company ?? 'InvoiceFlow'}`

  // Send via Resend if configured
  let emailSent = false
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.FROM_EMAIL ?? 'noreply@invoiceflow.app',
        to: invoice.client.email,
        subject,
        text: emailBody,
      })
      emailSent = true
    } catch (e) {
      console.error('Email send failed:', e)
    }
  }

  // Update reminder tracking
  await prisma.invoice.update({
    where: { id },
    data: {
      remindersSent: { increment: 1 },
      lastReminderAt: new Date(),
    },
  })

  return NextResponse.json({
    success: true,
    emailSent,
    remindersSent: invoice.remindersSent + 1,
    message: emailSent ? 'Reminder sent successfully' : 'Reminder logged (email not configured)',
  })
}
