import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './server/auth';

type Role = 'STUDENT' | 'ADMIN' | 'COORDINATOR' | 'RECRUITER';

const ROLE_HOME: Record<Role, string> = {
  STUDENT: '/student/dashboard',
  ADMIN: '/admin/dashboard',
  COORDINATOR: '/coordinator/dashboard',
  RECRUITER: '/recruiter/dashboard',
};

const ROLE_PREFIX: Record<Role, string> = {
  STUDENT: '/student',
  ADMIN: '/admin',
  COORDINATOR: '/coordinator',
  RECRUITER: '/recruiter',
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();
  const role = (session?.user as { role?: Role } | undefined)?.role;

  const isAuthPage = pathname === '/login' || pathname === '/register';

  // 1. Logged-in users shouldn't stay on /login or /register
  if (isAuthPage) {
    if (role && ROLE_HOME[role]) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
    }
    return NextResponse.next();
  }

  // 2. Unauthenticated users trying to open any portal -> redirect to /login
  if (!role || !ROLE_HOME[role]) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Wrong role for this portal -> redirect to their own dashboard
  const allowedPrefix = ROLE_PREFIX[role];
  if (!pathname.startsWith(allowedPrefix)) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/student/:path*',
    '/admin/:path*',
    '/coordinator/:path*',
    '/recruiter/:path*',
    '/login',
    '/register',
  ],
};
