// src/app/admin/dashboard/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatRelativeTime } from '@/lib/utils'
import { Megaphone, Images, FileText, MessageSquare, Plus, ArrowRight, Eye } from 'lucide-react'

export const metadata: Metadata = { title: '儀表板' }

async function getStats() {
  try {
    const [announcements, albums, documents, contacts, recentAnnouncements, unreadContacts] = await Promise.all([
      prisma.announcement.count(),
      prisma.album.count(),
      prisma.document.count(),
      prisma.contact.count(),
      prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' }, take: 5,
        select: { id: true, slug: true, titleZh: true, isPublished: true, viewCount: true, createdAt: true },
      }),
      prisma.contact.count({ where: { status: 'UNREAD' } }),
    ])
    return { announcements, albums, documents, contacts, recentAnnouncements, unreadContacts }
  } catch {
    return {
      announcements: 0, albums: 0, documents: 0, contacts: 0,
      recentAnnouncements: [], unreadContacts: 0,
    }
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const STAT_CARDS = [
    { label: '公告總數',    value: stats.announcements, icon: Megaphone,     href: '/admin/announcements', color: 'text-blue-600 bg-blue-50' },
    { label: '相簿總數',    value: stats.albums,         icon: Images,        href: '/admin/albums',         color: 'text-green-600 bg-green-50' },
    { label: '文件總數',    value: stats.documents,      icon: FileText,      href: '/admin/documents',      color: 'text-orange-600 bg-orange-50' },
    { label: '未讀訊息',    value: stats.unreadContacts, icon: MessageSquare, href: '/admin/contacts',       color: 'text-red-600 bg-red-50' },
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
        <Link href="/admin/announcements/new" className="btn-primary text-sm gap-1.5">
          <Plus size={16} />
          新增公告
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent announcements */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">最新公告</h2>
          <Link href="/admin/announcements" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            查看全部 <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {stats.recentAnnouncements.length === 0 ? (
            <p className="p-5 text-sm text-gray-400 text-center">尚無公告</p>
          ) : (
            stats.recentAnnouncements.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${item.isPublished ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <Link href={`/admin/announcements/${item.id}`} className="text-sm font-medium text-gray-700 truncate hover:text-primary-600">
                    {item.titleZh}
                  </Link>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Eye size={12} /> {item.viewCount}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatRelativeTime(item.createdAt, 'zh-TW')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '新增公告', href: '/admin/announcements/new', icon: Megaphone },
            { label: '上傳相簿', href: '/admin/albums',            icon: Images },
            { label: '上傳文件', href: '/admin/documents',         icon: FileText },
            { label: '查看訊息', href: '/admin/contacts',          icon: MessageSquare },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2 p-5 rounded-xl border border-gray-200
                bg-white hover:border-primary-300 hover:bg-primary-50 transition-all text-center"
            >
              <Icon size={22} className="text-primary-600" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
