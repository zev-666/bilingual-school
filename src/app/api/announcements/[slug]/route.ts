// src/app/api/announcements/[slug]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

interface Ctx { params: { slug: string } }

// GET /api/announcements/:slug
export async function GET(_req: NextRequest, { params }: Ctx) {
  const item = await prisma.announcement.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { name: true } }, tags: { include: { tag: true } } },
  })
  if (!item) return apiError('Not found', 404)

  // Increment view count (fire-and-forget)
  prisma.announcement.update({ where: { id: item.id }, data: { viewCount: { increment: 1 } } }).catch(() => {})
  return apiSuccess(item)
}

const updateSchema = z.object({
  titleZh: z.string().optional(), titleEn: z.string().optional(),
  summaryZh: z.string().optional(), summaryEn: z.string().optional(),
  contentZh: z.string().optional(), contentEn: z.string().optional(),
  category: z.enum(['ANNOUNCEMENT','ACTIVITY','ADMISSION','COMPETITION','NEWS']).optional(),
  coverImage: z.string().url().nullable().optional(),
  isPinned: z.boolean().optional(),
  isPublished: z.boolean().optional(),
})

// PATCH /api/announcements/:slug
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const item = await prisma.announcement.findUnique({ where: { slug: params.slug } })
  if (!item) return apiError('Not found', 404)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const { data } = parsed
  const updated = await prisma.announcement.update({
    where: { slug: params.slug },
    data: {
      ...data,
      publishedAt:
        data.isPublished === true && !item.publishedAt ? new Date()
        : data.isPublished === false ? null
        : item.publishedAt,
    },
  })
  return apiSuccess(updated)
}

// DELETE /api/announcements/:slug
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(_req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'ADMIN')) return apiError('Forbidden', 403)

  await prisma.announcement.delete({ where: { slug: params.slug } })
  return apiSuccess({ deleted: true })
}
