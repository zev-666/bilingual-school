// src/app/api/documents/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const updateSchema = z.object({
  titleZh:     z.string().min(1).optional(),
  titleEn:     z.string().min(1).optional(),
  descZh:      z.string().optional(),
  descEn:      z.string().optional(),
  category:    z.enum(['FORM', 'REGULATION', 'BROCHURE', 'REPORT', 'OTHER']).optional(),
  fileUrl:     z.string().url().optional(),
  fileName:    z.string().optional(),
  fileSize:    z.number().positive().optional(),
  fileType:    z.string().optional(),
  isPublished: z.boolean().optional(),
})

interface Ctx { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    include: { author: { select: { name: true } } },
  })
  if (!doc) return apiError('Not found', 404)
  return apiSuccess(doc)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const doc = await prisma.document.update({ where: { id: params.id }, data: parsed.data })
  return apiSuccess(doc)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  await prisma.document.delete({ where: { id: params.id } })
  return apiSuccess({ deleted: true })
}
