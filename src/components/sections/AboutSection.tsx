'use client'

// src/components/sections/AboutSection.tsx
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Globe2, BookOpen, Users, Star } from 'lucide-react'
import Image from 'next/image'
import { Link as IntlLink } from '@/i18n/routing'

interface AboutSectionProps { locale: string }

const FEATURES = [
  { key: 'feature1', icon: Globe2 },
  { key: 'feature2', icon: BookOpen },
  { key: 'feature3', icon: Users },
  { key: 'feature4', icon: Star },
] as const

export default function AboutSection({ locale }: AboutSectionProps) {
  const t = useTranslations('home.about')
  const isZh = locale === 'zh-TW'

  return (
    <section className="section-padding" aria-labelledby="about-heading">
      <div className="container-school">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
              <Image
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80"
                alt={isZh ? '學校校園' : 'School campus'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Floating accent card */}
            <div className="absolute -bottom-6 -right-6 bg-primary-600 text-white
              rounded-2xl p-6 shadow-xl">
              <div className="text-3xl font-bold">25+</div>
              <div className="text-sm text-white/80 mt-1">
                {isZh ? '年辦學經驗' : 'Years of Excellence'}
              </div>
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-primary-600 font-medium text-sm uppercase tracking-wider mb-3">
              {isZh ? '關於我們' : 'About Us'}
            </p>
            <h2 id="about-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('title')}
            </h2>
            <p className="text-gray-500 text-lg mb-6">{t('subtitle')}</p>
            <p className="text-gray-600 leading-relaxed mb-8">{t('description')}</p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {FEATURES.map(({ key, icon: Icon }) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary-600" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{t(key)}</span>
                </div>
              ))}
            </div>

            <IntlLink href="/about" className="btn-primary">
              {isZh ? '了解更多' : 'Learn More'}
            </IntlLink>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
