import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, generateSlug, hasPermission } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const published = searchParams.get('published')

    const where: any = {}
    if (category) where.category = category
    if (published !== null) where.isPublished = published === 'true'

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    })
    return apiSuccess(announcements)
  } catch (e) {
    return apiError('取得公告列表失敗', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'AUTHOR')) return apiError('權限不足', 403)

    const body = await req.json()
    const { titleZh, titleEn, contentZh, contentEn, category, isPinned, isPublished } = body

    if (!titleZh || !titleEn || !contentZh || !contentEn) {
      return apiError('請填寫所有必填欄位', 400)
    }

    const announcement = await prisma.announcement.create({
      data: {
        slug: generateSlug(titleEn || titleZh),
        titleZh, titleEn, contentZh, contentEn,
        category: category || 'NEWS',
        isPinned: !!isPinned,
        isPublished: !!isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    })
    return apiSuccess(announcement, 201)
  } catch (e) {
    return apiError('建立公告失敗', 500)
  }
}
