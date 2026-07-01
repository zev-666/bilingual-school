// src/app/api/albums/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const updateSchema = z.object({
  titleZh:     z.string().min(1).optional(),
  titleEn:     z.string().min(1).optional(),
  descZh:      z.string().optional(),
  descEn:      z.string().optional(),
  coverImage:  z.string().url().optional().or(z.literal('')),
  eventDate:   z.string().datetime().optional().nullable(),
  isPublished: z.boolean().optional(),
  sortOrder:   z.number().optional(),
})

interface Ctx { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const album = await prisma.album.findUnique({
    where: { id: params.id },
    include: { photos: { orderBy: { sortOrder: 'asc' } }, _count: { select: { photos: true } } },
  })
  if (!album) return apiError('Not found', 404)
  return apiSuccess(album)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const data = {
    ...parsed.data,
    coverImage: parsed.data.coverImage === '' ? null : parsed.data.coverImage,
    eventDate:  parsed.data.eventDate ? new Date(parsed.data.eventDate) : undefined,
  }

  const album = await prisma.album.update({ where: { id: params.id }, data })
  return apiSuccess(album)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  // Cascade deletes photos via Prisma schema (onDelete: Cascade)
  await prisma.album.delete({ where: { id: params.id } })
  return apiSuccess({ deleted: true })
}
