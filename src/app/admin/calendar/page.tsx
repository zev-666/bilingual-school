// src/app/admin/calendar/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { cn, CALENDAR_TYPE_COLORS } from '@/lib/utils'
import { Plus, Edit, CalendarDays } from 'lucide-react'
import DeleteCalendarEventButton from './DeleteCalendarEventButton'

export const metadata: Metadata = { title: '行事曆管理' }

const TYPE_LABELS: Record<string, string> = {
  HOLIDAY:  '假期',
  MEETING:  '會議',
  WORKSHOP: '研習活動',
  DEADLINE: '截止日期',
  ACTIVITY: '活動',
  OTHER:    '其他',
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

async function getEvents() {
  try {
    return await prisma.calendarEvent.findMany({ orderBy: { startDate: 'desc' } })
  } catch {
    return []
  }
}

export default async function AdminCalendarPage() {
  const events = await getEvents()

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">行事曆管理</h1>
        <Link href="/admin/calendar/new" className="btn-primary text-sm gap-1.5">
          <Plus size={16} />
          新增行程
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <CalendarDays size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 text-sm">尚無行事曆項目，點選右上角新增</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">日期</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">標題</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">類型</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">狀態</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(event.startDate)}
                    {event.endDate ? ` – ${formatDate(event.endDate)}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{event.titleZh}</p>
                    <p className="text-xs text-gray-400">{event.titleEn}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('badge text-xs', CALENDAR_TYPE_COLORS[event.type])}>
                      {TYPE_LABELS[event.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {event.isPublished ? (
                      <span className="badge text-xs bg-green-100 text-green-700">已發布</span>
                    ) : (
                      <span className="badge text-xs bg-gray-100 text-gray-500">草稿</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/calendar/${event.id}`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        aria-label="編輯"
                      >
                        <Edit size={15} />
                      </Link>
                      <DeleteCalendarEventButton id={event.id} title={event.titleZh} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
