import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import UserEditor from '../UserEditor'

interface Props {
  params: { id: string }
}

async function getUser(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    })
  } catch {
    return null
  }
}

export default async function EditUserPage({ params }: Props) {
  const user = await getUser(params.id)
  if (!user) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/users"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">編輯使用者</h1>
          <p className="mt-0.5 text-sm text-gray-500">{user.name}</p>
        </div>
      </div>
      <UserEditor
        mode="edit"
        initialData={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }}
      />
    </div>
  )
}
