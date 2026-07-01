'use client'

// src/components/sections/NewsSection.tsx
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowRight, Pin } from 'lucide-react'
import Image from 'next/image'
import { Link as IntlLink } from '@/i18n/routing'
import { cn, formatDate, truncate, CATEGORY_COLORS } from '@/lib/utils'

interface Announcement {
  id: string
  slug: string
  titleZh: string
  titleEn: string
  summaryZh?: string | null
  summaryEn?: string | null
  category: string
  coverImage?: string | null
  isPinned: boolean
  publishedAt?: Date | null
  viewCount: number
  author: { name: string }
}

// Mock data for development (when DB is empty)
const MOCK_NEWS: Announcement[] = [
  {
    id: '1', slug: 'welcome-2024', titleZh: '2024學年度開學典禮圓滿舉行',
    titleEn: '2024 Academic Year Opening Ceremony Successfully Held',
    summaryZh: '本校2024學年度開學典禮於上週五圓滿舉行，全體師生歡聚一堂，共迎新學年的到來。',
    summaryEn: 'Our 2024 academic year opening ceremony was successfully held last Friday with all staff and students gathering to welcome the new school year.',
    category: 'ACTIVITY', coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80',
    isPinned: true, publishedAt: new Date('2024-09-02'), viewCount: 342, author: { name: '教務處' },
  },
  {
    id: '2', slug: 'english-competition', titleZh: '全國英語演講比賽獲獎公告',
    titleEn: 'National English Speech Competition Award Announcement',
    summaryZh: '恭喜本校學生在全國英語演講比賽中榮獲優異成績，展現本校優秀的雙語教育成果。',
    summaryEn: 'Congratulations to our students for excellent results in the National English Speech Competition.',
    category: 'COMPETITION', coverImage: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&q=80',
    isPinned: false, publishedAt: new Date('2024-08-28'), viewCount: 218, author: { name: '學務處' },
  },
  {
    id: '3', slug: 'admission-2025', titleZh: '2025學年度招生簡章公告',
    titleEn: '2025 Academic Year Admissions Brochure Released',
    summaryZh: '2025學年度招生作業即將展開，歡迎有意報名的家長及學生查閱招生簡章。',
    summaryEn: '2025 admissions are now open. We invite prospective students and parents to review the admissions brochure.',
    category: 'ADMISSION', coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80',
    isPinned: false, publishedAt: new Date('2024-08-15'), viewCount: 589, author: { name: '教務處' },
  },
  {
    id: '4', slug: 'campus-upgrade', titleZh: '校園設施升級完工公告',
    titleEn: 'Campus Facility Upgrade Completion Notice',
    summaryZh: '歷經三個月的整修工程，本校多功能活動中心及科學實驗室已全面升級完工。',
    summaryEn: 'After three months of renovation, our multi-purpose activity center and science laboratories have been fully upgraded.',
    category: 'ANNOUNCEMENT', coverImage: null,
    isPinned: false, publishedAt: new Date('2024-08-10'), viewCount: 145, author: { name: '總務處' },
  },
  {
    id: '5', slug: 'exchange-program', titleZh: '國際交流計畫招募學員',
    titleEn: 'International Exchange Program Recruiting Students',
    summaryZh: '本學年度國際交流計畫開始招募，提供學生赴美國、英國、澳洲等地交流的機會。',
    summaryEn: 'This academic year\'s international exchange program is now recruiting, offering students opportunities to study in the US, UK, and Australia.',
    category: 'ACTIVITY', coverImage: 'https://images.unsplash.com/photo-1529400971008-f566de0e6dfc?w=600&q=80',
    isPinned: false, publishedAt: new Date('2024-08-05'), viewCount: 276, author: { name: '國際部' },
  },
  {
    id: '6', slug: 'teacher-recruitment', titleZh: '誠徵優秀雙語教師',
    titleEn: 'Recruiting Excellent Bilingual Teachers',
    summaryZh: '本校誠徵具備雙語教學能力及國際視野的優秀教師，歡迎各界人才踴躍應徵。',
    summaryEn: 'We are seeking excellent teachers with bilingual teaching abilities and international vision.',
    category: 'ANNOUNCEMENT', coverImage: null,
    isPinned: false, publishedAt: new Date('2024-07-30'), viewCount: 98, author: { name: '人事室' },
  },
]

interface NewsSectionProps {
  locale: string
  announcements?: Announcement[]
}

export default function NewsSection({ locale, announcements = [] }: NewsSectionProps) {
  const t = useTranslations('home.news')
  const tNews = useTranslations('news')
  const isZh = locale === 'zh-TW'
  const items = announcements.length > 0 ? announcements : MOCK_NEWS

  return (
    <section className="section-padding bg-gray-50" aria-labelledby="news-heading">
      <div className="container-school">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-primary-600 font-medium text-sm uppercase tracking-wider mb-2">
              {isZh ? '即時資訊' : 'Latest Updates'}
            </p>
            <h2 id="news-heading" className="text-3xl md:text-4xl font-bold text-gray-900">
              {t('title')}
            </h2>
            <p className="text-gray-500 mt-2">{t('subtitle')}</p>
          </div>
          <IntlLink
            href="/news"
            className="hidden sm:flex items-center gap-2 text-primary-600 font-medium
              hover:text-primary-700 transition-colors"
          >
            {t('viewAll')}
            <ArrowRight size={16} aria-hidden="true" />
          </IntlLink>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.slice(0, 6).map((item, i) => {
            const title = isZh ? item.titleZh : item.titleEn
            const summary = isZh ? item.summaryZh : item.summaryEn
            const categoryColor = CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-700'
            const categoryLabel = tNews(`categories.${item.category}`)

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="card group overflow-hidden"
              >
                {/* Cover image */}
                {item.coverImage ? (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.coverImage}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {item.isPinned && (
                      <div className="absolute top-3 left-3 flex items-center gap-1
                        bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                        <Pin size={10} aria-hidden="true" />
                        {isZh ? '置頂' : 'Pinned'}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-12 bg-gradient-to-r from-primary-50 to-indigo-50" />
                )}

                <div className="p-5">
                  {/* Category + Date */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn('badge text-xs', categoryColor)}>
                      {categoryLabel}
                    </span>
                    {item.publishedAt && (
                      <time
                        dateTime={new Date(item.publishedAt).toISOString()}
                        className="text-xs text-gray-400"
                      >
                        {formatDate(item.publishedAt, locale)}
                      </time>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    <IntlLink href={`/news/${item.slug}` as '/'}>
                      {title}
                    </IntlLink>
                  </h3>

                  {summary && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {truncate(summary, 80)}
                    </p>
                  )}

                  <IntlLink
                    href={`/news/${item.slug}` as '/'}
                    className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors
                      flex items-center gap-1"
                  >
                    {tNews('readMore')}
                    <ArrowRight size={14} aria-hidden="true" />
                  </IntlLink>
                </div>
              </motion.article>
            )
          })}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <IntlLink href="/news" className="btn-secondary">
            {t('viewAll')}
          </IntlLink>
        </div>
      </div>
    </section>
  )
}
