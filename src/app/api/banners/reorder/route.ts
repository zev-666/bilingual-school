// src/app/api/banners/reorder/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

// PATCH /api/banners/reorder — Body: { orderedIds: string[] }
export async function PATCH(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const body = await req.json()
  const { orderedIds } = body as { orderedIds: string[] }

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return apiError('orderedIds must be a non-empty array', 422)
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.bannerSlide.update({ where: { id }, data: { sortOrder: index } })
    )
  )

  return apiSuccess({ reordered: true, count: orderedIds.length })
}
