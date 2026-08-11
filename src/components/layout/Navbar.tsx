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
    <nav ref={navRef} className="sticky top-0 z-50 border-b border-amber-100 bg-[#fffaf0]/95 backdrop-blur-sm">
      <div className="container-school">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-sky-500 shadow-sm">
              <Globe size={18} className="text-white" strokeWidth={2.5} />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-400 ring-2 ring-[#fffaf0]" aria-hidden="true" />
            </div>
            <span className="hidden leading-tight sm:block">
              <span className="block text-[11px] font-bold tracking-[0.18em] text-sky-600">
                KEELUNG · ENGLISH
              </span>
              <span className="block font-black text-slate-800">
                {locale === 'zh-TW' ? '基隆市英語資源中心' : 'Keelung City English Resource Center'}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navEntries.map((entry, i) =>
              entry.type === 'link' ? (
                <Link
                  key={entry.href}
                  href={entry.href as any}
                  className="rounded-full px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
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
                    className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
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
                      className="absolute left-0 top-full mt-2 w-48 rounded-2xl border border-amber-100 bg-white py-1 shadow-lg z-50"
                    >
                      {entry.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href as any}
                          role="menuitem"
                          onClick={() => setOpenGroup(null)}
                          className="block px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
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
            <button
              onClick={toggleLocale}
              className="ml-2 flex items-center gap-1 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold text-sky-700 transition-colors hover:bg-sky-50"
            >
              {locale === 'zh-TW' ? '中 / EN' : 'EN / 中'}
            </button>
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <FontSizeAdjuster />
            <button onClick={toggleLocale} className="p-2 text-slate-600">
              <Globe size={18} />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? '關閉選單' : '開啟選單'}
              className="rounded-full p-2 text-slate-600 hover:bg-sky-50"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden border-t border-amber-100 py-3">
            {navEntries.map((entry, i) =>
              entry.type === 'link' ? (
                <Link
                  key={entry.href}
                  href={entry.href as any}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-4 py-2 text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                >
                  {entry.label}
                </Link>
              ) : (
                <div key={entry.label}>
                  <button
                    type="button"
                    aria-expanded={openMobileGroup === i}
                    onClick={() => setOpenMobileGroup(openMobileGroup === i ? null : i)}
                    className="w-full flex items-center justify-between rounded-lg px-4 py-2 text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                  >
                    {entry.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${openMobileGroup === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openMobileGroup === i && (
                    <div className="bg-amber-50/60 rounded-lg mx-2">
                      {entry.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href as any}
                          onClick={() => setIsOpen(false)}
                          className="block px-8 py-2 text-sm text-slate-600 hover:text-sky-700"
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
