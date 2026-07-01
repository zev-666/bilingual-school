'use client'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { Menu, X, Globe } from 'lucide-react'
import { useRouter } from '@/i18n/routing'

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/news', label: t('news') },
    { href: '/albums', label: t('albums') },
    { href: '/videos', label: t('videos') },
    { href: '/documents', label: t('documents') },
    { href: '/teachers', label: t('teachers') },
    { href: '/about', label: t('about') },
    { href: '/admission', label: t('admission') },
    { href: '/contact', label: t('contact') },
  ]

  const toggleLocale = () => {
    const next = locale === 'zh-TW' ? 'en' : 'zh-TW'
    router.replace(pathname, { locale: next })
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="container-school">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">雙</span>
            </div>
            <span className="font-bold text-gray-900 hidden sm:block">
              {locale === 'zh-TW' ? '雙語實驗學校' : 'Bilingual School'}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                className="px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button onClick={toggleLocale} className="ml-2 flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-primary-600 border border-gray-200 rounded-lg transition-colors">
              <Globe size={14} />
              {locale === 'zh-TW' ? 'EN' : '中'}
            </button>
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <button onClick={toggleLocale} className="p-2 text-gray-600">
              <Globe size={18} />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600">
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden border-t border-gray-100 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
