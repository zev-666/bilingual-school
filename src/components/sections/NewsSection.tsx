import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight, Pin, Trophy, GraduationCap, Megaphone, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Reveal from '@/components/ui/Reveal'

interface Announcement {
  id: string; slug: string; titleZh: string; titleEn: string
  category: string; isPinned: boolean; publishedAt: Date | null; createdAt: Date
}

// 每個分類對應的側欄卡片配色與圖標，藍／青兩種色階輪替
const SIDE_CARD_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  COMPETITION:   { bg: 'bg-[#FFF3EE]', text: 'text-[#2D241E]', icon: Trophy },
  WORKSHOP:      { bg: 'bg-[#E8F6EF]', text: 'text-[#2D241E]', icon: GraduationCap },
  ACTIVITY:      { bg: 'bg-[#FFF3EE]', text: 'text-[#2D241E]', icon: Megaphone },
  ADMISSION:     { bg: 'bg-[#E8F6EF]', text: 'text-[#2D241E]', icon: FileText },
  NEWS:          { bg: 'bg-[#FFF3EE]', text: 'text-[#2D241E]', icon: Megaphone },
  ANNOUNCEMENT:  { bg: 'bg-[#E8F6EF]', text: 'text-[#2D241E]', icon: Megaphone },
}
const DEFAULT_SIDE_STYLE = SIDE_CARD_STYLES.NEWS

export default function NewsSection({ locale, announcements }: { locale: string; announcements: Announcement[] }) {
  const t = useTranslations('home.news')
  const tc = useTranslations('news.categories')

  if (announcements.length === 0) return null

  const [featured, ...rest] = announcements
  const sideItems = rest.slice(0, 2)

  return (
    <section className="bg-[#FCFBF7] px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#C34E24]">{t('eyebrow')}</p>
              <h2 className="text-3xl font-bold text-[#2D241E] md:text-4xl">{t('title')}</h2>
            </div>
            <Link
              href="/news"
              className="hidden items-center gap-2 text-sm font-semibold text-[#C34E24] transition hover:underline sm:flex"
            >
              {t('more')} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          {/* 精選卡片 */}
          <Reveal>
            <Link
              href={`/news/${featured.slug}` as any}
              className="group relative block min-h-[280px] overflow-hidden rounded-[2rem] border border-[#FBDF74] bg-[#FEF9C3] p-7 shadow-[0_8px_24px_rgba(180,83,9,.10)] transition hover:-translate-y-1 sm:p-9"
            >
              <div className="flex items-center justify-between text-xs text-[#9E9187]">
                <span className="flex items-center gap-1.5 rounded-full bg-[#FDEEA0] px-3 py-1 text-[#B45309]">
                  {t('featured_badge')}
                  {featured.isPinned && <Pin size={12} aria-hidden="true" />}
                </span>
                <span>{formatDate(featured.publishedAt || featured.createdAt, locale)}</span>
              </div>
              <h3 className="mt-12 max-w-lg text-2xl font-bold leading-relaxed text-[#2D241E] md:text-3xl">
                {locale === 'zh-TW' ? featured.titleZh : featured.titleEn}
              </h3>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#B45309]">
                {locale === 'zh-TW' ? '閱讀全文' : 'Read more'} <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          </Reveal>

          {/* 側欄兩張小卡片 */}
          <div className="grid gap-5">
            {sideItems.map((item, index) => {
              const style = SIDE_CARD_STYLES[item.category] ?? DEFAULT_SIDE_STYLE
              const Icon = style.icon
              return (
                <Reveal key={item.id} delay={index * 0.1}>
                  <Link
                    href={`/news/${item.slug}` as any}
                    className={`group block rounded-[2rem] border border-[#EFE9E1] ${style.bg} p-6 transition hover:-translate-y-1`}
                  >
                    <div className="flex items-center justify-between text-xs text-[#9E9187]">
                      <span>{tc(item.category as any)}</span>
                      <Icon size={18} className="text-[#C34E24]" aria-hidden="true" />
                    </div>
                    <h3 className={`mt-5 text-xl font-bold leading-relaxed ${style.text}`}>
                      {locale === 'zh-TW' ? item.titleZh : item.titleEn}
                    </h3>
                    <div className="mt-5 flex items-center justify-between text-xs font-medium text-[#9E9187]">
                      <span>{formatDate(item.publishedAt || item.createdAt, locale)}</span>
                      <ArrowRight size={14} className="text-[#C34E24]" aria-hidden="true" />
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>

        <Link
          href="/news"
          className="mt-7 flex items-center gap-2 text-sm font-semibold text-[#C34E24] sm:hidden"
        >
          {t('more')} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
