'use client'

// src/components/layout/Navbar.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Menu, X, Globe, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Link as IntlLink, useRouter } from '@/i18n/routing'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { href: '/',           key: 'home' },
  { href: '/news',       key: 'news' },
  { href: '/albums',     key: 'albums' },
  { href: '/videos',     key: 'videos' },
  { href: '/documents',  key: 'documents' },
  { href: '/teachers',   key: 'teachers' },
  { href: '/about',      key: 'about' },
  { href: '/admission',  key: 'admission' },
  { href: '/contact',    key: 'contact' },
] as const

export default function Navbar() {
  const t = useTranslations('nav')
  const tLocale = useTranslations('locale')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  // Shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const switchLocale = (newLocale: string) => {
    // Remove current locale prefix from pathname and navigate
    const segments = pathname.split('/')
    const withoutLocale = segments.slice(2).join('/')
    router.push(`/${withoutLocale || ''}`, { locale: newLocale as 'zh-TW' | 'en' })
    setLangOpen(false)
  }

  const isActive = (href: string) => {
    const localePrefix = `/${locale}`
    const fullPath = href === '/' ? localePrefix : `${localePrefix}${href}`
    return pathname === fullPath
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white/80 backdrop-blur-sm'
      )}
    >
      <nav className="container-school" aria-label={t('home')}>
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <IntlLink href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center
              text-white font-bold text-lg group-hover:bg-primary-700 transition-colors">
              B
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">
              {locale === 'zh-TW' ? '雙語實驗學校' : 'Bilingual School'}
            </span>
          </IntlLink>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-1" role="list">
            {NAV_LINKS.slice(0, 7).map(({ href, key }) => (
              <li key={key}>
                <IntlLink
                  href={href}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                  aria-current={isActive(href) ? 'page' : undefined}
                >
                  {t(key)}
                </IntlLink>
              </li>
            ))}
          </ul>

          {/* Right side: Lang + CTA + Hamburger */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600
                  hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label={tLocale('switchTo')}
                aria-expanded={langOpen}
                aria-haspopup="true"
              >
                <Globe size={16} aria-hidden="true" />
                <span className="hidden sm:block">{locale === 'zh-TW' ? '中' : 'EN'}</span>
                <ChevronDown size={14} className={cn('transition-transform', langOpen && 'rotate-180')} aria-hidden="true" />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg
                      border border-gray-100 overflow-hidden"
                    role="menu"
                  >
                    {(['zh-TW', 'en'] as const).map((loc) => (
                      <button
                        key={loc}
                        onClick={() => switchLocale(loc)}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-sm transition-colors',
                          locale === loc
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                        role="menuitem"
                        aria-current={locale === loc ? 'true' : undefined}
                      >
                        {tLocale(loc)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA Button */}
            <IntlLink
              href="/admission"
              className="hidden md:inline-flex btn-primary text-sm px-4 py-2"
            >
              {t('admission')}
            </IntlLink>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label={mobileOpen ? t('closeMenu') : t('toggleMenu')}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-gray-100"
            >
              <ul className="py-3 space-y-1" role="list">
                {NAV_LINKS.map(({ href, key }) => (
                  <li key={key}>
                    <IntlLink
                      href={href}
                      className={cn(
                        'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive(href)
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                      aria-current={isActive(href) ? 'page' : undefined}
                    >
                      {t(key)}
                    </IntlLink>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Click-away to close lang dropdown */}
      {langOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setLangOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  )
}
