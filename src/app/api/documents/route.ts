import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, hasPermission } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const published = searchParams.get('published')
    const where: any = {}
    if (category) where.category = category
    if (published !== null) where.isPublished = published === 'true'

    const documents = await prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } })
    return apiSuccess(documents)
  } catch (e) {
    return apiError('取得文件列表失敗', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'EDITOR')) return apiError('權限不足', 403)

    const body = await req.json()
    const { titleZh, titleEn, descZh, descEn, category, fileUrl, fileSize, isPublished } = body
    if (!titleZh || !titleEn || !fileUrl) return apiError('請填寫所有必填欄位', 400)

    const document = await prisma.document.create({
      data: {
        titleZh, titleEn, descZh, descEn,
        category: category || 'OTHER',
        fileUrl, fileSize,
        isPublished: !!isPublished,
      },
    })
    return apiSuccess(document, 201)
  } catch (e) {
    return apiError('建立文件失敗', 500)
  }
}
