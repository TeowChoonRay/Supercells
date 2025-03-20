import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Auth routes
  if (request.nextUrl.pathname.startsWith('/(auth)')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return res;
  }

  // Protected routes
  if (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/leads') ||
    request.nextUrl.pathname.startsWith('/settings')
  ) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};