// src/app/api/banners/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const createBannerSchema = z.object({
  titleZh: z.string().min(1),
  titleEn: z.string().min(1),
  subtitleZh: z.string().optional(),
  subtitleEn: z.string().optional(),
  imageUrl: z.string().url(),
  linkUrl: z.string().optional(),
  linkTextZh: z.string().optional(),
  linkTextEn: z.string().optional(),
  isActive: z.boolean().default(true),
})

// GET /api/banners — 公開端點，首頁使用
// ?all=true 由後台使用，回傳含未啟用的全部輪播圖（需登入）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const includeInactive = searchParams.get('all') === 'true'

  if (includeInactive) {
    const authUser = getAuthUserFromRequest(req)
    if (!authUser) return apiError('Unauthorized', 401)
    if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

    const banners = await prisma.bannerSlide.findMany({ orderBy: { sortOrder: 'asc' } })
    return apiSuccess(banners)
  }

  const banners = await prisma.bannerSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return apiSuccess(banners)
}

// POST /api/banners — 需 EDITOR 以上權限
export async function POST(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = createBannerSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const last = await prisma.bannerSlide.findFirst({ orderBy: { sortOrder: 'desc' } })
  const nextSortOrder = last ? last.sortOrder + 1 : 0

  const banner = await prisma.bannerSlide.create({
    data: { ...parsed.data, sortOrder: nextSortOrder },
  })

  return apiSuccess(banner, 201)
}
