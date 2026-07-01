import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Shield, User, Pencil } from 'lucide-react'
import DeleteUserButton from './DeleteUserButton'

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-red-100 text-red-700', icon: '👑' },
  ADMIN: { label: 'Admin', color: 'bg-orange-100 text-orange-700', icon: '🛡️' },
  EDITOR: { label: 'Editor', color: 'bg-blue-100 text-blue-700', icon: '✏️' },
  AUTHOR: { label: 'Author', color: 'bg-green-100 text-green-700', icon: '📝' },
}

async function getUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })
  } catch {
    return [
      {
        id: 'mock-1',
        name: '系統管理員',
        email: 'admin@school.edu.tw',
        role: 'SUPER_ADMIN',
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'mock-2',
        name: '陳編輯',
        email: 'editor@school.edu.tw',
        role: 'EDITOR',
        createdAt: new Date('2024-02-15'),
      },
      {
        id: 'mock-3',
        name: '林老師',
        email: 'author@school.edu.tw',
        role: 'AUTHOR',
        createdAt: new Date('2024-03-01'),
      },
    ]
  }
}

export default async function AdminUsersPage() {
  const users = await getUsers()

  const roleCounts = users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">使用者管理</h1>
          <p className="mt-1 text-sm text-gray-500">共 {users.length} 位使用者</p>
        </div>
        <Link href="/admin/users/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新增使用者
        </Link>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
          <div key={role} className="card p-4 text-center">
            <div className="text-2xl">{cfg.icon}</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{roleCounts[role] ?? 0}</div>
            <div className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
              {cfg.label}
            </div>
          </div>
        ))}
      </div>

      {/* Permission Guide */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">角色權限說明</p>
            <p className="mt-1 text-blue-600">
              Author（作者）→ Editor（編輯）→ Admin（管理員）→ Super Admin（超級管理員）
              <br />
              每個角色包含其下所有角色的權限。
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">使用者</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">角色</th>
              <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:table-cell">
                建立時間
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {users.map((user) => {
              const roleCfg = ROLE_CONFIG[user.role]
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${roleCfg?.color}`}>
                      <span>{roleCfg?.icon}</span>
                      {roleCfg?.label ?? user.role}
                    </span>
                  </td>
                  <td className="hidden px-6 py-4 text-sm text-gray-500 sm:table-cell">
                    {user.createdAt.toLocaleDateString('zh-TW')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="rounded p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                        title="編輯"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {user.role !== 'SUPER_ADMIN' && (
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
    </div>
  )
}
