// src/app/api/contacts/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email(),
  phone:   z.string().max(20).optional(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
})

// POST /api/contacts — public form submission
export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? req.headers.get('x-real-ip') ?? undefined

  const contact = await prisma.contact.create({
    data: { ...parsed.data, ipAddress: ip },
  })
  return apiSuccess({ id: contact.id }, 201)
}

// GET /api/contacts — admin only
export async function GET(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page   = parseInt(searchParams.get('page') ?? '1', 10)
  const perPage = 20

  const where = status ? { status: status as any } : {}
  const [data, total] = await Promise.all([
    prisma.contact.findMany({
      where, orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage, take: perPage,
    }),
    prisma.contact.count({ where }),
  ])

  return apiSuccess({ data, meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } })
}
