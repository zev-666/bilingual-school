// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { SESSION_COOKIE, decodeTokenEdge } from '@/lib/auth-edge'

const intlMiddleware = createIntlMiddleware(routing)

const ADMIN_PATHS = ['/admin']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect admin routes
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    const token = req.cookies.get(SESSION_COOKIE)?.value
    const user  = token ? decodeTokenEdge(token) : null

    if (!user) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Only ADMIN+ can access admin panel
    const ROLE_LEVELS: Record<string, number> = { AUTHOR: 1, EDITOR: 2, ADMIN: 3, SUPER_ADMIN: 4 }
    if ((ROLE_LEVELS[user.role] ?? 0) < 3) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  }

  // i18n routing for all other paths
  return intlMiddleware(req)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads|images).*)',
  ],
}
