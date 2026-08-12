import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight, BookOpen, Globe, Heart } from 'lucide-react'

const FEATURE_STYLES = [
  { bg: 'bg-sky-100', text: 'text-sky-600' },
  { bg: 'bg-amber-100', text: 'text-amber-600' },
  { bg: 'bg-rose-100', text: 'text-rose-600' },
]

export default function AboutSection({ locale }: { locale: string }) {
  const t = useTranslations('home.about')

  const features = [
    { icon: BookOpen, text: locale === 'zh-TW' ? '教學資源共享' : 'Shared Teaching Resources' },
    { icon: Globe, text: locale === 'zh-TW' ? '外師交流合作' : 'Foreign Teacher Collaboration' },
    { icon: Heart, text: locale === 'zh-TW' ? '專業研習支持' : 'Professional Development Support' },
  ]

  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-sky-600">
              ABOUT US
            </p>
            <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{t('title')}</h2>
            <p className="mb-4 text-slate-500">{t('subtitle')}</p>
            <p className="mb-8 leading-relaxed text-slate-600">{t('description')}</p>
            <div className="mb-8 space-y-4">
              {features.map(({ icon: Icon, text }, i) => {
                const style = FEATURE_STYLES[i % FEATURE_STYLES.length]
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${style.bg}`}>
                      <Icon size={16} className={style.text} />
                    </div>
                    <span className="text-slate-700">{text}</span>
                  </div>
                )
              })}
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-sky-600"
            >
              {t('learn_more')} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-100 via-amber-50 to-amber-100">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/50" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-sky-200/50" aria-hidden="true" />
            <div className="relative z-10 text-center text-slate-800">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                <Globe size={30} className="text-sky-500" />
              </div>
              <div className="mb-1 text-5xl font-black tracking-tight">ERC</div>
              <div className="text-lg font-bold">{locale === 'zh-TW' ? '英語資源中心' : 'English Resource Center'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
