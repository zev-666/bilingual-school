// src/app/api/teachers/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const where = {
    isActive: true,
    ...(type && type !== 'all' ? { type: type as any } : {}),
  }
  const teachers = await prisma.teacher.findMany({
    where, orderBy: [{ sortOrder: 'asc' }, { nameZh: 'asc' }],
  })
  return apiSuccess(teachers)
}

const createSchema = z.object({
  nameZh: z.string().min(1), nameEn: z.string().min(1),
  titleZh: z.string().min(1), titleEn: z.string().min(1),
  bioZh: z.string().optional(), bioEn: z.string().optional(),
  avatar: z.string().url().optional(),
  type: z.enum(['FULL_TIME','PART_TIME','STAFF']).default('FULL_TIME'),
  subjects: z.array(z.string()).default([]),
  email: z.string().email().optional(),
  sortOrder: z.number().default(0),
})

export async function POST(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'ADMIN')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const teacher = await prisma.teacher.create({ data: parsed.data })
  return apiSuccess(teacher, 201)
}
