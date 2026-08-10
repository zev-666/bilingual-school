// src/app/api/calendar-events/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const EVENT_TYPES = ['HOLIDAY', 'MEETING', 'WORKSHOP', 'DEADLINE', 'ACTIVITY', 'OTHER'] as const

const updateSchema = z.object({
  titleZh:     z.string().min(1).optional(),
  titleEn:     z.string().min(1).optional(),
  descZh:      z.string().optional(),
  descEn:      z.string().optional(),
  startDate:   z.coerce.date().optional(),
  endDate:     z.coerce.date().optional().nullable(),
  type:        z.enum(EVENT_TYPES).optional(),
  isPublished: z.boolean().optional(),
})

interface Ctx { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const event = await prisma.calendarEvent.findUnique({ where: { id: params.id } })
  if (!event) return apiError('Not found', 404)
  return apiSuccess(event)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const event = await prisma.calendarEvent.update({ where: { id: params.id }, data: parsed.data })
  return apiSuccess(event)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  await prisma.calendarEvent.delete({ where: { id: params.id } })
  return apiSuccess({ deleted: true })
}
