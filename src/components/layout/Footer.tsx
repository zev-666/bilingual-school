'use client'

// src/components/layout/Footer.tsx
import { useTranslations, useLocale } from 'next-intl'
import { Link as IntlLink } from '@/i18n/routing'
import { Mail, Phone, MapPin, Facebook, Youtube, Instagram } from 'lucide-react'

const FOOTER_LINKS = [
  { href: '/news',      key: 'news' },
  { href: '/albums',    key: 'albums' },
  { href: '/videos',    key: 'videos' },
  { href: '/documents', key: 'documents' },
  { href: '/teachers',  key: 'teachers' },
  { href: '/about',     key: 'about' },
  { href: '/admission', key: 'admission' },
  { href: '/contact',   key: 'contact' },
] as const

export default function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const tContact = useTranslations('contact.info')
  const locale = useLocale()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-school py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                B
              </div>
              <span className="font-bold text-white text-lg">
                {locale === 'zh-TW' ? '雙語實驗學校' : 'Bilingual School'}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {t('description')}
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
                { icon: Youtube,  href: 'https://youtube.com',  label: 'YouTube' },
                { icon: Instagram,href: 'https://instagram.com',label: 'Instagram' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center
                    text-gray-400 hover:bg-primary-600 hover:text-white transition-colors"
                >
                  <Icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('links')}
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map(({ href, key }) => (
                <li key={key}>
                  <IntlLink
                    href={href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {tNav(key)}
                  </IntlLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('contact')}
            </h3>
            <ul className="space-y-3">
              {[
                { icon: MapPin, value: tContact('addressValue') },
                { icon: Phone,  value: tContact('phoneValue'),  href: `tel:${tContact('phoneValue').replace(/\D/g,'')}` },
                { icon: Mail,   value: tContact('emailValue'),  href: `mailto:${tContact('emailValue')}` },
              ].map(({ icon: Icon, value, href }) => (
                <li key={value} className="flex items-start gap-3">
                  <Icon size={16} className="text-primary-400 mt-0.5 shrink-0" aria-hidden="true" />
                  {href ? (
                    <a href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {value}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">{value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Map placeholder / newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('follow')}
            </h3>
            <div className="rounded-xl overflow-hidden bg-gray-800 h-32 flex items-center justify-center">
              <span className="text-xs text-gray-500">Google Maps</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row
          items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {currentYear} {locale === 'zh-TW' ? '雙語實驗學校' : 'Bilingual School'}. {t('rights')}.</p>
          <div className="flex gap-4">
            <IntlLink href="/privacy" className="hover:text-gray-300 transition-colors">
              {t('privacy')}
            </IntlLink>
            <IntlLink href="/terms" className="hover:text-gray-300 transition-colors">
              {t('terms')}
            </IntlLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
