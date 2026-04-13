'use client'

import { BankAccountManager } from '@/components/BankAccountManager'
import { Landmark } from 'lucide-react'

export default function BankAccountsPage() {
  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-24 lg:pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#111827' }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(162,142,249,0.1)' }}>
            <Landmark className="w-5 h-5" style={{ color: '#a28ef9' }} />
          </div>
          Bank Details
        </h1>
        <p className="text-sm mt-2 ml-13" style={{ color: '#6b7280' }}>
          Manage your saved bank accounts. Selecting a default will automatically apply it to new invoices.
        </p>
      </div>

      <BankAccountManager />
    </div>
  )
}
