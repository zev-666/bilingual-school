// src/app/admin/announcements/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate, CATEGORY_COLORS, cn } from '@/lib/utils'
import { Plus, Edit, Eye, EyeOff, Trash2 } from 'lucide-react'

export const metadata: Metadata = { title: '公告管理' }

async function getAnnouncements() {
  try {
    return await prisma.announcement.findMany({
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: { author: { select: { name: true } } },
    })
  } catch {
    return []
  }
}

export default async function AdminAnnouncementsPage() {
  const items = await getAnnouncements()

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">公告管理</h1>
        <Link href="/admin/announcements/new" className="btn-primary text-sm gap-1.5">
          <Plus size={16} />
          新增公告
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">標題</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">分類</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">狀態</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">作者</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">發布日期</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">瀏覽</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    尚無公告，點選右上角新增
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.isPinned && (
                          <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-medium">
                            置頂
                          </span>
                        )}
                        <span className="font-medium text-gray-900 line-clamp-1 max-w-xs">
                          {item.titleZh}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('badge text-xs', CATEGORY_COLORS[item.category])}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium',
                        item.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      )}>
                        {item.isPublished
                          ? <><Eye size={11} /> 已發布</>
                          : <><EyeOff size={11} /> 草稿</>
                        }
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.author.name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.publishedAt ? formatDate(item.publishedAt, 'zh-TW') : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.viewCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/announcements/${item.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          aria-label="編輯"
                        >
                          <Edit size={15} aria-hidden="true" />
                        </Link>
                        <DeleteButton id={item.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Client delete button
import DeleteButton from './DeleteButton'
