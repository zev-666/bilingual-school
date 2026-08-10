'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { Menu, X, Globe, ChevronDown } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
import SearchBar from './SearchBar'
import FontSizeAdjuster from './FontSizeAdjuster'

type NavItem = { href: string; label: string }
type NavEntry =
  | { type: 'link'; href: string; label: string }
  | { type: 'group'; label: string; items: NavItem[] }

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<number | null>(null)
  const [openMobileGroup, setOpenMobileGroup] = useState<number | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  // 7 大類架構第一階段：只納入已有實際頁面的類別，
  // 「雙語教學推動」「教師研習與專業發展」等尚無內容的類別待 Phase 2 補上頁面後再加入選單。
  const navEntries: NavEntry[] = [
    { type: 'link', href: '/', label: t('home') },
    {
      type: 'group',
      label: t('groups.about'),
      items: [
        { href: '/about', label: t('about') },
        { href: '/news', label: t('news') },
        { href: '/calendar', label: t('calendar') },
        { href: '/teachers', label: t('teachers') },
        { href: '/admission', label: t('admission') },
        { href: '/contact', label: t('contact') },
      ],
    },
    { type: 'link', href: '/documents', label: t('documents') },
    {
      type: 'group',
      label: t('groups.activities'),
      items: [
        { href: '/albums', label: t('albums') },
        { href: '/videos', label: t('videos') },
      ],
    },
  ]

  const toggleLocale = () => {
    const next = locale === 'zh-TW' ? 'en' : 'zh-TW'
    router.replace(pathname, { locale: next })
  }

  // Click-outside to close an open desktop dropdown
  useEffect(() => {
    if (openGroup === null) return
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenGroup(null)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [openGroup])

  // Close mobile menu / dropdowns on route change
  useEffect(() => {
    setIsOpen(false)
    setOpenGroup(null)
    setOpenMobileGroup(null)
  }, [pathname])

  return (
    <nav ref={navRef} className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="container-school">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-800 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-tight">K</span>
            </div>
            <span className="font-bold text-gray-900 leading-tight hidden sm:block">
              {locale === 'zh-TW' ? '基隆市英語資源中心' : 'Keelung City English Resource Center'}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navEntries.map((entry, i) =>
              entry.type === 'link' ? (
                <Link
                  key={entry.href}
                  href={entry.href as any}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                >
                  {entry.label}
                </Link>
              ) : (
                <div key={entry.label} className="relative">
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={openGroup === i}
                    onClick={() => setOpenGroup(openGroup === i ? null : i)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {entry.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${openGroup === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openGroup === i && (
                    <div
                      role="menu"
                      className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                    >
                      {entry.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href as any}
                          role="menuitem"
                          onClick={() => setOpenGroup(null)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
            <SearchBar locale={locale} />
            <FontSizeAdjuster />
            <button onClick={toggleLocale} className="ml-2 flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-700 border border-gray-300 rounded-md transition-colors">
              <Globe size={14} />
              {locale === 'zh-TW' ? 'EN' : '中'}
            </button>
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <FontSizeAdjuster />
            <button onClick={toggleLocale} className="p-2 text-gray-600">
              <Globe size={18} />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? '關閉選單' : '開啟選單'}
              className="p-2 text-gray-600"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden border-t border-gray-100 py-3">
            {navEntries.map((entry, i) =>
              entry.type === 'link' ? (
                <Link
                  key={entry.href}
                  href={entry.href as any}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                >
                  {entry.label}
                </Link>
              ) : (
                <div key={entry.label}>
                  <button
                    type="button"
                    aria-expanded={openMobileGroup === i}
                    onClick={() => setOpenMobileGroup(openMobileGroup === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                  >
                    {entry.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${openMobileGroup === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openMobileGroup === i && (
                    <div className="bg-gray-50">
                      {entry.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href as any}
                          onClick={() => setIsOpen(false)}
                          className="block px-8 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
