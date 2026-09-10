// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { SESSION_COOKIE, verifyTokenEdge } from '@/lib/auth-edge'

const intlMiddleware = createIntlMiddleware(routing)

const ADMIN_PATHS = ['/admin']

// 與 src/lib/auth.ts 的 JWT_SECRET 必須一致。
// 正式環境沒設定就一律視為驗證失敗（fail closed），不要退回預設值。
const JWT_SECRET = process.env.JWT_SECRET ?? ''

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // The login page itself must bypass both admin-auth protection and
  // i18n locale rewriting, otherwise it gets redirected in a loop
  // (auth check) or redirected to a non-existent /zh-TW/admin/login (i18n).
  if (pathname === '/admin/login') {
    return withSecurityHeaders(nextWithPathname(req, pathname), req)
  }

  // Protect admin routes
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    const token = req.cookies.get(SESSION_COOKIE)?.value
    // ⚠️ 這裡一定要用 verifyTokenEdge（會驗簽章），不可以只解 base64。
    const user = token ? await verifyTokenEdge(token, JWT_SECRET) : null

    if (!user) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('from', pathname)
      return withSecurityHeaders(NextResponse.redirect(loginUrl), req)
    }

    // Only ADMIN+ can access admin panel
    const ROLE_LEVELS: Record<string, number> = { AUTHOR: 1, EDITOR: 2, ADMIN: 3, SUPER_ADMIN: 4 }
    if ((ROLE_LEVELS[user.role] ?? 0) < 3) {
      return withSecurityHeaders(NextResponse.redirect(new URL('/', req.url)), req)
    }

    // 讓後台的 Server Component layout 也能知道目前路徑，做第二道權限檢查
    return withSecurityHeaders(nextWithPathname(req, pathname), req)
  }

  // i18n routing for all other paths
  return withSecurityHeaders(intlMiddleware(req), req)
}

/**
 * 把目前路徑寫進「請求」標頭（不是回應標頭），
 * 這樣 Server Component 的 headers() 才讀得到 x-pathname。
 */
function nextWithPathname(req: NextRequest, pathname: string): NextResponse {
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

/**
 * 全站安全標頭。
 * CSP 用 report-only 之外的嚴格模式會擋掉 Next.js dev 的 eval，
 * 因此 script-src 在開發模式放寬，正式環境收緊。
 */
function withSecurityHeaders(res: NextResponse, req: NextRequest): NextResponse {
  const isProd = process.env.NODE_ENV === 'production'

  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-DNS-Prefetch-Control', 'off')
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
  )
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  res.headers.set('Cross-Origin-Resource-Policy', 'same-site')

  if (isProd) {
    // HSTS：一年、含子網域。政府資安檢測必查項目。
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  const csp = [
    "default-src 'self'",
    // Next.js 需要 inline script 啟動；dev 另外需要 eval
    isProd
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    // Tailwind 與 Google Fonts 需要 inline style
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    // 圖片來源：自己、Vercel Blob、data/blob URL、YouTube 縮圖網域
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.s3.amazonaws.com https://img.youtube.com https://i.ytimg.com",
    "media-src 'self' https:",
    // Google Maps 內嵌與 YouTube 影片
    "frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com https://www.youtube-nocookie.com",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    isProd ? 'upgrade-insecure-requests' : '',
  ]
    .filter(Boolean)
    .join('; ')

  res.headers.set('Content-Security-Policy', csp)
  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|uploads|images).*)',
  ],
}
