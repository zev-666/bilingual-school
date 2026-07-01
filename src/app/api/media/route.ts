// src/app/api/media/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const { searchParams } = new URL(req.url)
  const page    = parseInt(searchParams.get('page')    ?? '1',  10)
  const perPage = parseInt(searchParams.get('perPage') ?? '40', 10)
  const search  = searchParams.get('search') ?? ''
  const type    = searchParams.get('type')   ?? 'all' // 'image' | 'document' | 'all'

  const where: Record<string, unknown> = {}

  if (search) {
    where.filename = { contains: search, mode: 'insensitive' }
  }
  if (type === 'image') {
    where.mimeType = { startsWith: 'image/' }
  } else if (type === 'document') {
    where.NOT = { mimeType: { startsWith: 'image/' } }
  }

  const [data, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.media.count({ where }),
  ])

  return apiSuccess({
    data,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  })
}

export async function DELETE(req: NextRequest) {
  const authUser = await getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const { ids } = await req.json() as { ids: string[] }
  if (!Array.isArray(ids) || ids.length === 0) return apiError('No ids provided', 400)

  await prisma.media.deleteMany({ where: { id: { in: ids } } })
  return apiSuccess({ deleted: ids.length })
}
