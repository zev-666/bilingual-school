import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Plus, Pin } from 'lucide-react'
import DeleteAnnouncementButton from './DeleteAnnouncementButton'

async function getAnnouncements() {
  try {
    return await prisma.announcement.findMany({ orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }] })
  } catch { return [] }
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">公告管理</h1>
        <Link href="/admin/announcements/new" className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> 新增公告
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">標題</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">分類</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">狀態</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">建立時間</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((item: any) => (
              <tr key={item.id} className="border-b border-gray-50 last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {item.isPinned && <Pin size={12} className="text-primary-500" />}
                    <span className="font-medium text-gray-900">{item.titleZh}</span>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="badge-blue">{item.category}</span></td>
                <td className="px-6 py-4">
                  <span className={`badge ${item.isPublished ? 'badge-green' : 'badge-gray'}`}>
                    {item.isPublished ? '已發布' : '草稿'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString('zh-TW')}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/announcements/${item.slug}`} className="btn-ghost py-1.5 px-3 text-xs">
                      編輯
                    </Link>
                    <DeleteAnnouncementButton slug={item.slug} />
                  </div>
                </td>
              </tr>
            ))}
            {announcements.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">尚無公告資料</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
