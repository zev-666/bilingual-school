'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Sparkles, GraduationCap, BookOpen, ArrowRight, ChevronDown, Plus } from 'lucide-react'

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
    <section className="relative flex items-center overflow-hidden bg-gradient-to-br from-sky-500 via-sky-400 to-amber-200">
      {/* 裝飾元素：右上白色 + 圖示，散落浮動 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <Plus
          size={28}
          strokeWidth={3}
          className="absolute right-[6%] top-[26%] text-white/80 motion-safe:animate-[float_8s_ease-in-out_infinite]"
        />
        <div className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 text-white/70 md:block motion-safe:animate-[float_6s_ease-in-out_infinite]">
          <ChevronDown size={26} />
        </div>
      </div>

      <div className="container-school relative z-10 grid gap-12 py-20 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        {/* 左側：文字內容 */}
        <div className="max-w-2xl motion-safe:animate-[fadeInUp_.6s_ease-out]">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-sky-800 shadow-sm backdrop-blur-sm">
            <Sparkles size={14} className="text-sky-600" aria-hidden="true" />
            {t('badge')}
          </span>
          <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mb-8 max-w-xl text-base leading-8 text-slate-700 md:text-lg">{subtitle}</p>
          )}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-transform duration-200 hover:scale-105 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
            >
              {t('cta_primary')}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/admission"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/80 bg-white/40 px-7 py-3.5 text-sm font-semibold text-slate-800 backdrop-blur-sm transition-transform duration-200 hover:scale-105 hover:bg-white/70 focus:outline-none focus:ring-4 focus:ring-white/60"
            >
              {t('cta_secondary')}
            </Link>
          </div>
        </div>

        {/* 右側：圓形插畫組合 */}
        <div className="relative mx-auto hidden aspect-square w-full max-w-md lg:block">
          {/* 外圈淡色光暈 */}
          <div className="absolute inset-0 rounded-full bg-white/25" />
          {/* 主圓形卡片 */}
          <div className="absolute inset-[10%] flex flex-col items-center justify-center rounded-full bg-amber-50 shadow-xl motion-safe:animate-[float_9s_ease-in-out_infinite]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 shadow-md">
              <GraduationCap size={30} className="text-slate-900" />
            </div>
            <p className="text-lg font-black leading-tight text-slate-800">
              {locale === 'zh-TW' ? '學習，從' : 'Learning starts'}
              <br />
              <span className="text-sky-600">{locale === 'zh-TW' ? '好奇開始' : 'with curiosity'}</span>
            </p>
            <span className="mt-3 h-1 w-10 rounded-full bg-amber-400" />
          </div>
          {/* 浮動小圓：書本圖示 */}
          <div className="absolute left-[6%] top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-rose-400 shadow-lg motion-safe:animate-[float_7s_ease-in-out_infinite_.5s]">
            <BookOpen size={22} className="text-white" />
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
              className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-slate-900' : 'w-2 bg-white/70'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
