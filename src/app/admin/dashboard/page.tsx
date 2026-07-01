import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Megaphone, MessageSquare, Image, FileText, Plus, ArrowRight } from 'lucide-react'

async function getStats() {
  try {
    const [announcements, contacts, albums, documents] = await Promise.all([
      prisma.announcement.count(),
      prisma.contact.count({ where: { status: 'UNREAD' } }),
      prisma.album.count(),
      prisma.document.count(),
    ])
    const recent = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
    return { announcements, contacts, albums, documents, recent }
  } catch {
    return { announcements: 0, contacts: 0, albums: 0, documents: 0, recent: [] }
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: '公告總數', value: stats.announcements, icon: Megaphone, color: 'bg-blue-500', href: '/admin/announcements' },
    { label: '未讀訊息', value: stats.contacts, icon: MessageSquare, color: 'bg-yellow-500', href: '/admin/contacts' },
    { label: '相簿數量', value: stats.albums, icon: Image, color: 'bg-green-500', href: '/admin/albums' },
    { label: '文件數量', value: stats.documents, icon: FileText, color: 'bg-purple-500', href: '/admin/documents' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
        <Link href="/admin/announcements/new" className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> 新增公告
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="card p-6 hover:border-primary-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </Link>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">最新公告</h2>
          <Link href="/admin/announcements" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            查看全部 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {(stats.recent as any[]).map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.titleZh}</p>
                <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('zh-TW')}</p>
              </div>
              <span className={`badge ${item.isPublished ? 'badge-green' : 'badge-gray'}`}>
                {item.isPublished ? '已發布' : '草稿'}
              </span>
            </div>
          ))}
          {stats.recent.length === 0 && <p className="text-sm text-gray-400 text-center py-4">尚無公告</p>}
        </div>
      </div>
    </div>
  )
}
