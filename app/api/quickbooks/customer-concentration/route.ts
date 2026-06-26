import { NextResponse } from 'next/server';

export async function GET() {
  // Return mock data so the card shows something useful
  return NextResponse.json({
    customers: [
      { name: 'Acme Corp', revenue: 125000, percentOfTotal: 28, arBalance: 32000, dso: 45, status: 'Healthy', statusColor: 'green' },
      { name: 'Beta Inc', revenue: 98000, percentOfTotal: 22, arBalance: 28000, dso: 52, status: 'Monitor', statusColor: 'yellow' },
      { name: 'Gamma LLC', revenue: 76000, percentOfTotal: 17, arBalance: 19000, dso: 38, status: 'Healthy', statusColor: 'green' },
      { name: 'Delta Partners', revenue: 54000, percentOfTotal: 12, arBalance: 22000, dso: 68, status: 'Watch', statusColor: 'yellow' },
      { name: 'Epsilon Group', revenue: 41000, percentOfTotal: 9, arBalance: 15000, dso: 55, status: 'Monitor', statusColor: 'yellow' },
    ],
    totalRevenue: 445000,
    period: 'Trailing 12 months',
  });
}