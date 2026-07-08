import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight, Pin } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Announcement {
  id: string; slug: string; titleZh: string; titleEn: string
  category: string; isPinned: boolean; publishedAt: Date | null; createdAt: Date
}

export default function NewsSection({ locale, announcements }: { locale: string; announcements: Announcement[] }) {
  const t = useTranslations('home.news')
  const tc = useTranslations('news.categories')

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-school">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{t('title')}</h2>
            <p className="text-gray-500">{t('subtitle')}</p>
          </div>
          <Link href="/news" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm">
            {t('more')} <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((item) => (
            <Link key={item.id} href={`/news/${item.slug}` as any} className="card p-6 hover:border-primary-200">
              <div className="flex items-start justify-between mb-3">
                <span className="badge-blue">{tc(item.category as any)}</span>
                {item.isPinned && <Pin size={14} className="text-primary-500 mt-0.5" />}
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3">
                {locale === 'zh-TW' ? item.titleZh : item.titleEn}
              </h3>
              <p className="text-xs text-gray-400">
                {formatDate(item.publishedAt || item.createdAt, locale)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
