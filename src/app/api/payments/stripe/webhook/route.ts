import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const invoiceId = session.metadata?.invoiceId

        if (!invoiceId) break

        // Mark invoice as PAID
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: 'PAID' },
        })

        // Update payment record
        await prisma.payment.updateMany({
          where: { providerSessionId: session.id },
          data: {
            status: 'COMPLETED',
            providerPaymentId: session.payment_intent as string,
          },
        })

        console.log(`✅ Invoice ${invoiceId} marked as PAID via Stripe`)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        await prisma.payment.updateMany({
          where: { providerSessionId: session.id },
          data: { status: 'FAILED' },
        })
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await prisma.payment.updateMany({
          where: { providerPaymentId: charge.payment_intent as string },
          data: { status: 'REFUNDED' },
        })
        // Optionally revert invoice status
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}
