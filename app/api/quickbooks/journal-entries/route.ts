import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    entries: [
      {
        id: 'JE-001',
        txn_date: '2026-06-15',
        doc_number: '1234',
        private_note: 'Monthly rent payment',
        total_amount: 4800,
        status: 'Approved',
      },
      {
        id: 'JE-002',
        txn_date: '2026-06-10',
        doc_number: '1235',
        private_note: 'Office supplies purchase',
        total_amount: 1234.56,
        status: 'Approved',
      },
      {
        id: 'JE-003',
        txn_date: '2026-06-05',
        doc_number: '1236',
        private_note: 'Depreciation adjustment',
        total_amount: 1500,
        status: 'Pending',
      },
    ],
  });
}