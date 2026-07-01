// src/app/api/auth/me/route.ts
import { NextRequest } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: { id: true, name: true, email: true, role: true, avatar: true },
  })
  if (!user) return apiError('User not found', 404)
  return apiSuccess(user)
}
