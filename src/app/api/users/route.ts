import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['AUTHOR', 'EDITOR', 'ADMIN', 'SUPER_ADMIN']),
})

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user || !hasPermission(user.role, 'ADMIN')) {
    return NextResponse.json(apiError('Unauthorized'), { status: 401 })
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    return NextResponse.json(apiSuccess(users))
  } catch (err) {
    console.error(err)
    return NextResponse.json(apiError('Failed to fetch users'), { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user || !hasPermission(user.role, 'ADMIN')) {
    return NextResponse.json(apiError('Unauthorized'), { status: 401 })
  }

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json(apiError('此電子信箱已被使用'), { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    return NextResponse.json(apiSuccess(newUser), { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(apiError(err.errors[0].message), { status: 400 })
    }
    console.error(err)
    return NextResponse.json(apiError('Failed to create user'), { status: 500 })
  }
}
