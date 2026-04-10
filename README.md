# InvoiceFlow ⚡️

InvoiceFlow is a modern, high-contrast invoicing SaaS built to allow freelancers and businesses to send beautiful invoices in under 60 seconds.

## Features

- **Geometric Aesthetic**: Minimalist, premium login and register workflows with smooth responsive constraints.
- **Instant Invoicing**: Full invoice builder with line-items, currency selection, and automatic subtotal generation.
- **Smart Email Notifications**: Full integration with Resend to automatically email stylized, Apple-receipt-like HTML notifications directly to clients.
- **Secure Share Links**: Clients get unique tokens to view and pay their invoices online without needing to log in.
- **Responsive Dashboard**: Track total revenue, outstanding payments, and clients all from a mobile-friendly native dashboard.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** Prisma with PostgreSQL
- **Authentication:** Custom JWT sessions
- **Emails:** Resend
- **Styling:** Custom CSS with modern UX focus

## Setup

1. Copy `.env.example` to `.env` and fill out your PostgreSQL database URL and JWT secret.
2. Add your **Resend** API key to your `.env` to enable email notifications:
   `RESEND_API_KEY=re_your_api_key_here`
3. Run `npm install`
4. Run `npx prisma db push`
5. Run `npm run dev`

## Recent Updates
* Redesigned authentication workflow to a split-screen geometric mosaic grid (8x6 4:5 aspect ratio tiles).
* Enabled full native HTML5 constraints on all user entry points.
* Refactored responsive engine to completely hide the mosaic grid and stretch the form space on screens < 800px.
* Upgraded Resend HTML receipts to a high-fidelity light theme featuring a premium white receipt design with clear subtotal highlights.

Built securely by InvoiceFlow.
