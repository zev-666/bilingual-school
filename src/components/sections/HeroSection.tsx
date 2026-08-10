'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

interface Banner { titleZh: string; titleEn: string; subtitleZh?: string | null; subtitleEn?: string | null; imageUrl: string; linkUrl?: string | null }

export default function HeroSection({ locale, banners }: { locale: string; banners: Banner[] }) {
  const t = useTranslations('home.hero')
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => setCurrent(p => (p + 1) % banners.length), 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  const title = banners[current]
    ? (locale === 'zh-TW' ? banners[current].titleZh : banners[current].titleEn)
    : t('title')
  const subtitle = banners[current]
    ? (locale === 'zh-TW' ? banners[current].subtitleZh : banners[current].subtitleEn)
    : t('subtitle')

  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden bg-gradient-to-b from-amber-50 to-white">
      {/* 裝飾色塊：天藍與暖黃交錯散落，遠看像貼紙拼貼 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-16 -right-10 h-72 w-72 rounded-full bg-sky-200 opacity-70 motion-safe:animate-[float_9s_ease-in-out_infinite]" />
        <div className="absolute -bottom-20 -left-14 h-64 w-64 rounded-full bg-amber-200 opacity-70 motion-safe:animate-[float_11s_ease-in-out_infinite_1s]" />
        <div className="absolute top-1/4 right-[18%] h-20 w-20 rotate-12 rounded-2xl bg-sky-300 opacity-60 motion-safe:animate-[float_7s_ease-in-out_infinite_.5s]" />
      </div>

      <div className="container-school relative z-10 py-20 md:py-28">
        <div className="max-w-3xl motion-safe:animate-[fadeInUp_.6s_ease-out]">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-primary-700 shadow-sm backdrop-blur-sm">
            <span aria-hidden="true">👋</span>
            {t('badge')}
          </span>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">{subtitle}</p>
          )}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full bg-primary-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-transform duration-200 hover:scale-105 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {t('cta_primary')}
            </Link>
            <Link
              href="/admission"
              className="inline-flex items-center justify-center rounded-full border-2 border-primary-500 bg-white/70 px-7 py-3.5 text-sm font-semibold text-primary-700 backdrop-blur-sm transition-transform duration-200 hover:scale-105 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {t('cta_secondary')}
            </Link>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-primary-500' : 'w-2 bg-primary-200'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}