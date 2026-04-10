import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

// Create a Stripe checkout session for an invoice
export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json()
    if (!invoiceId) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 })

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
        items: true,
        currency: true,
      },
    })

    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    if (invoice.status === 'PAID') return NextResponse.json({ error: 'Already paid' }, { status: 409 })

    const currency = invoice.currency?.code?.toLowerCase() ?? 'lkr'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = invoice.items.map(item => ({
      price_data: {
        currency,
        product_data: { name: item.description },
        unit_amount: Math.round(item.unitPrice * 100), // Stripe uses paise/cents
      },
      quantity: item.quantity,
    }))

    // Add tax as a separate line item if applicable
    if (invoice.tax > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: { name: `Tax (${invoice.taxRate}%)` },
          unit_amount: Math.round(invoice.tax * 100),
        },
        quantity: 1,
      })
    }

    // Subtract discount
    const discounts: Stripe.Checkout.SessionCreateParams['discounts'] = []
    let coupon: Stripe.Coupon | undefined
    if (invoice.discount > 0) {
      coupon = await stripe.coupons.create({
        amount_off: Math.round(invoice.discount * 100),
        currency,
        name: 'Invoice Discount',
        duration: 'once',
      })
      discounts.push({ coupon: coupon.id })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      ...(discounts.length > 0 ? { discounts } : {}),
      customer_email: invoice.client.email,
      metadata: {
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
      },
      success_url: `${appUrl}/share/${invoice.shareToken ?? invoice.id}?payment=success`,
      cancel_url: `${appUrl}/share/${invoice.shareToken ?? invoice.id}?payment=cancelled`,
    })

    // Store session id on invoice
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { stripeSessionId: session.id },
    })

    // Create a pending payment record
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.total,
        currency,
        status: 'PENDING',
        provider: 'stripe',
        providerSessionId: session.id,
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
