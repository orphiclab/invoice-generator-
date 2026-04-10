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
<body style="margin:0;padding:0;background:#0d1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;">
        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#8b5cf6,#3b82f6);display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:16px;font-weight:bold;">⚡</span>
        </div>
        <span style="font-size:20px;font-weight:700;color:white;">InvoiceFlow</span>
      </div>
    </div>
    <!-- Card -->
    <div style="background:#161b27;border-radius:16px;border:1px solid #1e2a3a;padding:32px;margin-bottom:24px;">
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:white;">Invoice ${invoice.invoiceNo}</h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;">From ${senderName}</p>
      
      ${message ? `<div style="background:#0d1117;border-radius:10px;padding:16px;margin-bottom:24px;"><p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">${message}</p></div>` : ''}
      
      <!-- Invoice Summary -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr style="border-bottom:1px solid #1e2a3a;">
          <td style="padding:10px 0;font-size:13px;color:#64748b;">Invoice Number</td>
          <td style="padding:10px 0;font-size:13px;color:white;text-align:right;font-weight:600;">${invoice.invoiceNo}</td>
        </tr>
        <tr style="border-bottom:1px solid #1e2a3a;">
          <td style="padding:10px 0;font-size:13px;color:#64748b;">Issue Date</td>
          <td style="padding:10px 0;font-size:13px;color:white;text-align:right;">${new Date(invoice.issueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
        </tr>
        <tr style="border-bottom:1px solid #1e2a3a;">
          <td style="padding:10px 0;font-size:13px;color:#64748b;">Due Date</td>
          <td style="padding:10px 0;font-size:13px;color:#f59e0b;text-align:right;font-weight:600;">${new Date(invoice.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
        </tr>
        <tr>
          <td style="padding:12px 0 0;font-size:16px;color:white;font-weight:700;">Total Due</td>
          <td style="padding:12px 0 0;font-size:22px;color:#8b5cf6;text-align:right;font-weight:800;">${sym}${invoice.total.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
        </tr>
      </table>
      
      <!-- CTA -->
      <div style="text-align:center;">
        <a href="${shareUrl}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#3b82f6);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;">
          View & Pay Invoice →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <p style="text-align:center;color:#334155;font-size:12px;margin:0;">
      Powered by InvoiceFlow · <a href="${shareUrl}" style="color:#475569;text-decoration:none;">View in browser</a>
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
