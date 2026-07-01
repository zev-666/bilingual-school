'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
    <section className="relative min-h-[600px] bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,white,transparent_70%)]" />

      <div className="container-school relative z-10 py-20">
        <div className="max-w-3xl">
          <span className="inline-block mb-4 px-4 py-1.5 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm">
            {t('badge')}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-primary-100 mb-8 leading-relaxed">{subtitle}</p>
          )}
          <div className="flex flex-wrap gap-4">
            <Link href="/about" className="btn-primary bg-white text-primary-700 hover:bg-primary-50">
              {t('cta_primary')}
            </Link>
            <Link href="/admission" className="btn-secondary border-white text-white hover:bg-white/10">
              {t('cta_secondary')}
            </Link>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
