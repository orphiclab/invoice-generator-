import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const { invoiceId, to, subject, message } = await req.json()
    if (!invoiceId || !to) return NextResponse.json({ error: 'invoiceId and to are required' }, { status: 400 })

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId: session!.userId },
      include: {
        client: true,
        items: true,
        user: { select: { name: true, email: true, company: true } },
        currency: true,
      },
    })
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const shareUrl = `${appUrl}/share/${invoice.shareToken ?? invoice.id}`
    const sym = invoice.currency?.symbol ?? 'Rs '
    const senderName = invoice.user.company ?? invoice.user.name

    const emailBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Invoice ${invoice.invoiceNo}</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Card -->
    <div style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:40px;margin-bottom:24px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05),0 2px 4px -1px rgba(0,0,0,0.03);">
      
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#8b5cf6,#3b82f6);display:flex;align-items:center;justify-content:center;">
            <span style="color:white;font-size:18px;font-weight:bold;">⚡</span>
          </div>
          <div>
            <h2 style="margin:0;font-size:18px;font-weight:700;color:#111827;">${senderName}</h2>
            <p style="margin:0;font-size:13px;color:#6b7280;">Secure Invoice</p>
          </div>
        </div>
      </div>

      <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#111827;letter-spacing:-0.5px;">Invoice ${invoice.invoiceNo}</h1>
      <p style="margin:0 0 32px;color:#6b7280;font-size:15px;">Billed to ${invoice.client.name}</p>
      
      ${message ? `<div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:32px;border-left:4px solid #8b5cf6;"><p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${message}</p></div>` : ''}
      
      <!-- Invoice Summary -->
      <div style="border-top:1px solid #e5e7eb;padding-top:24px;margin-bottom:32px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:12px 0;font-size:14px;color:#4b5563;">Date Issued</td>
            <td style="padding:12px 0;font-size:14px;color:#111827;text-align:right;font-weight:500;">${new Date(invoice.issueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;font-size:14px;color:#4b5563;border-bottom:1px solid #e5e7eb;">Due Date</td>
            <td style="padding:12px 0;font-size:14px;color:#ef4444;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb;">${new Date(invoice.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="padding:20px 0 0;font-size:16px;color:#111827;font-weight:600;">Amount Due</td>
            <td style="padding:20px 0 0;font-size:28px;color:#111827;text-align:right;font-weight:800;letter-spacing:-1px;">${sym}${invoice.total.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>
      
      <!-- CTA -->
      <div style="text-align:center;margin-top:40px;">
        <a href="${shareUrl}" style="display:inline-block;width:100%;background:#111827;color:white;text-decoration:none;padding:16px 0;border-radius:8px;font-weight:600;font-size:16px;text-align:center;">
          Review and pay online
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <p style="text-align:center;color:#6b7280;font-size:13px;margin:0;">
      Powered securely by <strong>InvoiceFlow</strong>
    </p>
  </div>
</body>
</html>`

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${senderName} <onboarding@resend.dev>`,
      reply_to: invoice.user.email,
      to: [to],
      subject: subject ?? `Invoice ${invoice.invoiceNo} from ${senderName}`,
      html: emailBody,
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return NextResponse.json({ error: emailError.message }, { status: 500 })
    }

    // Mark invoice as SENT if it was DRAFT
    if (invoice.status === 'DRAFT') {
      await prisma.invoice.update({ where: { id: invoiceId }, data: { status: 'SENT' } })
    }

    return NextResponse.json({ success: true, emailId: emailData?.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
