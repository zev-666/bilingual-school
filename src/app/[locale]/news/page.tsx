import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Pin } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAnnouncements() {
  try {
    return await prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
    })
  } catch {
    return [
      { id: '1', slug: 'sample', titleZh: '範例公告', titleEn: 'Sample Announcement', category: 'NEWS', isPinned: false, publishedAt: new Date(), createdAt: new Date() },
    ]
  }
}

export default async function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('news')
  const tc = useTranslations('news.categories')
  const announcements = await getAnnouncements()

  return (
    <div className="section-padding">
      <div className="container-school">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
        <div className="space-y-4">
          {announcements.map((item: any) => (
            <Link key={item.id} href={`/news/${item.slug}` as any}
              className="card p-6 flex items-start gap-4 hover:border-primary-200 block">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-blue">{tc(item.category as any)}</span>
                  {item.isPinned && <Pin size={12} className="text-primary-500" />}
                </div>
                <h2 className="font-semibold text-gray-900 mb-1">
                  {locale === 'zh-TW' ? item.titleZh : item.titleEn}
                </h2>
                <p className="text-xs text-gray-400">{formatDate(item.publishedAt || item.createdAt, locale)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
