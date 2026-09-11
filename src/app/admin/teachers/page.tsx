// src/app/admin/teachers/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { Plus, Edit, Users } from 'lucide-react'
import DeleteTeacherButton from './DeleteTeacherButton'

export const metadata: Metadata = { title: '師資管理' }

// 顯示順序與前台 /teachers 的 TYPE_ORDER 一致
const TYPE_ORDER = [
  'CONVENER',
  'FOREIGN',
  'FOREIGN_COUNSELLOR',
  'LOCAL_ADVISOR',
  'LOCAL_COUNSELLOR',
  'STAFF',
  'FULL_TIME',
  'PART_TIME',
] as const

const TYPE_LABELS: Record<string, string> = {
  CONVENER:           '召集人',
  FOREIGN:            '外籍顧問',
  FOREIGN_COUNSELLOR: '外籍輔導員',
  LOCAL_ADVISOR:      '中籍顧問',
  LOCAL_COUNSELLOR:   '中籍輔導員',
  STAFF:              '行政',
  FULL_TIME:          '專任',
  PART_TIME:          '兼任',
}
const TYPE_COLORS: Record<string, string> = {
  CONVENER:           'bg-rose-100 text-rose-700',
  FOREIGN:            'bg-teal-100 text-teal-700',
  FOREIGN_COUNSELLOR: 'bg-cyan-100 text-cyan-700',
  LOCAL_ADVISOR:      'bg-emerald-100 text-emerald-700',
  LOCAL_COUNSELLOR:   'bg-lime-100 text-lime-700',
  STAFF:              'bg-amber-100 text-amber-700',
  FULL_TIME:          'bg-blue-100 text-blue-700',
  PART_TIME:          'bg-purple-100 text-purple-700',
}

async function getTeachers() {
  try {
    return await prisma.teacher.findMany({
      orderBy: [{ sortOrder: 'asc' }, { nameZh: 'asc' }],
    })
  } catch {
    return []
  }
}

export default async function AdminTeachersPage() {
  const teachers = await getTeachers()

  // 依 TYPE_ORDER 建立分組，只保留有成員的類型
  // （原本寫死 4 種，漏掉 CONVENER／LOCAL_ADVISOR，導致召集人與中籍顧問在後台不顯示）
  const grouped = Object.fromEntries(
    TYPE_ORDER
      .map((type) => [type, teachers.filter((t: { type: string }) => t.type === type)] as const)
      .filter(([, list]) => list.length > 0),
  ) as Record<string, typeof teachers>

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">師資管理</h1>
        <Link href="/admin/teachers/new" className="btn-primary text-sm gap-1.5">
          <Plus size={16} />
          新增師資
        </Link>
      </div>

      {teachers.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <Users size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 text-sm">尚無師資資料，點選右上角新增</p>
        </div>
      ) : (
        Object.entries(grouped).map(([type, list]) =>
          list.length === 0 ? null : (
            <section key={type} className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {TYPE_LABELS[type]}（{list.length}）
              </h2>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 font-medium text-gray-500">姓名</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">職稱</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">類型</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">排序</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {list.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {teacher.avatar ? (
                              <Image
                                src={teacher.avatar}
                                alt={teacher.nameZh}
                                width={36}
                                height={36}
                                className="rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                <span className="text-sm font-medium text-gray-500">
                                  {teacher.nameZh.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{teacher.nameZh}</p>
                              <p className="text-xs text-gray-500">{teacher.nameEn}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{teacher.titleZh}</td>
                        <td className="px-4 py-3">
                          <span className={cn('badge text-xs', TYPE_COLORS[teacher.type])}>
                            {TYPE_LABELS[teacher.type]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{teacher.email ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{teacher.sortOrder}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/admin/teachers/${teacher.id}`}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                              aria-label="編輯"
                            >
                              <Edit size={15} />
                            </Link>
                            <DeleteTeacherButton id={teacher.id} name={teacher.nameZh} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )
        )
      )}
    </div>
  )
}
