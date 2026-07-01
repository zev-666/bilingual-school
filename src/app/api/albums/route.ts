// src/app/api/albums/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError, generateSlug } from '@/lib/utils'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page    = parseInt(searchParams.get('page') ?? '1', 10)
  const perPage = parseInt(searchParams.get('perPage') ?? '12', 10)
  const admin   = searchParams.get('admin') === 'true'
  const authUser = getAuthUserFromRequest(req)
  const where = admin && authUser ? {} : { isPublished: true }

  const [data, total] = await Promise.all([
    prisma.album.findMany({
      where, orderBy: [{ eventDate: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * perPage, take: perPage,
      include: { _count: { select: { photos: true } } },
    }),
    prisma.album.count({ where }),
  ])
  return apiSuccess({ data, meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } })
}

const createSchema = z.object({
  titleZh: z.string().min(1), titleEn: z.string().min(1),
  descZh: z.string().optional(), descEn: z.string().optional(),
  coverImage: z.string().url().optional(),
  eventDate: z.string().datetime().optional(),
  isPublished: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const album = await prisma.album.create({
    data: {
      ...parsed.data,
      slug: generateSlug(parsed.data.titleEn),
      authorId: authUser.userId,
      eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : null,
    },
  })
  return apiSuccess(album, 201)
}
