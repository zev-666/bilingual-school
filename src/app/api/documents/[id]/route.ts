import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'

const updateSchema = z.object({
  titleZh: z.string().min(1).optional(),
  titleEn: z.string().min(1).optional(),
  category: z.enum(['FORM', 'REGULATION', 'BROCHURE', 'REPORT', 'OTHER']).optional(),
  isPublished: z.boolean().optional(),
  fileUrl: z.string().optional(),
  fileSize: z.number().optional(),
})

interface Props {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const doc = await prisma.document.findUnique({ where: { id: params.id } })
    if (!doc) return NextResponse.json(apiError('Document not found'), { status: 404 })
    return NextResponse.json(apiSuccess(doc))
  } catch (err) {
    console.error(err)
    return NextResponse.json(apiError('Failed to fetch document'), { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const user = await getAuthUserFromRequest(req)
  if (!user || !hasPermission(user.role, 'EDITOR')) {
    return NextResponse.json(apiError('Unauthorized'), { status: 401 })
  }

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const doc = await prisma.document.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(apiSuccess(doc))
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(apiError(err.errors[0].message), { status: 400 })
    }
    console.error(err)
    return NextResponse.json(apiError('Failed to update document'), { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const user = await getAuthUserFromRequest(req)
  if (!user || !hasPermission(user.role, 'ADMIN')) {
    return NextResponse.json(apiError('Unauthorized'), { status: 401 })
  }

  try {
    await prisma.document.delete({ where: { id: params.id } })
    return NextResponse.json(apiSuccess({ deleted: true }))
  } catch (err) {
    console.error(err)
    return NextResponse.json(apiError('Failed to delete document'), { status: 500 })
  }
}

// Increment download count (public)
export async function POST(req: NextRequest, { params }: Props) {
  try {
    const body = await req.json().catch(() => ({}))
    if (body.action !== 'download') {
      return NextResponse.json(apiError('Unknown action'), { status: 400 })
    }

    const doc = await prisma.document.update({
      where: { id: params.id },
      data: { downloadCount: { increment: 1 } },
      select: { downloadCount: true },
    })

    return NextResponse.json(apiSuccess(doc))
  } catch (err) {
    console.error(err)
    return NextResponse.json(apiError('Failed to record download'), { status: 500 })
  }
}
