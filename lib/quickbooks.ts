// lib/quickbooks.ts
import { cookies } from 'next/headers';

export function getTokenData() {
  const cookieStore = cookies();
  const encoded = cookieStore.get('qb_token')?.value;
  if (!encoded) return null;
  try {
    const raw = Buffer.from(encoded, 'base64').toString('utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function getValidAccessToken() {
  const data = getTokenData();
  if (!data) return null;

  // Check if token is expired (with 5-minute buffer)
  const expiresAt = data.created_at + data.expires_in * 1000;
  if (Date.now() > expiresAt - 5 * 60 * 1000) {
    // Token expired – attempt to refresh it
    const refreshed = await refreshAccessToken(data);
    if (!refreshed) return null;
    return refreshed.access_token;
  }

  return data.access_token;
}

async function refreshAccessToken(tokenData: any) {
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenData.refresh_token,
      client_id: process.env.QB_CLIENT_ID!,
      client_secret: process.env.QB_CLIENT_SECRET!,
    });

    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Refresh token failed:', errorText);
      // Delete the invalid token
      cookies().delete('qb_token');
      return null;
    }

    const newToken = await response.json();

    // Update the cookie with new tokens
    const updatedPayload = {
      ...tokenData,
      access_token: newToken.access_token,
      refresh_token: newToken.refresh_token || tokenData.refresh_token, // some APIs keep same refresh token
      expires_in: newToken.expires_in,
      created_at: Date.now(),
    };
    const encoded = Buffer.from(JSON.stringify(updatedPayload)).toString('base64');
    cookies().set('qb_token', encoded, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return updatedPayload;
  } catch (error) {
    console.error('Refresh token error:', error);
    // Delete invalid token
    cookies().delete('qb_token');
    return null;
  }
}

export function getRealmId() {
  const data = getTokenData();
  return data?.realmId || null;
}