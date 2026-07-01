import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, hasPermission } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id: params.id } })
    if (!teacher) return apiError('找不到師資資料', 404)
    return apiSuccess(teacher)
  } catch (e) {
    return apiError('取得師資失敗', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'ADMIN')) return apiError('權限不足', 403)

    const body = await req.json()
    const teacher = await prisma.teacher.update({
      where: { id: params.id },
      data: {
        nameZh: body.nameZh, nameEn: body.nameEn,
        titleZh: body.titleZh, titleEn: body.titleEn,
        bioZh: body.bioZh, bioEn: body.bioEn,
        avatar: body.avatar, type: body.type,
        subjects: body.subjects || [],
        isActive: body.isActive ?? true,
      },
    })
    return apiSuccess(teacher)
  } catch (e) {
    return apiError('更新師資失敗', 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'ADMIN')) return apiError('權限不足', 403)

    await prisma.teacher.delete({ where: { id: params.id } })
    return apiSuccess({ message: '刪除成功' })
  } catch (e) {
    return apiError('刪除師資失敗', 500)
  }
}
