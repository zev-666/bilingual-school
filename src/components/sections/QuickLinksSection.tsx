'use client'

// src/components/sections/QuickLinksSection.tsx
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { GraduationCap, Calendar, Phone, FileDown, ArrowRight } from 'lucide-react'
import { Link as IntlLink } from '@/i18n/routing'

interface QuickLinksSectionProps { locale: string }

const QUICK_LINKS = [
  { key: 'admission', href: '/admission', icon: GraduationCap, color: 'from-blue-500 to-blue-600' },
  { key: 'calendar',  href: '/documents', icon: Calendar,      color: 'from-green-500 to-green-600' },
  { key: 'contact',   href: '/contact',   icon: Phone,         color: 'from-orange-500 to-orange-600' },
  { key: 'documents', href: '/documents', icon: FileDown,      color: 'from-purple-500 to-purple-600' },
] as const

export default function QuickLinksSection({ locale }: QuickLinksSectionProps) {
  const t = useTranslations('home.quickLinks')
  const isZh = locale === 'zh-TW'

  return (
    <section className="section-padding bg-gray-900" aria-labelledby="quick-links-heading">
      <div className="container-school">
        <div className="text-center mb-12">
          <h2 id="quick-links-heading" className="text-3xl font-bold text-white mb-3">
            {t('title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map(({ key, href, icon: Icon, color }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <IntlLink
                href={href}
                className="group flex flex-col items-center gap-4 p-8 rounded-2xl
                  bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600
                  transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color}
                  flex items-center justify-center shadow-lg`}>
                  <Icon size={26} className="text-white" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-white font-semibold block mb-1">{t(key)}</span>
                  <span className="text-gray-400 text-xs flex items-center justify-center gap-1
                    group-hover:text-gray-300 transition-colors">
                    {isZh ? '了解更多' : 'Learn more'}
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </span>
                </div>
              </IntlLink>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
