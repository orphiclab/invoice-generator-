import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta', display: 'swap' })

export const metadata: Metadata = {
  title: 'InvoiceFlow — Send Invoices in 60 Seconds',
  description: 'A modern SaaS invoice generator. Create, send, and track invoices with WhatsApp sharing and PDF export.',
  keywords: 'invoice, billing, payments, SaaS, freelancer, business',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
