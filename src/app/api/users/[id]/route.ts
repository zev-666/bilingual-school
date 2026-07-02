// src/app/api/users/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission, hashPassword } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const updateSchema = z.object({
  name:     z.string().min(1).optional(),
  email:    z.string().email().optional(),
  password: z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)/).optional(),
  role:     z.enum(['AUTHOR', 'EDITOR', 'ADMIN', 'SUPER_ADMIN']).optional(),
  isActive: z.boolean().optional(),
})

interface Ctx { params: { id: string } }

export async function GET(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (authUser.userId !== params.id && !hasPermission(authUser.role, 'ADMIN')) {
    return apiError('Forbidden', 403)
  }
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  })
  if (!user) return apiError('Not found', 404)
  return apiSuccess(user)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  // Users can edit themselves; ADMIN+ can edit others
  if (authUser.userId !== params.id && !hasPermission(authUser.role, 'ADMIN')) {
    return apiError('Forbidden', 403)
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) return apiError('Not found', 404)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  // Protect: only SUPER_ADMIN can change roles to/from SUPER_ADMIN
  if (parsed.data.role && authUser.role !== 'SUPER_ADMIN') {
    if (parsed.data.role === 'SUPER_ADMIN' || target.role === 'SUPER_ADMIN') {
      return apiError('只有超級管理員可以變更此角色', 403)
    }
  }

  const data: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.password) {
    data.password = await hashPassword(parsed.data.password)
  } else {
    delete data.password
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  })
  return apiSuccess(user)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'ADMIN')) return apiError('Forbidden', 403)

  // Block self-deletion
  if (authUser.userId === params.id) return apiError('不能刪除自己的帳號', 400)

  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) return apiError('Not found', 404)

  // Block deleting SUPER_ADMIN
  if (target.role === 'SUPER_ADMIN') return apiError('無法刪除超級管理員帳號', 403)

  await prisma.user.delete({ where: { id: params.id } })
  return apiSuccess({ deleted: true })
}
