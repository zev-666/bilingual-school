import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['AUTHOR', 'EDITOR', 'ADMIN', 'SUPER_ADMIN']).optional(),
})

interface Props {
  params: { id: string }
}

export async function GET(req: NextRequest, { params }: Props) {
  const user = await getAuthUserFromRequest(req)
  if (!user || !hasPermission(user.role, 'ADMIN')) {
    return NextResponse.json(apiError('Unauthorized'), { status: 401 })
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    if (!target) return NextResponse.json(apiError('User not found'), { status: 404 })
    return NextResponse.json(apiSuccess(target))
  } catch (err) {
    console.error(err)
    return NextResponse.json(apiError('Failed to fetch user'), { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const user = await getAuthUserFromRequest(req)
  if (!user || !hasPermission(user.role, 'ADMIN')) {
    return NextResponse.json(apiError('Unauthorized'), { status: 401 })
  }

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const updateData: Record<string, unknown> = {}
    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email
    if (data.role) updateData.role = data.role
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12)
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json(apiSuccess(updated))
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(apiError(err.errors[0].message), { status: 400 })
    }
    console.error(err)
    return NextResponse.json(apiError('Failed to update user'), { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const user = await getAuthUserFromRequest(req)
  if (!user || !hasPermission(user.role, 'ADMIN')) {
    return NextResponse.json(apiError('Unauthorized'), { status: 401 })
  }

  try {
    // Prevent deleting yourself
    if (user.id === params.id) {
      return NextResponse.json(apiError('不能刪除自己的帳號'), { status: 400 })
    }

    // Prevent deleting SUPER_ADMIN
    const target = await prisma.user.findUnique({ where: { id: params.id } })
    if (target?.role === 'SUPER_ADMIN') {
      return NextResponse.json(apiError('不能刪除超級管理員帳號'), { status: 403 })
    }

    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json(apiSuccess({ deleted: true }))
  } catch (err) {
    console.error(err)
    return NextResponse.json(apiError('Failed to delete user'), { status: 500 })
  }
}
