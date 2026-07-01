// src/app/api/auth/logout/route.ts
import { SESSION_COOKIE } from '@/lib/auth'
import { apiSuccess } from '@/lib/utils'

export async function POST() {
  const response = apiSuccess({ loggedOut: true })
  const headers = new Headers(response.headers)
  headers.set('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`)
  return new Response(response.body, { status: 200, headers })
}
