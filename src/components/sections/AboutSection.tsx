import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight, BookOpen, Globe, Heart } from 'lucide-react'

export default function AboutSection({ locale }: { locale: string }) {
  const t = useTranslations('home.about')

  return (
    <section className="section-padding">
      <div className="container-school">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">{t('title')}</h2>
            <p className="text-gray-500 mb-4">{t('subtitle')}</p>
            <p className="text-gray-600 leading-relaxed mb-6">{t('description')}</p>
            <div className="space-y-4 mb-8">
              {[
                { icon: BookOpen, text: locale === 'zh-TW' ? '教學資源共享' : 'Shared Teaching Resources' },
                { icon: Globe, text: locale === 'zh-TW' ? '外師交流合作' : 'Foreign Teacher Collaboration' },
                { icon: Heart, text: locale === 'zh-TW' ? '專業研習支持' : 'Professional Development Support' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-primary-700" />
                  </div>
                  <span className="text-gray-700">{text}</span>
                </div>
              ))}
            </div>
            <Link href="/about" className="btn-primary">
              {t('learn_more')} <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg h-80 flex items-center justify-center border border-primary-200">
            <div className="text-center text-primary-800">
              <div className="text-5xl font-bold mb-2 tracking-tight">ERC</div>
              <div className="text-lg">{locale === 'zh-TW' ? '英語資源中心' : 'English Resource Center'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
