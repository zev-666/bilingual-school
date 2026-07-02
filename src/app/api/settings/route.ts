// src/app/api/settings/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET() {
  const rows = await prisma.siteSetting.findMany()
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return apiSuccess(map)
}

export async function POST(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'ADMIN')) return apiError('Forbidden', 403)

  const body: Record<string, string> = await req.json()
  if (typeof body !== 'object' || Array.isArray(body)) {
    return apiError('Invalid payload', 422)
  }

  // Batch upsert all key-value pairs in a transaction
  await prisma.$transaction(
    Object.entries(body).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where:  { key },
        update: { value: String(value) },
        create: { key, value: String(value), type: 'string' },
      })
    )
  )

  return apiSuccess({ saved: Object.keys(body).length })
}
