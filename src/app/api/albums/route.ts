import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, generateSlug, hasPermission } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const published = searchParams.get('published')
    const where: any = {}
    if (published !== null) where.isPublished = published === 'true'

    const albums = await prisma.album.findMany({
      where,
      include: { _count: { select: { photos: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return apiSuccess(albums)
  } catch (e) {
    return apiError('取得相簿列表失敗', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'EDITOR')) return apiError('權限不足', 403)

    const body = await req.json()
    const { titleZh, titleEn, descZh, descEn, coverImage, isPublished } = body
    if (!titleZh || !titleEn) return apiError('請填寫相簿標題', 400)

    const album = await prisma.album.create({
      data: {
        slug: generateSlug(titleEn || titleZh),
        titleZh, titleEn, descZh, descEn, coverImage,
        isPublished: !!isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    })
    return apiSuccess(album, 201)
  } catch (e) {
    return apiError('建立相簿失敗', 500)
  }
}
