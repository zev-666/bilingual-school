// src/app/api/videos/[id]/route.ts
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
  videoUrl:    z.string().url().optional(),
  thumbnail:   z.string().url().optional().nullable(),
  duration:    z.number().positive().optional().nullable(),
  isPublished: z.boolean().optional(),
})

interface Ctx { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const video = await prisma.video.findUnique({
    where: { id: params.id },
    include: { author: { select: { name: true } } },
  })
  if (!video) return apiError('Not found', 404)
  return apiSuccess(video)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const existing = await prisma.video.findUnique({ where: { id: params.id } })
  if (!existing) return apiError('Not found', 404)

  const data: Record<string, unknown> = { ...parsed.data }

  // Set publishedAt when first publishing
  if (parsed.data.isPublished && !existing.isPublished) {
    data.publishedAt = new Date()
  }

  const video = await prisma.video.update({ where: { id: params.id }, data })
  return apiSuccess(video)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  await prisma.video.delete({ where: { id: params.id } })
  return apiSuccess({ deleted: true })
}
