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
    <nav ref={navRef} className="sticky top-0 z-50 border-b border-[#D7E3EF]/80 bg-white/95 backdrop-blur">
      <div className="container-school">
        <div className="flex h-[72px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#85B7EB]">
            <Logo size={40} priority />
            <span className="hidden leading-tight sm:block">
              <span className="block font-bold text-[#0F2A4A]">
                {locale === 'zh-TW' ? '基隆市英語資源中心' : 'Keelung City English Resource Center'}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex lg:items-center lg:gap-6">
            {navEntries.map((entry, i) =>
              entry.type === 'link' ? (
                <Link
                  key={entry.href}
                  href={entry.href as any}
                  className="py-3 text-sm font-medium text-[#33526D] transition hover:text-[#185FA5]"
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
                    className="flex items-center gap-1 py-3 text-sm font-medium text-[#33526D] transition hover:text-[#185FA5] focus:outline-none focus:ring-2 focus:ring-[#85B7EB] rounded"
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
                      className="absolute left-0 top-full mt-2 w-48 rounded-2xl border border-[#D7E3EF] bg-white py-1 shadow-[0_16px_35px_rgba(24,95,165,.13)] z-50"
                    >
                      {entry.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href as any}
                          role="menuitem"
                          onClick={() => setOpenGroup(null)}
                          className="block px-4 py-2 text-sm text-[#33526D] transition-colors hover:bg-[#E6F1FB] hover:text-[#185FA5]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}

            <div className="flex items-center gap-2 border-l border-[#D7E3EF] pl-4">
              <SearchBar locale={locale} />
              <FontSizeAdjuster />
              <button
                onClick={toggleLocale}
                className="rounded-full border border-[#B5D4F4] px-3 py-2 text-xs font-semibold tracking-widest text-[#185FA5] transition hover:bg-[#E6F1FB]"
              >
                {locale === 'zh-TW' ? 'EN / 中' : '中 / EN'}
              </button>
              <Link
                href="/contact"
                className="rounded-full bg-[#185FA5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0C447C]"
              >
                {locale === 'zh-TW' ? '找我們聊聊 →' : 'Get in touch →'}
              </Link>
            </div>
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <FontSizeAdjuster />
            <button onClick={toggleLocale} className="p-2 text-[#33526D]">
              <Globe size={18} />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? '關閉選單' : '開啟選單'}
              className="rounded-xl border border-[#B5D4F4] bg-[#E6F1FB] p-2 text-[#185FA5]"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden border-t border-[#D7E3EF] bg-white py-3">
            {navEntries.map((entry, i) =>
              entry.type === 'link' ? (
                <Link
                  key={entry.href}
                  href={entry.href as any}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-xl px-3 py-3 font-medium text-[#33526D] hover:bg-[#E6F1FB] hover:text-[#185FA5]"
                >
                  {entry.label}
                </Link>
              ) : (
                <div key={entry.label}>
                  <button
                    type="button"
                    aria-expanded={openMobileGroup === i}
                    onClick={() => setOpenMobileGroup(openMobileGroup === i ? null : i)}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-3 font-medium text-[#33526D] hover:bg-[#E6F1FB] hover:text-[#185FA5]"
                  >
                    {entry.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${openMobileGroup === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openMobileGroup === i && (
                    <div className="mx-2 rounded-xl bg-[#E6F1FB]/60">
                      {entry.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href as any}
                          onClick={() => setIsOpen(false)}
                          className="block px-6 py-2 text-sm text-[#33526D] hover:text-[#185FA5]"
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
              className="mt-2 border-t border-[#D7E3EF] px-3 py-4 text-left text-sm font-semibold text-[#185FA5]"
            >
              中 / EN
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
