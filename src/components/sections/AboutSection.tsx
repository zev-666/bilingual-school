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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h2>
            <p className="text-gray-500 mb-4">{t('subtitle')}</p>
            <p className="text-gray-600 leading-relaxed mb-6">{t('description')}</p>
            <div className="space-y-4 mb-8">
              {[
                { icon: BookOpen, text: locale === 'zh-TW' ? '多元課程設計' : 'Diverse Curriculum' },
                { icon: Globe, text: locale === 'zh-TW' ? '國際視野培育' : 'Global Perspective' },
                { icon: Heart, text: locale === 'zh-TW' ? '品格教育重視' : 'Character Education' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-primary-600" />
                  </div>
                  <span className="text-gray-700">{text}</span>
                </div>
              ))}
            </div>
            <Link href="/about" className="btn-primary">
              {t('learn_more')} <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl h-80 flex items-center justify-center">
            <div className="text-center text-primary-700">
              <div className="text-6xl font-bold mb-2">雙語</div>
              <div className="text-lg">Bilingual Education</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
