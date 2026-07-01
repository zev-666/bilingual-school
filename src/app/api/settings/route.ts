import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const rows = await prisma.siteSetting.findMany()
    const settings = rows.reduce(
      (acc, row) => {
        acc[row.key] = row.value
        return acc
      },
      {} as Record<string, string>,
    )
    return NextResponse.json(apiSuccess(settings))
  } catch (err) {
    console.error(err)
    return NextResponse.json(apiError('Failed to fetch settings'), { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user || !hasPermission(user.role, 'ADMIN')) {
    return NextResponse.json(apiError('Unauthorized'), { status: 401 })
  }

  try {
    const body = await req.json()
    if (typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(apiError('Invalid body'), { status: 400 })
    }

    // Batch upsert all settings
    const ops = Object.entries(body as Record<string, string>).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      }),
    )

    await prisma.$transaction(ops)

    return NextResponse.json(apiSuccess({ saved: true }))
  } catch (err) {
    console.error(err)
    return NextResponse.json(apiError('Failed to save settings'), { status: 500 })
  }
}
