// src/app/api/albums/[id]/photos/reorder/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

interface Ctx { params: { id: string } }

// PATCH /api/albums/[id]/photos/reorder — Body: { orderedIds: string[] }
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const album = await prisma.album.findUnique({ where: { id: params.id } })
  if (!album) return apiError('Album not found', 404)

  const body = await req.json()
  const { orderedIds } = body as { orderedIds: string[] }

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return apiError('orderedIds must be a non-empty array', 422)
  }

  // 安全檢查：確保這些照片都屬於這個相簿
  const photos = await prisma.photo.findMany({
    where: { id: { in: orderedIds }, albumId: params.id },
    select: { id: true },
  })
  if (photos.length !== orderedIds.length) {
    return apiError('Some photos do not belong to this album', 400)
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.photo.update({ where: { id }, data: { sortOrder: index } })
    )
  )

  return apiSuccess({ reordered: true, count: orderedIds.length })
}
