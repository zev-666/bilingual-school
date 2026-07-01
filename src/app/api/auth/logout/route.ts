import { apiSuccess } from '@/lib/utils'
import { COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  const response = apiSuccess({ message: '已登出' })
  response.cookies.set(COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/' })
  return response
}
