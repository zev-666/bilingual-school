// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken, SESSION_COOKIE } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
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
