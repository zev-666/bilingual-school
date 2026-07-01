import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, hasPermission } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const album = await prisma.album.findUnique({
      where: { id: params.id },
      include: { photos: { orderBy: { sortOrder: 'asc' } } },
    })
    if (!album) return apiError('找不到相簿', 404)
    return apiSuccess(album)
  } catch (e) {
    return apiError('取得相簿失敗', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'EDITOR')) return apiError('權限不足', 403)

    const body = await req.json()
    const existing = await prisma.album.findUnique({ where: { id: params.id } })
    if (!existing) return apiError('找不到相簿', 404)

    const wasPublished = existing.isPublished
    const updated = await prisma.album.update({
      where: { id: params.id },
      data: {
        titleZh: body.titleZh, titleEn: body.titleEn,
        descZh: body.descZh, descEn: body.descEn,
        coverImage: body.coverImage,
        isPublished: !!body.isPublished,
        publishedAt: !wasPublished && body.isPublished ? new Date() : existing.publishedAt,
      },
    })
    return apiSuccess(updated)
  } catch (e) {
    return apiError('更新相簿失敗', 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'ADMIN')) return apiError('權限不足', 403)

    await prisma.album.delete({ where: { id: params.id } })
    return apiSuccess({ message: '刪除成功' })
  } catch (e) {
    return apiError('刪除相簿失敗', 500)
  }
}
