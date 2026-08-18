import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight, BookOpen, Globe, Heart } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'

const FEATURE_STYLES = [
  { bg: 'bg-[#FFF3EE]', icon: 'text-[#C34E24]' },
  { bg: 'bg-[#E8F6EF]', icon: 'text-[#2E7A57]' },
  { bg: 'bg-[#FEF9C3]', icon: 'text-[#B45309]' },
]

export default function AboutSection({ locale }: { locale: string }) {
  const t = useTranslations('home.about')

  const features = [
    { icon: BookOpen, text: locale === 'zh-TW' ? '教學資源共享' : 'Shared Teaching Resources' },
    { icon: Globe, text: locale === 'zh-TW' ? '外師交流合作' : 'Foreign Teacher Collaboration' },
    { icon: Heart, text: locale === 'zh-TW' ? '專業研習支持' : 'Professional Development Support' },
  ]

  return (
    <section className="bg-[#E8F6EF] px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#C34E24]">ABOUT US</p>
              <h2 className="mb-4 text-3xl font-bold text-[#2D241E] sm:text-4xl">{t('title')}</h2>
              <p className="mb-4 text-[#6E6259]">{t('subtitle')}</p>
              <p className="mb-8 leading-relaxed text-[#6E6259]">{t('description')}</p>
              <div className="mb-8 space-y-4">
                {features.map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#FFE1D3] bg-[#FFF3EE]">
                      <Icon size={16} className="text-[#C34E24]" />
                    </div>
                    <span className="text-[#2D241E]">{text}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#C34E24] hover:gap-3"
              >
                {t('learn_more')} <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-3">
            {features.map(({ icon: Icon }, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div
                  className={`rounded-[1.5rem] border border-[#EFE9E1] ${FEATURE_STYLES[i % FEATURE_STYLES.length].bg} p-5 ${i === 0 ? 'sm:mt-8' : i === 2 ? 'sm:mt-16' : ''}`}
                >
                  <Icon size={32} strokeWidth={1.4} className={`mb-8 ${FEATURE_STYLES[i % FEATURE_STYLES.length].icon}`} />
                  <h3 className="font-bold text-[#2D241E]">
                    {i === 0 ? (locale === 'zh-TW' ? '教學共備' : 'Co-planning') : i === 1 ? (locale === 'zh-TW' ? '閱讀資源' : 'Reading') : (locale === 'zh-TW' ? '跨校連結' : 'Network')}
                  </h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
