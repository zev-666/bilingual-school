'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Sparkles as SparklesIcon, ArrowDown } from 'lucide-react'

interface Banner { titleZh: string; titleEn: string; subtitleZh?: string | null; subtitleEn?: string | null; imageUrl: string; linkUrl?: string | null }

// 預覽稿 hero 背景：兩個 radial 光斑 + 淺杏線性漸層（數值原封不動搬入）
const HERO_BG = {
  background:
    'radial-gradient(900px 440px at 88% -10%, rgba(255, 217, 125, 0.55), transparent 65%),' +
    'radial-gradient(720px 420px at -8% 30%, rgba(200, 240, 220, 0.6), transparent 60%),' +
    'linear-gradient(180deg, #FFF8EC 0%, #FFF3E2 100%)',
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
    <section className="relative overflow-hidden pb-[140px] pt-24 lg:pt-24" style={HERO_BG}>
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* 左側文字 */}
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#F6DFB8] bg-white px-4 py-1.5 text-[0.8rem] font-bold text-orangeDeep shadow-[0_6px_16px_rgba(178,122,66,0.1)]">
            <SparklesIcon size={14} aria-hidden="true" />
            {t('badge')}
          </span>
          <h1 className="mt-6 text-[clamp(2.2rem,4.6vw,3.6rem)] font-extrabold leading-[1.24] text-[#53371F]">
            {titleParts ? (
              <>
                {titleParts[0]}
                <br />
                <span className="relative text-orangeDeep after:absolute after:bottom-[6px] after:left-0 after:right-0 after:-z-10 after:h-3 after:rounded-lg after:bg-coYellow/60">
                  {highlight}
                </span>
                <br />
                {titleParts[1]}
              </>
            ) : (
              title
            )}
          </h1>
          {subtitle ? (
            <p className="mt-5 max-w-[540px] text-[1.06rem] leading-[1.9] text-[#8A7462]">{subtitle}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[0.95rem] font-bold text-orangeDeep shadow-[0_10px_24px_rgba(160,100,40,0.22)] transition hover:-translate-y-0.5"
            >
              {t('cta_primary')}
              <ArrowDown size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/documents"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#FBDCB3] bg-white px-6 py-3 text-[0.9rem] font-bold text-orangeDeep transition hover:-translate-y-0.5 hover:bg-[#FFF1E0]"
            >
              {locale === 'zh-TW' ? '外師協同教學申請' : 'Apply for Co-teaching'}
            </Link>
          </div>
          <p className="mt-7 flex items-center gap-2 text-[0.84rem] text-inkSoft">
            🏫 {locale === 'zh-TW' ? '服務全基隆市 50 所國民中小學' : 'Serving all 50 schools in Keelung'}
          </p>
        </div>

        {/* 右側插畫組合（桌面版） */}
        <div className="relative hidden h-[460px] lg:block" aria-hidden="true">
          <div className="absolute left-[20px] top-[30px] h-[330px] w-[330px] rounded-[60%_40%_55%_45%/50%_55%_45%_50%] bg-[linear-gradient(150deg,#FFE3B8,#FFC98A)] shadow-[inset_-18px_-16px_40px_rgba(255,255,255,0.35)] motion-safe:animate-[floatBlob_7s_ease-in-out_infinite]" />
          <div
            className="absolute bottom-0 right-[10px] h-[220px] w-[220px] rounded-[60%_40%_55%_45%/50%_55%_45%_50%] bg-[linear-gradient(150deg,#DDF3E7,#B7E3CE)] motion-safe:animate-[floatBlob_7s_ease-in-out_infinite]"
            style={{ animationDelay: '1.5s' }}
          />
          <div className="absolute right-[40px] top-[34px] flex items-center gap-2 rounded-[20px] border border-[#F4E3C6] bg-white px-4 py-3 text-[0.8rem] font-bold text-[#6B5747] shadow-card motion-safe:animate-[floatChip_5s_ease-in-out_infinite]">
            🌍 Learn in Keelung
          </div>
          <div
            className="absolute bottom-[70px] left-0 flex items-center gap-2 rounded-[20px] border border-[#F4E3C6] bg-white px-4 py-3 text-[0.8rem] font-bold text-[#6B5747] shadow-card motion-safe:animate-[floatChip_6s_ease-in-out_infinite]"
            style={{ animationDelay: '0.8s' }}
          >
            📖 Bilingual Everywhere
          </div>
          <div
            className="absolute bottom-[6px] right-[60px] flex items-center gap-2 rounded-[20px] border border-[#F4E3C6] bg-white px-4 py-3 text-[0.8rem] font-bold text-[#6B5747] shadow-card motion-safe:animate-[floatChip_5.5s_ease-in-out_infinite]"
            style={{ animationDelay: '1.6s' }}
          >
            💛 Grow with Confidence
          </div>
          <div className="absolute -left-[6px] top-[120px] flex h-[70px] w-[70px] items-center justify-center rounded-full bg-white text-2xl shadow-card">🦉</div>
          <div className="absolute right-0 top-[240px] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-white text-xl shadow-card">🎈</div>
        </div>
      </div>

      {/* 插畫組合（手機版精簡） */}
      <div className="relative mx-auto mt-10 h-[340px] w-full max-w-[520px] lg:hidden" aria-hidden="true">
        <div className="absolute left-0 top-[20px] h-[260px] w-[260px] rounded-[60%_40%_55%_45%/50%_55%_45%_50%] bg-[linear-gradient(150deg,#FFE3B8,#FFC98A)] motion-safe:animate-[floatBlob_7s_ease-in-out_infinite]" />
        <div
          className="absolute bottom-[20px] right-0 h-[170px] w-[170px] rounded-[60%_40%_55%_45%/50%_55%_45%_50%] bg-[linear-gradient(150deg,#DDF3E7,#B7E3CE)] motion-safe:animate-[floatBlob_7s_ease-in-out_infinite]"
          style={{ animationDelay: '1.5s' }}
        />
        <div className="absolute right-[10px] top-[10px] flex items-center gap-2 rounded-[20px] border border-[#F4E3C6] bg-white px-4 py-3 text-[0.8rem] font-bold text-[#6B5747] shadow-card motion-safe:animate-[floatChip_5s_ease-in-out_infinite]">
          🌍 Learn in Keelung
        </div>
        <div className="absolute bottom-[40px] left-0 flex items-center gap-2 rounded-[20px] border border-[#F4E3C6] bg-white px-4 py-3 text-[0.8rem] font-bold text-[#6B5747] shadow-card motion-safe:animate-[floatChip_6s_ease-in-out_infinite]">
          📖 Bilingual Everywhere
        </div>
      </div>

      {/* 底部波浪分隔線 */}
      <div className="absolute -bottom-px left-0 z-[1] w-full leading-none">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="block h-[90px] w-full">
          <path fill="#ffffff" d="M0,50 C240,90 480,10 720,40 C960,70 1200,20 1440,55 L1440,90 L0,90 Z" />
        </svg>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-orangeDeep' : 'w-2 bg-orangeDeep/30'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
