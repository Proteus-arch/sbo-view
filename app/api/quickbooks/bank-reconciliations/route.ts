import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    accounts: [
      {
        id: '1',
        name: 'Chase Checking (1234)',
        lastReconciledDate: '2026-06-15',
        unclearedCount: 2,
        unclearedItems: [
          { date: '2026-06-10', description: 'Check #1023', type: 'payment', amount: 1245.50 },
          { date: '2026-06-12', description: 'Deposit - Retail sales', type: 'deposit', amount: 875.25 },
        ]
      },
      {
        id: '2',
        name: 'Wells Fargo Savings (5678)',
        lastReconciledDate: '2026-06-01',
        unclearedCount: 0,
        unclearedItems: [],
      },
    ],
  });
}