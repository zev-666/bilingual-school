'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { Menu, X, Globe, ChevronDown } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
import Logo from './Logo'
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

  useEffect(() => {
    setIsOpen(false)
    setOpenGroup(null)
    setOpenMobileGroup(null)
  }, [pathname])

  return (
    <nav ref={navRef} className="sticky top-0 z-50 border-b border-line/80 bg-cream/90 backdrop-blur">
      <div className="container-school">
        <div className="flex h-[76px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FBDCB3]">
            <span className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coYellow to-coOrange shadow-[0_6px_16px_rgba(242,153,74,0.4)]">
              <Logo size={32} priority />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block font-heading text-[1.02rem] font-bold text-[#5A4232]">
                {locale === 'zh-TW' ? '基隆市英語資源中心' : 'Keelung City English Education Resource Center'}
              </span>
              <span className="block text-[0.66rem] font-semibold tracking-[0.08em] text-inkFaint">
                {locale === 'zh-TW' ? 'Keelung City English Education Resource Center' : '基隆市英語資源中心'}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {navEntries.map((entry, i) =>
              entry.type === 'link' ? (
                <Link
                  key={entry.href}
                  href={entry.href as any}
                  className="whitespace-nowrap rounded-full px-3.5 py-2 text-[0.9rem] font-semibold text-[#6B5747] transition-colors hover:bg-[#FFF1E0] hover:text-orangeDeep"
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
                    className="flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-[0.9rem] font-semibold text-[#6B5747] transition-colors hover:bg-[#FFF1E0] hover:text-orangeDeep focus:outline-none focus:ring-2 focus:ring-[#FBDCB3]"
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
                      className="absolute left-0 top-full z-50 mt-2 w-48 rounded-2xl border border-line bg-white py-1 shadow-card"
                    >
                      {entry.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href as any}
                          role="menuitem"
                          onClick={() => setOpenGroup(null)}
                          className="block px-4 py-2 text-sm text-[#6B5747] transition-colors hover:bg-[#FFF1E0] hover:text-orangeDeep"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}

            <div className="ml-3 flex items-center gap-2 border-l border-line pl-3">
              <SearchBar locale={locale} />
              <FontSizeAdjuster />
              <button
                onClick={toggleLocale}
                className="rounded-full border border-line bg-white px-3 py-2 text-xs font-bold tracking-widest text-orangeDeep transition hover:border-[#FBDCB3] hover:bg-[#FFF1E0]"
              >
                {locale === 'zh-TW' ? 'EN / 中' : '中 / EN'}
              </button>
              <Link
                href="/contact"
                className="rounded-full bg-coOrange px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(242,153,74,0.35)] transition hover:-translate-y-0.5 hover:bg-orangeDark"
              >
                {locale === 'zh-TW' ? '找我們聊聊 →' : 'Get in touch →'}
              </Link>
            </div>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <FontSizeAdjuster />
            <button onClick={toggleLocale} className="p-2 text-[#6B5747]">
              <Globe size={18} />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? '關閉選單' : '開啟選單'}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#FBDCB3] bg-[#FFF1E0] text-orangeDeep"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-line bg-[#FFFDF8] py-3 lg:hidden">
            {navEntries.map((entry, i) =>
              entry.type === 'link' ? (
                <Link
                  key={entry.href}
                  href={entry.href as any}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-xl px-3 py-3 text-[0.95rem] font-semibold text-[#6B5747] hover:bg-[#FFF1E0] hover:text-orangeDeep"
                >
                  {entry.label}
                </Link>
              ) : (
                <div key={entry.label}>
                  <button
                    type="button"
                    aria-expanded={openMobileGroup === i}
                    onClick={() => setOpenMobileGroup(openMobileGroup === i ? null : i)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-[0.95rem] font-semibold text-[#6B5747] hover:bg-[#FFF1E0] hover:text-orangeDeep"
                  >
                    {entry.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${openMobileGroup === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openMobileGroup === i && (
                    <div className="mx-2 rounded-xl bg-[#FFF1E0]/60">
                      {entry.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href as any}
                          onClick={() => setIsOpen(false)}
                          className="block px-6 py-2 text-sm text-[#6B5747] hover:text-orangeDeep"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
            <button
              onClick={toggleLocale}
              className="mt-2 border-t border-line px-3 py-4 text-left text-sm font-bold text-orangeDeep"
            >
              中 / EN
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
