// src/app/admin/users/[id]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken, SESSION_COOKIE } from '@/lib/auth'
import UserEditor from '../UserEditor'

export const metadata: Metadata = { title: '編輯使用者' }

interface Props { params: { id: string } }

async function getUser(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })
  } catch {
    return null
  }
}

function getCurrentUserRole() {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value
    if (!token) return undefined
    const payload = verifyToken(token)
    return payload?.role ?? undefined
  } catch {
    return undefined
  }
}

export default async function EditUserPage({ params }: Props) {
  const [user, currentUserRole] = await Promise.all([getUser(params.id), getCurrentUserRole()])
  if (!user) notFound()

  return (
    <UserEditor
      mode="edit"
      currentUserRole={currentUserRole}
      initialData={{
        id:       user.id,
        name:     user.name,
        email:    user.email,
        role:     user.role,
        isActive: user.isActive,
        password: '',
      }}
    />
  )
}
