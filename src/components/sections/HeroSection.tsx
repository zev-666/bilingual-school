'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Globe, BookOpen, Sparkles as SparklesIcon, ArrowDown } from 'lucide-react'

interface Banner { titleZh: string; titleEn: string; subtitleZh?: string | null; subtitleEn?: string | null; imageUrl: string; linkUrl?: string | null }

export default function HeroSection({ locale, banners }: { locale: string; banners: Banner[] }) {
  const t = useTranslations('home.hero')
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => setCurrent(p => (p + 1) % banners.length), 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  const hasBanner = banners.length > 0
  const title = hasBanner
    ? (locale === 'zh-TW' ? banners[current].titleZh : banners[current].titleEn)
    : t('title')
  const subtitle = hasBanner
    ? (locale === 'zh-TW' ? banners[current].subtitleZh : banners[current].subtitleEn)
    : t('subtitle')

  // 預設文案支援三段式著色（前段 / 中段強調色 / 後段），
  // 若是 banner 動態內容則無法保證含有 highlight 片語，原樣輸出即可。
  const highlight = t('title_highlight')
  const titleParts = !hasBanner && title.includes(highlight) ? title.split(highlight) : null

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-sky-500 via-[#45c4df] to-[#8adbd7]">
      <div className="pointer-events-none absolute -right-24 top-14 h-72 w-72 rounded-full border-[32px] border-white/15" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[16%] top-28 h-10 w-10 rounded-full bg-rose-400/80" aria-hidden="true" />

      <div className="mx-auto grid min-h-[625px] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        {/* 左側文字 */}
        <div className="relative z-10 max-w-2xl motion-safe:animate-[fadeInUp_.6s_ease-out]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-bold tracking-wide text-white backdrop-blur-sm">
            <SparklesIcon size={14} aria-hidden="true" />
            {t('badge')}
          </div>
          <h1 className="max-w-[700px] text-[clamp(2.8rem,7vw,6.2rem)] font-black leading-[1.05] tracking-[-0.06em] text-white">
            {titleParts ? (
              <>
                {titleParts[0]}
                <br />
                <span className="text-slate-900">{highlight}</span>
                <br />
                {titleParts[1]}
              </>
            ) : (
              title
            )}
          </h1>
          {subtitle && (
            <p className="mt-7 max-w-lg text-base leading-8 text-white/90 sm:text-lg">{subtitle}</p>
          )}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-3 rounded-full bg-amber-500 px-6 py-4 text-sm font-extrabold text-slate-900 shadow-[0_8px_0_#d67f0a] transition hover:-translate-y-1 hover:shadow-[0_11px_0_#d67f0a] focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              {t('cta_primary')}
              <ArrowDown size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/admission"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/70 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/25 focus:outline-none focus:ring-4 focus:ring-white/40"
            >
              {t('cta_secondary')}
            </Link>
          </div>
        </div>

        {/* 右側插畫組合 */}
        <div className="relative mx-auto hidden h-[340px] w-full max-w-[450px] sm:h-[430px] lg:block">
          <div className="absolute inset-8 rotate-[-7deg] rounded-[42px] border-2 border-white/40 bg-white/15 backdrop-blur-sm motion-safe:animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute inset-12 rotate-[7deg] rounded-[42px] border-2 border-slate-900/10 bg-white/20 motion-safe:animate-[float_9s_ease-in-out_infinite_1.2s]" />
          <div className="absolute left-1/2 top-1/2 flex h-56 w-56 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[20px_25px_0_rgba(23,38,58,0.12)]">
            <Globe size={112} strokeWidth={1.2} className="text-sky-500" aria-hidden="true" />
            <span className="absolute -right-3 top-8 flex h-11 w-11 items-center justify-center rounded-full bg-rose-400 text-white shadow-md">
              <BookOpen size={20} aria-hidden="true" />
            </span>
            <span className="absolute -bottom-2 left-1 flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-slate-900 shadow-md">
              <SparklesIcon size={20} aria-hidden="true" />
            </span>
          </div>
          <span className="absolute left-0 top-20 rounded-2xl bg-white/80 px-4 py-3 text-xs font-extrabold text-slate-900 shadow-lg">
            learn / connect
          </span>
          <span className="absolute bottom-4 right-0 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-extrabold text-white shadow-lg">
            基隆出發
          </span>
        </div>
      </div>

      {/* 底部弧形轉場，銜接下一區塊 */}
      <div className="absolute -bottom-px left-0 h-12 w-full rounded-t-[50%] bg-[#fffaf0]" aria-hidden="true" />

      {banners.length > 1 && (
        <div className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
