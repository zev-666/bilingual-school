// src/app/api/documents/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const page     = parseInt(searchParams.get('page') ?? '1', 10)
  const perPage  = 12
  const where = {
    isPublished: true,
    ...(category && category !== 'all' ? { category: category as 'FORM' | 'REGULATION' | 'BROCHURE' | 'REPORT' | 'OTHER' } : {}),
  }
  const [data, total] = await Promise.all([
    prisma.document.findMany({
      where, orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage, take: perPage,
      include: { author: { select: { name: true } } },
    }),
    prisma.document.count({ where }),
  ])
  return apiSuccess({ data, meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } })
}

const createSchema = z.object({
  titleZh: z.string().min(1), titleEn: z.string().min(1),
  descZh: z.string().optional(), descEn: z.string().optional(),
  category: z.enum(['FORM','REGULATION','BROCHURE','REPORT','OTHER']).default('OTHER'),
  fileUrl: z.string().url(), fileName: z.string().min(1),
  fileSize: z.number().positive(), fileType: z.string(),
  isPublished: z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const doc = await prisma.document.create({ data: { ...parsed.data, authorId: authUser.userId } })
  return apiSuccess(doc, 201)
}
