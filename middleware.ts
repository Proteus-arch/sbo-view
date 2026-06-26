// middleware.ts (in your project root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_USERS = [
  { user: 'reviewer1', pass: 'feedback2026' },
  { user: 'reviewer2', pass: 'sandbox2026' },
];

export function middleware(request: NextRequest) {
  const auth = request.headers.get('authorization');
  
  if (!auth || !auth.startsWith('Basic ')) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Review Access"' },
    });
  }

  const base64 = auth.split(' ')[1];
  const decoded = atob(base64);
  const [user, pass] = decoded.split(':');

  const valid = VALID_USERS.some(u => u.user === user && u.pass === pass);
  if (!valid) {
    return new NextResponse('Invalid credentials', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};