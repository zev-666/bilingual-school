// src/app/api/banners/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

interface Ctx { params: { id: string } }

const updateBannerSchema = z.object({
  titleZh: z.string().min(1).optional(),
  titleEn: z.string().min(1).optional(),
  subtitleZh: z.string().nullable().optional(),
  subtitleEn: z.string().nullable().optional(),
  imageUrl: z.string().url().optional(),
  linkUrl: z.string().nullable().optional(),
  linkTextZh: z.string().nullable().optional(),
  linkTextEn: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

// PATCH /api/banners/[id] — 需 EDITOR 以上權限
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const existing = await prisma.bannerSlide.findUnique({ where: { id: params.id } })
  if (!existing) return apiError('Banner not found', 404)

  const body = await req.json()
  const parsed = updateBannerSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const banner = await prisma.bannerSlide.update({
    where: { id: params.id },
    data: parsed.data,
  })

  return apiSuccess(banner)
}

// DELETE /api/banners/[id] — 需 ADMIN 以上權限
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'ADMIN')) return apiError('Forbidden', 403)

  const existing = await prisma.bannerSlide.findUnique({ where: { id: params.id } })
  if (!existing) return apiError('Banner not found', 404)

  await prisma.bannerSlide.delete({ where: { id: params.id } })

  return apiSuccess({ deleted: true, id: params.id })
}
