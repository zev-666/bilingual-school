import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, signToken, COOKIE_NAME } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return apiError('請輸入電子郵件與密碼', 400)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) return apiError('帳號或密碼錯誤', 401)

    const valid = await comparePassword(password, user.password)
    if (!valid) return apiError('帳號或密碼錯誤', 401)

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })

    const response = apiSuccess({ id: user.id, name: user.name, email: user.email, role: user.role })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch (e) {
    return apiError('登入失敗，請稍後再試', 500)
  }
}
