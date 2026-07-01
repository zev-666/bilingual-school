import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, hasPermission } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'EDITOR')) return apiError('權限不足', 403)

    const body = await req.json()
    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: { status: body.status },
    })
    return apiSuccess(contact)
  } catch (e) {
    return apiError('更新失敗', 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'ADMIN')) return apiError('權限不足', 403)

    await prisma.contact.delete({ where: { id: params.id } })
    return apiSuccess({ message: '刪除成功' })
  } catch (e) {
    return apiError('刪除失敗', 500)
  }
}
