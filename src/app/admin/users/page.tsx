// src/app/admin/users/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate, cn } from '@/lib/utils'
import { Plus, Users } from 'lucide-react'
import DeleteUserButton from './DeleteUserButton'
import { cookies } from 'next/headers'
import { verifyToken, SESSION_COOKIE } from '@/lib/auth'

export const metadata: Metadata = { title: '使用者管理' }

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: '超級管理員', ADMIN: '管理員', EDITOR: '編輯', AUTHOR: '作者',
}
const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-700',
  ADMIN:       'bg-purple-100 text-purple-700',
  EDITOR:      'bg-blue-100 text-blue-700',
  AUTHOR:      'bg-green-100 text-green-700',
}

async function getUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    })
  } catch {
    return []
  }
}

function getCurrentUserId() {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value
    if (!token) return null
    const payload = verifyToken(token)
    return payload?.userId ?? null
  } catch {
    return null
  }
}

export default async function AdminUsersPage() {
  const [users, currentUserId] = await Promise.all([getUsers(), getCurrentUserId()])

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">使用者管理</h1>
        <Link href="/admin/users/new" className="btn-primary text-sm gap-1.5">
          <Plus size={16} />
          新增使用者
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <Users size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 text-sm">尚無使用者</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">使用者</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">角色</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">狀態</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">建立日期</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => {
                const isSelf       = user.id === currentUserId
                const isSuperAdmin = user.role === 'SUPER_ADMIN'
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-primary-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        <div>
                          <p className="font-medium text-gray-900 flex items-center gap-1.5">
                            {user.name}
                            {isSelf && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
                                你
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('badge text-xs', ROLE_COLORS[user.role])}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      )}>
                        {user.isActive ? '啟用' : '停用'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {formatDate(user.createdAt, 'zh-TW')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="px-2.5 py-1 text-xs rounded-lg text-primary-600
                            hover:bg-primary-50 transition-colors font-medium"
                        >
                          編輯
                        </Link>
                        {!isSelf && !isSuperAdmin && (
                          <DeleteUserButton id={user.id} name={user.name} />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
