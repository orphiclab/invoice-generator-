import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Seed default currencies if not present, then return all
async function seedCurrencies() {
  const currenciesToSeed = [
    { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', exchangeRate: 1 },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', exchangeRate: 0.29 },
    { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 0.0034 },
    { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.0031 },
    { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 0.0027 },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', exchangeRate: 0.0125 },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', exchangeRate: 0.0046 },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', exchangeRate: 0.0052 },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', exchangeRate: 0.0046 },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', exchangeRate: 0.51 },
  ]

  const existingCount = await prisma.currency.count()
  if (existingCount >= currenciesToSeed.length) return

  for (const curr of currenciesToSeed) {
    await prisma.currency.upsert({
      where: { code: curr.code },
      update: {},
      create: curr,
    })
  }
}

export async function GET() {
  try {
    await seedCurrencies()
    const currencies = await prisma.currency.findMany({
      orderBy: { code: 'asc' },
    })
    return NextResponse.json(currencies)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 })
  }
}
