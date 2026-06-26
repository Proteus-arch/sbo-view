import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    customerCount: 42,
    avgRevenue: 6250,
    avgCogs: 2850,
    avgMargin: 54.4,
  });
}