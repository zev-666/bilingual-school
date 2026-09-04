import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight, Pin } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Reveal from '@/components/ui/Reveal'

interface Announcement {
  id: string
  slug: string
  titleZh: string
  titleEn: string
  category: string
  isPinned: boolean
  publishedAt: Date | null
  createdAt: Date
}

// 分類 → emoji 圖示（對應預覽稿側欄卡片的裝飾 icon）
const CATEGORY_EMOJI: Record<string, string> = {
  COMPETITION: '🏆',
  WORKSHOP: '🎓',
  ACTIVITY: '🎪',
  ADMISSION: '📄',
  NEWS: '📰',
  ANNOUNCEMENT: '📢',
}
const DEFAULT_EMOJI = '📢'

export default function NewsSection({ locale, announcements }: { locale: string; announcements: Announcement[] }) {
  const t = useTranslations('home.news')
  const tc = useTranslations('news.categories')
  const isEn = locale === 'en'

  if (announcements.length === 0) return null

  const [featured, ...rest] = announcements
  const sideItems = rest.slice(0, 2)

  const fDate = featured.publishedAt || featured.createdAt
  const fDay = fDate.getDate()
  const fMonth = fDate.getMonth() + 1

  return (
    <section className="bg-creamSoft py-[88px]">
      <div className="container-school">
        <div className="mb-11 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FBDCB3] bg-[#FFF1E0] px-4 py-1.5 text-[0.78rem] font-bold tracking-[0.14em] text-orangeDeep">
              📢 FROM THE CENTER
            </span>
            <h2 className="mt-3.5 text-[clamp(1.7rem,3vw,2.5rem)] font-extrabold text-ink">{t('title')}</h2>
            <p className="mt-1 text-inkSoft">{t('subtitle')}</p>
          </div>
          <Link
            href="/news"
            className="hidden items-center gap-2 text-sm font-bold text-orangeDeep transition-all hover:gap-3 sm:flex"
          >
            {t('more')} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* 焦點卡片 */}
          <Reveal>
            <Link
              href={`/news/${featured.slug}` as any}
              className="group relative block overflow-hidden rounded-[34px] border border-[#F5D9A0] bg-gradient-to-br from-[#FFF0C9] to-[#FFE3B6] p-[40px] shadow-card transition hover:-translate-y-[5px] hover:shadow-soft"
            >
              <span className="absolute left-[40px] top-[40px] inline-flex items-center gap-1.5 rounded-full border border-[#F3D79C] bg-white px-3.5 py-1 text-[0.78rem] font-bold text-[#A5711D]">
                {t('featured_badge')}
                {featured.isPinned && <Pin size={12} aria-hidden="true" />}
              </span>
              <div className="absolute right-10 top-10 flex flex-col items-center rounded-[18px] bg-white px-3.5 py-2 shadow-[0_6px_14px_rgba(178,122,66,0.12)]">
                <b className="font-heading text-2xl leading-none text-orangeDeep">{fDay}</b>
                <span className="text-[0.72rem] font-semibold text-inkSoft">{fMonth}月</span>
              </div>
              <span className="pointer-events-none absolute -bottom-4 -right-4 select-none text-[8rem] opacity-15" aria-hidden="true">
                📣
              </span>
              <h3 className="mt-20 max-w-lg text-[1.7rem] font-extrabold leading-[1.5] text-[#4E3A22]">
                {isEn ? featured.titleEn : featured.titleZh}
              </h3>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-orangeDeep">
                {isEn ? 'Read more' : '閱讀全文'} <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          </Reveal>

          {/* 側欄兩張小卡片 */}
          <div className="grid gap-6">
            {sideItems.map((item, index) => (
              <Reveal key={item.id} delay={index * 0.1}>
                <Link
                  href={`/news/${item.slug}` as any}
                  className="group flex h-full flex-col justify-between rounded-[30px] border border-line bg-white p-[28px_30px] shadow-card transition hover:-translate-y-[4px]"
                >
                  <div>
                    <div className="mb-3.5 flex items-center justify-between">
                      <span className="rounded-full bg-[#FFF1E0] px-3 py-1 text-[0.76rem] font-bold text-orangeDeep">
                        {tc(item.category as any)}
                      </span>
                      <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#DDF2E7] text-lg">
                        {CATEGORY_EMOJI[item.category] ?? DEFAULT_EMOJI}
                      </span>
                    </div>
                    <h3 className="text-[1.12rem] font-bold leading-[1.55] text-ink">
                      {isEn ? item.titleEn : item.titleZh}
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[0.8rem] font-semibold text-inkFaint">
                    <span>{formatDate(item.publishedAt || item.createdAt, locale)}</span>
                    <ArrowRight size={14} className="text-orangeDeep" aria-hidden="true" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        <Link href="/news" className="mt-7 flex items-center gap-2 text-sm font-bold text-orangeDeep sm:hidden">
          {t('more')} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
