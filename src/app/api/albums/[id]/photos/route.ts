// src/app/api/albums/[id]/photos/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

interface Ctx { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const photos = await prisma.photo.findMany({
    where: { albumId: params.id },
    orderBy: { sortOrder: 'asc' },
  })
  return apiSuccess(photos)
}

const createPhotoSchema = z.object({
  url:       z.string().url(),
  thumbnail: z.string().url().optional(),
  captionZh: z.string().optional(),
  captionEn: z.string().optional(),
  sortOrder: z.number().default(0),
})

export async function POST(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  // Verify album exists
  const album = await prisma.album.findUnique({ where: { id: params.id } })
  if (!album) return apiError('Album not found', 404)

  const body = await req.json()
  const parsed = createPhotoSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const photo = await prisma.photo.create({
    data: { ...parsed.data, albumId: params.id },
  })
  return apiSuccess(photo, 201)
}
