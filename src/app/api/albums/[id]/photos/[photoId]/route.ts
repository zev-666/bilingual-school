import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, hasPermission } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string; photoId: string } }) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'EDITOR')) return apiError('權限不足', 403)

    const body = await req.json()
    const photo = await prisma.photo.update({
      where: { id: params.photoId },
      data: { captionZh: body.captionZh, captionEn: body.captionEn, sortOrder: body.sortOrder },
    })
    return apiSuccess(photo)
  } catch (e) {
    return apiError('更新照片失敗', 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; photoId: string } }) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'EDITOR')) return apiError('權限不足', 403)

    await prisma.photo.delete({ where: { id: params.photoId } })
    return apiSuccess({ message: '刪除成功' })
  } catch (e) {
    return apiError('刪除照片失敗', 500)
  }
}
