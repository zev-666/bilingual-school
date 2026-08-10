// src/app/api/calendar-events/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const EVENT_TYPES = ['HOLIDAY', 'MEETING', 'WORKSHOP', 'DEADLINE', 'ACTIVITY', 'OTHER'] as const

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const year = searchParams.get('year')

  const where = {
    isPublished: true,
    ...(type && type !== 'all' ? { type: type as (typeof EVENT_TYPES)[number] } : {}),
    ...(year
      ? {
          startDate: {
            gte: new Date(`${year}-01-01T00:00:00.000Z`),
            lt: new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`),
          },
        }
      : {}),
  }

  const events = await prisma.calendarEvent.findMany({
    where,
    orderBy: { startDate: 'asc' },
  })
  return apiSuccess(events)
}

const createSchema = z.object({
  titleZh:     z.string().min(1),
  titleEn:     z.string().min(1),
  descZh:      z.string().optional(),
  descEn:      z.string().optional(),
  startDate:   z.coerce.date(),
  endDate:     z.coerce.date().optional(),
  type:        z.enum(EVENT_TYPES).default('OTHER'),
  isPublished: z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const event = await prisma.calendarEvent.create({ data: parsed.data })
  return apiSuccess(event, 201)
}
