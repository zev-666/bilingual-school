// src/app/api/users/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission, hashPassword } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const createSchema = z.object({
  name:     z.string().min(1),
  email:    z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)/),
  role:     z.enum(['AUTHOR', 'EDITOR', 'ADMIN', 'SUPER_ADMIN']).default('AUTHOR'),
  isActive: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'ADMIN')) return apiError('Forbidden', 403)

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  })
  return apiSuccess(users)
}

export async function POST(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'ADMIN')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  // Only SUPER_ADMIN can create SUPER_ADMIN accounts
  if (parsed.data.role === 'SUPER_ADMIN' && authUser.role !== 'SUPER_ADMIN') {
    return apiError('只有超級管理員可以建立超級管理員帳號', 403)
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return apiError('此 Email 已被使用', 409)

  const hashed = await hashPassword(parsed.data.password)
  const user = await prisma.user.create({
    data: { ...parsed.data, password: hashed },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  })
  return apiSuccess(user, 201)
}
