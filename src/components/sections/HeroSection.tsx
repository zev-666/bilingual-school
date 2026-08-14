'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Globe, BookOpen, Sparkles as SparklesIcon, ArrowDown } from 'lucide-react'

interface Banner { titleZh: string; titleEn: string; subtitleZh?: string | null; subtitleEn?: string | null; imageUrl: string; linkUrl?: string | null }

const MESH_GRADIENT = {
  backgroundColor: '#2B5FE0',
  backgroundImage:
    'radial-gradient(at 15% 20%, #3F6FE8 0%, transparent 55%),' +
    'radial-gradient(at 55% 10%, #3FB6A8 0%, transparent 50%),' +
    'radial-gradient(at 88% 30%, #6FD0C0 0%, transparent 45%),' +
    'radial-gradient(at 90% 80%, #E2E87A 0%, transparent 55%),' +
    'radial-gradient(at 40% 95%, #4CC2B0 0%, transparent 50%)',
}

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
    <section className="relative isolate overflow-hidden" style={MESH_GRADIENT}>
      <div className="pointer-events-none absolute -right-16 top-10 h-72 w-72 rounded-[45%] rotate-6 bg-white/10 border border-white/20" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[18%] top-32 h-8 w-8 rounded-full bg-white/70" aria-hidden="true" />

      <div className="mx-auto grid min-h-[600px] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        {/* 左側文字 */}
        <div className="relative z-10 max-w-2xl motion-safe:animate-[fadeInUp_.6s_ease-out]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold tracking-wide text-[#0F2A4A]">
            <SparklesIcon size={14} aria-hidden="true" />
            {t('badge')}
          </div>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.25] tracking-tight text-white md:text-6xl">
            {titleParts ? (
              <>
                {titleParts[0]}
                <br />
                <span className="text-[#FDE68A]">{highlight}</span>
                <br />
                {titleParts[1]}
              </>
            ) : (
              title
            )}
          </h1>
          {subtitle && (
            <p className="mt-6 max-w-lg text-base leading-8 text-white/85 md:text-lg">{subtitle}</p>
          )}
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/about"
              className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#0F2A4A] shadow-[0_8px_24px_rgba(0,0,0,.18)] transition hover:bg-[#EAF2FF] focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              {t('cta_primary')}
              <ArrowDown size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* 右側插畫組合 */}
        <div className="relative mx-auto hidden h-[340px] w-full max-w-[440px] sm:h-[420px] lg:block">
          <div className="absolute inset-6 rotate-3 rounded-[42%] border border-white/30 bg-white/10 motion-safe:animate-[float_9s_ease-in-out_infinite]" />
          <div className="absolute left-1/2 top-1/2 flex h-56 w-56 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[42%] -rotate-3 border border-white/30 bg-white/15">
            <Globe size={80} strokeWidth={1.2} className="text-white" aria-hidden="true" />
            <span className="absolute -right-2 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-sm">
              <BookOpen size={20} aria-hidden="true" />
            </span>
            <span className="absolute -bottom-3 left-2 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-sm">
              <SparklesIcon size={20} aria-hidden="true" />
            </span>
          </div>
          <span className="absolute bottom-6 right-6 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#0F2A4A] shadow-sm">
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
              className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
