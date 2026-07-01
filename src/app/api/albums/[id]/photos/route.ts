import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, hasPermission } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const photos = await prisma.photo.findMany({
      where: { albumId: params.id },
      orderBy: { sortOrder: 'asc' },
    })
    return apiSuccess(photos)
  } catch (e) {
    return apiError('取得照片失敗', 500)
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'EDITOR')) return apiError('權限不足', 403)

    const body = await req.json()
    const { url, thumbnail, captionZh, captionEn } = body
    if (!url) return apiError('請提供圖片網址', 400)

    const count = await prisma.photo.count({ where: { albumId: params.id } })
    const photo = await prisma.photo.create({
      data: { albumId: params.id, url, thumbnail, captionZh, captionEn, sortOrder: count },
    })
    return apiSuccess(photo, 201)
  } catch (e) {
    return apiError('新增照片失敗', 500)
  }
}
