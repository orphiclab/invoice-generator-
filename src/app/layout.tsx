import type { Metadata } from 'next'
import { Fustat } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const fustat = Fustat({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-fustat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'InvoiceFlow — Send Invoices in 60 Seconds',
  description: 'A modern SaaS invoice generator. Create, send, and track invoices with WhatsApp sharing and PDF export.',
  keywords: 'invoice, billing, payments, SaaS, freelancer, business',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fustat.variable}>
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
