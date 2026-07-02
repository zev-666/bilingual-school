// src/app/api/contacts/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

interface Ctx { params: { id: string } }

export async function GET(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const contact = await prisma.contact.findUnique({ where: { id: params.id } })
  if (!contact) return apiError('Not found', 404)

  // Mark as READ if still UNREAD
  if (contact.status === 'UNREAD') {
    await prisma.contact.update({ where: { id: params.id }, data: { status: 'READ' } })
  }

  return apiSuccess(contact)
}

const updateSchema = z.object({
  status: z.enum(['UNREAD', 'READ', 'REPLIED', 'ARCHIVED']).optional(),
})

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const contact = await prisma.contact.update({
    where: { id: params.id },
    data: parsed.data,
  })
  return apiSuccess(contact)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  await prisma.contact.delete({ where: { id: params.id } })
  return apiSuccess({ deleted: true })
}
