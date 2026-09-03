// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken, SESSION_COOKIE } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'
import { rateLimit, clientIp } from '@/lib/rate-limit'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  // ⚠️ 2026-08 資安修正：原本登入端點完全沒有次數限制，可以無限次嘗試密碼。
  // 同一個 IP 15 分鐘內最多 10 次登入嘗試。
  const ip = clientIp(req)
  const limited = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)
  if (!limited.allowed) {
    const res = apiError('嘗試次數過多，請稍後再試 / Too many attempts, please try again later', 429)
    const headers = new Headers(res.headers)
    headers.set('Retry-After', String(limited.retryAfterSeconds))
    return new Response(res.body, { status: 429, headers })
  }

  const body = await req.json()
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) return apiError('Invalid credentials', 422)

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isActive) return apiError('Invalid credentials', 401)

  const valid = await verifyPassword(password, user.password)
  if (!valid) return apiError('Invalid credentials', 401)

  const token = signToken({ userId: user.id, email: user.email, role: user.role, name: user.name })

  const response = apiSuccess({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  })

  // Set HTTP-only cookie
  const headers = new Headers(response.headers)
  headers.set('Set-Cookie', [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
    'Max-Age=604800', // 7 days
  ].filter(Boolean).join('; '))

  return new Response(response.body, { status: 200, headers })
}
