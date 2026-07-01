'use client'

// src/components/sections/HeroSection.tsx
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight, Play } from 'lucide-react'
import { Link as IntlLink } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import type { BannerSlide } from '@prisma/client'

// Default slides for when DB is empty
const DEFAULT_SLIDES = [
  {
    id: '1',
    titleZh: '培育雙語人才',
    titleEn: 'Cultivating Bilingual Leaders',
    subtitleZh: '卓越教育，成就未來',
    subtitleEn: 'Excellence in Education, Shaping Tomorrow',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80',
    linkUrl: '/admission',
    linkTextZh: '了解招生資訊',
    linkTextEn: 'Explore Admissions',
    isActive: true,
    sortOrder: 0,
  },
  {
    id: '2',
    titleZh: '世界級學習環境',
    titleEn: 'World-Class Learning Environment',
    subtitleZh: '現代設施，激發無限潛能',
    subtitleEn: 'Modern Facilities, Unlimited Potential',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80',
    linkUrl: '/about',
    linkTextZh: '了解更多',
    linkTextEn: 'Learn More',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: '3',
    titleZh: '豐富課外活動',
    titleEn: 'Rich Extracurricular Activities',
    subtitleZh: '全人發展，綻放生命光彩',
    subtitleEn: 'Holistic Development, Brilliant Lives',
    imageUrl: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1920&q=80',
    linkUrl: '/albums',
    linkTextZh: '查看相簿',
    linkTextEn: 'View Albums',
    isActive: true,
    sortOrder: 2,
  },
]

interface HeroSectionProps {
  locale: string
  slides?: Partial<BannerSlide>[]
}

export default function HeroSection({ locale, slides = [] }: HeroSectionProps) {
  const t = useTranslations('home.hero')
  const displaySlides = slides.length > 0 ? slides : DEFAULT_SLIDES
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const isZh = locale === 'zh-TW'

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % displaySlides.length)
  }, [displaySlides.length])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + displaySlides.length) % displaySlides.length)
  }, [displaySlides.length])

  // Auto-advance carousel
  useEffect(() => {
    if (isPaused || displaySlides.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, isPaused, displaySlides.length])

  const slide = displaySlides[current]
  const title = isZh ? (slide as any).titleZh : (slide as any).titleEn
  const subtitle = isZh ? (slide as any).subtitleZh : (slide as any).subtitleEn
  const linkText = isZh ? (slide as any).linkTextZh : (slide as any).linkTextEn

  return (
    <section
      className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden"
      aria-label={isZh ? '首頁橫幅' : 'Hero banner'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={(slide as any).imageUrl}
            alt={title ?? ''}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full container-school flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl text-white"
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              bg-white/15 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {t('badge')}
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              {title}
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-light mb-8">
              {subtitle}
            </p>

            <div className="flex flex-wrap gap-4">
              {(slide as any).linkUrl && (
                <IntlLink
                  href={(slide as any).linkUrl as '/'}
                  className="btn-primary text-base"
                >
                  {linkText}
                  <ArrowRight size={18} aria-hidden="true" />
                </IntlLink>
              )}
              <IntlLink
                href="/videos"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium
                  bg-white/10 backdrop-blur-sm border border-white/20 text-white
                  hover:bg-white/20 transition-all duration-200"
              >
                <Play size={18} aria-hidden="true" />
                {isZh ? '觀看影片' : 'Watch Video'}
              </IntlLink>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      {displaySlides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
              bg-white/10 backdrop-blur-sm border border-white/20 text-white
              flex items-center justify-center hover:bg-white/20 transition-all"
            aria-label={isZh ? '上一張' : 'Previous slide'}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
              bg-white/10 backdrop-blur-sm border border-white/20 text-white
              flex items-center justify-center hover:bg-white/20 transition-all"
            aria-label={isZh ? '下一張' : 'Next slide'}
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {displaySlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'transition-all duration-300 rounded-full',
                  i === current
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                )}
                aria-label={`${isZh ? '前往第' : 'Go to slide'} ${i + 1}`}
                aria-pressed={i === current}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
