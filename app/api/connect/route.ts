// app/api/connect/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import OAuthClient from 'intuit-oauth';

export async function GET() {
  try {
    const clientId = process.env.QB_CLIENT_ID;
    const clientSecret = process.env.QB_CLIENT_SECRET;
    const redirectUri = process.env.QB_REDIRECT_URI;
    const env = process.env.QB_ENVIRONMENT === 'production' ? 'production' : 'sandbox';

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing QuickBooks environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: missing OAuth credentials' },
        { status: 500 }
      );
    }

    const oauthClient = new OAuthClient({
      clientId,
      clientSecret,
      environment: env, // now type-safe: 'sandbox' | 'production'
      redirectUri,
    });

    const state = crypto.randomUUID();

    // ✅ Use authorizeUri (correct method name)
    const authUri = oauthClient.authorizeUri({
      scope: 'com.intuit.quickbooks.accounting',
      state,
    });

    cookies().set('qb_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    return NextResponse.redirect(authUri);
  } catch (error) {
    console.error('OAuth initialization error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to initiate QuickBooks connection: ${message}` },
      { status: 500 }
    );
  }
}