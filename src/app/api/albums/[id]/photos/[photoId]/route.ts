// src/app/api/albums/[id]/photos/[photoId]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

interface Ctx { params: { id: string; photoId: string } }

const updateSchema = z.object({
  captionZh: z.string().optional(),
  captionEn: z.string().optional(),
  sortOrder: z.number().optional(),
})

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const photo = await prisma.photo.update({
    where: { id: params.photoId },
    data: parsed.data,
  })
  return apiSuccess(photo)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  await prisma.photo.delete({ where: { id: params.photoId } })
  return apiSuccess({ deleted: true })
}
