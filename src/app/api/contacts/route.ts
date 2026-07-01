import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, hasPermission } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'EDITOR')) return apiError('權限不足', 403)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const where: any = {}
    if (status) where.status = status

    const contacts = await prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } })
    return apiSuccess(contacts)
  } catch (e) {
    return apiError('取得聯絡訊息失敗', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = body
    if (!name || !email || !subject || !message) return apiError('請填寫所有欄位', 400)

    const contact = await prisma.contact.create({ data: { name, email, subject, message } })
    return apiSuccess(contact, 201)
  } catch (e) {
    return apiError('送出失敗，請稍後再試', 500)
  }
}
