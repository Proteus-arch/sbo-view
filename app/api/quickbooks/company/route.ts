import { NextResponse } from 'next/server';
import { getValidAccessToken, getRealmId } from '@/lib/quickbooks';

export async function GET() {
  const token = await getValidAccessToken();
  const realmId = getRealmId();

  if (!token || !realmId) {
    return NextResponse.json({ error: 'Not connected to QuickBooks' }, { status: 401 });
  }

  const url = `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}