import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, hasPermission } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const where: any = {}
    if (type) where.type = type

    const teachers = await prisma.teacher.findMany({
      where,
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    })
    return apiSuccess(teachers)
  } catch (e) {
    return apiError('取得師資列表失敗', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'ADMIN')) return apiError('權限不足', 403)

    const body = await req.json()
    const { nameZh, nameEn, titleZh, titleEn, bioZh, bioEn, avatar, type, subjects } = body
    if (!nameZh || !nameEn || !titleZh || !titleEn) return apiError('請填寫所有必填欄位', 400)

    const count = await prisma.teacher.count()
    const teacher = await prisma.teacher.create({
      data: {
        nameZh, nameEn, titleZh, titleEn, bioZh, bioEn, avatar,
        type: type || 'FULL_TIME',
        subjects: subjects || [],
        sortOrder: count,
      },
    })
    return apiSuccess(teacher, 201)
  } catch (e) {
    return apiError('建立師資失敗', 500)
  }
}
