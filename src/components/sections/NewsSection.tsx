import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight, Pin, Trophy, GraduationCap, Megaphone, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Announcement {
  id: string; slug: string; titleZh: string; titleEn: string
  category: string; isPinned: boolean; publishedAt: Date | null; createdAt: Date
}

// 每個分類對應的側欄卡片配色與圖標，跟 mockup 的活潑輪替配色呼應
const SIDE_CARD_STYLES: Record<string, { bg: string; badgeBg: string; badgeText: string; icon: any }> = {
  COMPETITION:   { bg: 'bg-white',   badgeBg: 'bg-rose-100',  badgeText: 'text-rose-700',  icon: Trophy },
  WORKSHOP:      { bg: 'bg-amber-500', badgeBg: 'bg-white/70', badgeText: 'text-amber-900', icon: GraduationCap },
  ACTIVITY:      { bg: 'bg-white',   badgeBg: 'bg-sky-100',   badgeText: 'text-sky-700',   icon: Megaphone },
  ADMISSION:     { bg: 'bg-white',   badgeBg: 'bg-sky-100',   badgeText: 'text-sky-700',   icon: FileText },
  NEWS:          { bg: 'bg-white',   badgeBg: 'bg-sky-100',   badgeText: 'text-sky-700',   icon: Megaphone },
  ANNOUNCEMENT:  { bg: 'bg-white',   badgeBg: 'bg-sky-100',   badgeText: 'text-sky-700',   icon: Megaphone },
}
const DEFAULT_SIDE_STYLE = SIDE_CARD_STYLES.NEWS

export default function NewsSection({ locale, announcements }: { locale: string; announcements: Announcement[] }) {
  const t = useTranslations('home.news')
  const tc = useTranslations('news.categories')

  if (announcements.length === 0) return null

  const [featured, ...rest] = announcements
  const sideItems = rest.slice(0, 2)

  return (
    <section className="bg-[#edf8fa] px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-sky-600">{t('eyebrow')}</p>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">{t('title')}</h2>
          </div>
          <Link
            href="/news"
            className="hidden items-center gap-2 text-sm font-bold text-sky-600 transition hover:text-slate-900 sm:flex"
          >
            {t('more')} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          {/* 精選卡片 */}
          <Link
            href={`/news/${featured.slug}` as any}
            className="group relative min-h-[390px] overflow-hidden rounded-[32px] bg-slate-900 p-8 text-white transition hover:shadow-2xl sm:p-10"
          >
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[38px] border-sky-500/40 transition group-hover:scale-110" aria-hidden="true" />
            <div className="absolute bottom-[-80px] right-16 h-48 w-48 rounded-full bg-rose-400/70" aria-hidden="true" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500 px-3 py-1.5 text-[11px] font-black text-slate-900">
                    {t('featured_badge')}
                  </span>
                  {featured.isPinned && <Pin size={14} className="text-amber-400" aria-hidden="true" />}
                </div>
                <h3 className="mt-8 max-w-lg text-3xl font-black leading-tight sm:text-4xl">
                  {locale === 'zh-TW' ? featured.titleZh : featured.titleEn}
                </h3>
              </div>
              <div className="flex items-center justify-between border-t border-white/15 pt-5 text-xs font-bold text-white/60">
                <span>{formatDate(featured.publishedAt || featured.createdAt, locale)}</span>
                <span className="flex items-center gap-2 text-white">
                  {locale === 'zh-TW' ? '閱讀全文' : 'Read more'} <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </div>
          </Link>

          {/* 側欄兩張小卡片 */}
          <div className="grid gap-5">
            {sideItems.map((item) => {
              const style = SIDE_CARD_STYLES[item.category] ?? DEFAULT_SIDE_STYLE
              const Icon = style.icon
              const isDark = style.bg === 'bg-amber-500'
              return (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}` as any}
                  className={`group rounded-[28px] ${style.bg} p-7 transition hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <span className={`rounded-full ${style.badgeBg} px-3 py-1.5 text-[11px] font-black ${style.badgeText}`}>
                      {tc(item.category as any)}
                    </span>
                    <Icon size={20} className={isDark ? 'text-slate-900' : 'text-slate-400'} aria-hidden="true" />
                  </div>
                  <h3 className={`text-xl font-black ${isDark ? 'text-slate-900' : 'text-slate-900'}`}>
                    {locale === 'zh-TW' ? item.titleZh : item.titleEn}
                  </h3>
                  <div className={`mt-6 flex items-center justify-between text-xs font-bold ${isDark ? 'text-amber-900' : 'text-slate-400'}`}>
                    <span>{formatDate(item.publishedAt || item.createdAt, locale)}</span>
                    <ArrowRight size={14} className={isDark ? 'text-slate-900' : 'text-sky-500'} aria-hidden="true" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <Link
          href="/news"
          className="mt-7 flex items-center gap-2 text-sm font-bold text-sky-600 sm:hidden"
        >
          {t('more')} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
