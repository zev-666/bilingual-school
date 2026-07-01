// src/app/api/teachers/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const updateSchema = z.object({
  nameZh:    z.string().min(1).optional(),
  nameEn:    z.string().min(1).optional(),
  titleZh:   z.string().min(1).optional(),
  titleEn:   z.string().min(1).optional(),
  bioZh:     z.string().optional(),
  bioEn:     z.string().optional(),
  avatar:    z.string().url().optional().nullable(),
  type:      z.enum(['FULL_TIME', 'PART_TIME', 'STAFF']).optional(),
  subjects:  z.array(z.string()).optional(),
  email:     z.string().email().optional().nullable(),
  sortOrder: z.number().optional(),
  isActive:  z.boolean().optional(),
})

interface Ctx { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const teacher = await prisma.teacher.findUnique({ where: { id: params.id } })
  if (!teacher) return apiError('Not found', 404)
  return apiSuccess(teacher)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'ADMIN')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const data = {
    ...parsed.data,
    avatar: parsed.data.avatar === '' ? null : parsed.data.avatar,
    email:  parsed.data.email  === '' ? null : parsed.data.email,
  }

  const teacher = await prisma.teacher.update({ where: { id: params.id }, data })
  return apiSuccess(teacher)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'ADMIN')) return apiError('Forbidden', 403)

  await prisma.teacher.delete({ where: { id: params.id } })
  return apiSuccess({ deleted: true })
}
