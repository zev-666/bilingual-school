import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const createSchema = z.object({
  titleZh: z.string().min(1),
  titleEn: z.string().min(1),
  category: z.enum(['FORM', 'REGULATION', 'BROCHURE', 'REPORT', 'OTHER']),
  isPublished: z.boolean().optional().default(true),
  fileUrl: z.string().min(1),
  fileSize: z.number().optional().default(0),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const published = searchParams.get('published')

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (published === 'true') where.isPublished = true

    const documents = await prisma.document.findMany({
      where,
      orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(apiSuccess(documents))
  } catch (err) {
    console.error(err)
    return NextResponse.json(apiError('Failed to fetch documents'), { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user || !hasPermission(user.role, 'EDITOR')) {
    return NextResponse.json(apiError('Unauthorized'), { status: 401 })
  }

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const doc = await prisma.document.create({
      data: {
        titleZh: data.titleZh,
        titleEn: data.titleEn,
        category: data.category,
        isPublished: data.isPublished,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        downloadCount: 0,
      },
    })

    return NextResponse.json(apiSuccess(doc), { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(apiError(err.errors[0].message), { status: 400 })
    }
    console.error(err)
    return NextResponse.json(apiError('Failed to create document'), { status: 500 })
  }
}
