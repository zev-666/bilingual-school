import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, hasPermission } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doc = await prisma.document.findUnique({ where: { id: params.id } })
    if (!doc) return apiError('找不到文件', 404)
    return apiSuccess(doc)
  } catch (e) {
    return apiError('取得文件失敗', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'EDITOR')) return apiError('權限不足', 403)

    const body = await req.json()
    const doc = await prisma.document.update({
      where: { id: params.id },
      data: {
        titleZh: body.titleZh, titleEn: body.titleEn,
        descZh: body.descZh, descEn: body.descEn,
        category: body.category, fileUrl: body.fileUrl,
        fileSize: body.fileSize, isPublished: !!body.isPublished,
      },
    })
    return apiSuccess(doc)
  } catch (e) {
    return apiError('更新文件失敗', 500)
  }
}

// Increment download count
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doc = await prisma.document.update({
      where: { id: params.id },
      data: { downloadCount: { increment: 1 } },
    })
    return apiSuccess(doc)
  } catch (e) {
    return apiError('更新下載次數失敗', 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'ADMIN')) return apiError('權限不足', 403)

    await prisma.document.delete({ where: { id: params.id } })
    return apiSuccess({ message: '刪除成功' })
  } catch (e) {
    return apiError('刪除文件失敗', 500)
  }
}
