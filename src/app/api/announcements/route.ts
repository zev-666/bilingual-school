// src/app/api/announcements/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError, generateSlug } from '@/lib/utils'
import { z } from 'zod'

// GET /api/announcements — public listing
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page     = parseInt(searchParams.get('page') ?? '1', 10)
  const perPage  = parseInt(searchParams.get('perPage') ?? '9', 10)
  const category = searchParams.get('category')
  const q        = searchParams.get('q')
  const admin    = searchParams.get('admin') === 'true'

  const authUser = getAuthUserFromRequest(req)

  // Non-admins only see published items
  const where: Record<string, unknown> = admin && authUser ? {} : { isPublished: true }

  if (category && category !== 'all') where.category = category
  if (q) {
    where.OR = [
      { titleZh: { contains: q, mode: 'insensitive' } },
      { titleEn: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      skip: (page - 1) * perPage,
      take: perPage,
      include: { author: { select: { name: true, email: true } } },
    }),
    prisma.announcement.count({ where }),
  ])

  return apiSuccess({ data, meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } })
}

// POST /api/announcements — admin create
const createSchema = z.object({
  titleZh:    z.string().min(1),
  titleEn:    z.string().min(1),
  summaryZh:  z.string().optional(),
  summaryEn:  z.string().optional(),
  contentZh:  z.string().min(1),
  contentEn:  z.string().min(1),
  category:   z.enum(['ANNOUNCEMENT','ACTIVITY','ADMISSION','COMPETITION','NEWS']),
  coverImage: z.string().url().optional(),
  isPinned:   z.boolean().optional().default(false),
  isPublished:z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'AUTHOR')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const { data } = parsed
  const slug = generateSlug(data.titleEn)

  const announcement = await prisma.announcement.create({
    data: {
      ...data,
      slug,
      authorId: authUser.userId,
      publishedAt: data.isPublished ? new Date() : null,
    },
  })

  return apiSuccess(announcement, 201)
}
