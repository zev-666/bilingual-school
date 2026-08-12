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

  const highlight = t('title_highlight')
  const titleParts = !hasBanner && title.includes(highlight) ? title.split(highlight) : null

  return (
    <section className="relative isolate overflow-hidden bg-[#FBF8F1]">
      <div className="pointer-events-none absolute -right-16 top-10 h-72 w-72 rounded-[45%] rotate-6 bg-[#E9E5D6] border border-[#CDBB9D]/40" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[18%] top-32 h-8 w-8 rounded-full bg-[#A8C7D5]" aria-hidden="true" />

      <div className="mx-auto grid min-h-[600px] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        {/* 左側文字 */}
        <div className="relative z-10 max-w-2xl motion-safe:animate-[fadeInUp_.6s_ease-out]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#CDBB9D] bg-[#f2eadc] px-4 py-2 text-xs font-semibold tracking-wide text-[#A98262]">
            <SparklesIcon size={14} aria-hidden="true" />
            {t('badge')}
          </div>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.25] tracking-tight text-[#4E514B] md:text-6xl">
            {titleParts ? (
              <>
                {titleParts[0]}
                <br />
                <span className="text-[#A98262]">{highlight}</span>
                <br />
                {titleParts[1]}
              </>
            ) : (
              title
            )}
          </h1>
          {subtitle && (
            <p className="mt-6 max-w-lg text-base leading-8 text-[#77786e] md:text-lg">{subtitle}</p>
          )}
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/about"
              className="inline-flex items-center gap-3 rounded-full bg-[#A98262] px-6 py-3.5 text-sm font-semibold text-[#fffaf1] shadow-[0_8px_24px_rgba(126,103,72,.18)] transition hover:bg-[#967554] focus:outline-none focus:ring-4 focus:ring-[#A8C7D5]/50"
            >
              {t('cta_primary')}
              <ArrowDown size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/admission"
              className="inline-flex items-center justify-center rounded-full border border-[#CDBB9D] px-6 py-3.5 text-sm font-semibold text-[#A98262] transition hover:bg-[#f2eadc] focus:outline-none focus:ring-4 focus:ring-[#A8C7D5]/40"
            >
              {t('cta_secondary')}
            </Link>
          </div>
        </div>

        {/* 右側插畫組合 */}
        <div className="relative mx-auto hidden h-[340px] w-full max-w-[440px] sm:h-[420px] lg:block">
          <div className="absolute inset-6 rotate-3 rounded-[42%] border border-[#CDBB9D] bg-[#f7f0e3] shadow-[0_16px_45px_rgba(126,103,72,.10)] motion-safe:animate-[float_9s_ease-in-out_infinite]" />
          <div className="absolute left-1/2 top-1/2 flex h-56 w-56 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[42%] -rotate-3 border border-[#CDBB9D] bg-[#f9f6ef]">
            <Globe size={80} strokeWidth={1.2} className="text-[#A98262]" aria-hidden="true" />
            <span className="absolute -right-2 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-[#CDBB9D] bg-[#f4eadb] text-[#A98262] shadow-sm">
              <BookOpen size={20} aria-hidden="true" />
            </span>
            <span className="absolute -bottom-3 left-2 flex h-11 w-11 items-center justify-center rounded-full border border-[#A8C7D5]/60 bg-[#eaf1ef] text-[#718087] shadow-sm">
              <SparklesIcon size={20} aria-hidden="true" />
            </span>
          </div>
          <span className="absolute bottom-6 right-6 rounded-full bg-[#dce9eb] px-3 py-1.5 text-xs font-semibold text-[#647f87] shadow-sm">
            Learn in Keelung
          </span>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-[#A98262]' : 'w-2 bg-[#CDBB9D]'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
