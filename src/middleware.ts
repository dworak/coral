import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;
  
  // Check if the user is trying to access the login page
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Check if there's an auth token in the request headers or cookies
  const authToken = request.cookies.get('authToken')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '');

  // If no auth token, redirect to login
  if (!authToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If there's an auth token, allow the request to proceed
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
