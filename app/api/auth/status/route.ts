// app/api/auth/status/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const encodedToken = cookies().get('qb_token')?.value;
    if (!encodedToken) {
      return NextResponse.json({ connected: false });
    }

    // Try to parse the token – if it fails, treat as disconnected
    const tokenData = JSON.parse(Buffer.from(encodedToken, 'base64').toString('utf-8'));
    return NextResponse.json({
      connected: true,
      companyName: tokenData.realmId || 'QuickBooks Company',
    });
  } catch (error) {
    // If anything fails (invalid cookie, parsing error, etc.), return disconnected
    console.error('Status check failed:', error);
    return NextResponse.json({ connected: false });
  }
}