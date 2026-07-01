import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, hasPermission } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const announcement = await prisma.announcement.findUnique({ where: { slug: params.slug } })
    if (!announcement) return apiError('找不到公告', 404)
    return apiSuccess(announcement)
  } catch (e) {
    return apiError('取得公告失敗', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'EDITOR')) return apiError('權限不足', 403)

    const body = await req.json()
    const existing = await prisma.announcement.findUnique({ where: { slug: params.slug } })
    if (!existing) return apiError('找不到公告', 404)

    const wasPublished = existing.isPublished
    const willPublish = body.isPublished

    const updated = await prisma.announcement.update({
      where: { slug: params.slug },
      data: {
        titleZh: body.titleZh, titleEn: body.titleEn,
        contentZh: body.contentZh, contentEn: body.contentEn,
        category: body.category, isPinned: !!body.isPinned,
        isPublished: !!body.isPublished,
        publishedAt: !wasPublished && willPublish ? new Date() : existing.publishedAt,
      },
    })
    return apiSuccess(updated)
  } catch (e) {
    return apiError('更新公告失敗', 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'ADMIN')) return apiError('權限不足', 403)

    await prisma.announcement.delete({ where: { slug: params.slug } })
    return apiSuccess({ message: '刪除成功' })
  } catch (e) {
    return apiError('刪除公告失敗', 500)
  }
}
