'use client'

// 全站頁首（2026/10 改版）：
//   第一列：LOGO＋站名｜搜尋、字級、語系、聯絡按鈕
//   第二列：完整目錄列（桌機 ≥1024px 顯示，滑鼠移入或點擊展開子選單）
//           入口頁 / 不顯示，進入 /home 與各內頁才顯示
// 校長要求「一進首頁就看得到目錄」，版型參考新竹縣英語教育資源中心：
// 第一層分類全部攤開、中英並列，子選單只放已存在的頁面（不放空的分類）。
//
// 無障礙：採 disclosure（展開按鈕）模式而非 role="menu"，
//   - 按鈕有 aria-expanded / aria-controls
//   - Escape 關閉並把焦點還給按鈕；焦點移出群組自動關閉；點擊外部關閉
//   - 目前所在分類標 aria-current，並有實色底標示

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { Menu, X, Globe, ChevronDown, ChevronRight } from 'lucide-react'
import Logo from './Logo'
import SearchBar from './SearchBar'
import FontSizeAdjuster from './FontSizeAdjuster'

type Href = string | { pathname: string; query?: Record<string, string> }
type NavItem = { href: Href; label: string }
type NavEntry = {
  key: string
  zh: string
  en: string
  /** 判斷「目前在這個分類」用的路徑前綴 */
  match: string[]
  href?: Href
  /** 指定語系（外師專區 → 英文版） */
  locale?: 'zh-TW' | 'en'
  items?: NavItem[]
}

export default function Navbar() {
  const t = useTranslations('nav')
  const td = useTranslations('documents.tabs')
  const locale = useLocale()
  const isZh = locale === 'zh-TW'
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navEntries: NavEntry[] = [
    { key: 'home', zh: '回首頁', en: 'Home', href: '/', match: [] },
    {
      key: 'about',
      zh: '關於本中心',
      en: 'About Us',
      match: ['/about', '/teachers', '/contact'],
      items: [
        { href: '/about', label: t('about') },
        { href: '/teachers', label: t('teachers') },
        { href: '/contact', label: t('contact') },
      ],
    },
    {
      key: 'news',
      zh: '最新消息',
      en: 'News & Events',
      match: ['/news', '/calendar'],
      items: [
        { href: '/news', label: t('news') },
        { href: '/calendar', label: t('calendar') },
      ],
    },
    {
      key: 'documents',
      zh: '文件下載',
      en: 'Downloads',
      match: ['/documents'],
      items: [
        { href: { pathname: '/documents', query: { tab: 'teaching' } }, label: td('teaching') },
        { href: { pathname: '/documents', query: { tab: 'admin' } }, label: td('admin') },
        { href: { pathname: '/documents', query: { tab: 'other' } }, label: td('other') },
      ],
    },
    {
      key: 'activities',
      zh: '活動花絮',
      en: 'Activities',
      match: ['/albums', '/videos'],
      items: [
        { href: '/albums', label: t('albums') },
        { href: '/videos', label: t('videos') },
      ],
    },
    {
      key: 'fet',
      zh: '外師專區',
      en: 'For Foreign Teachers',
      href: '/home',
      locale: 'en',
      match: [],
    },
  ]

  // 入口頁（/）只有三張分流大卡，不顯示目錄列；
  // 點「英語教學」或「外師專區」進入 /home 之後，目錄列才出現。
  const isPortal = pathname === '/'

  const isActive = (entry: NavEntry) => {
    // /home 是內容首頁：中文版標「回首頁」，英文版（外師專區進來的）標「外師專區」
    if (entry.key === 'home') return pathname === '/home' && isZh
    if (entry.key === 'fet') return pathname === '/home' && !isZh
    return entry.match.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  }

  const toggleLocale = () => {
    router.replace(pathname, { locale: isZh ? 'en' : 'zh-TW' })
  }

  // 滑鼠移入／移出：移出時稍微延遲，避免滑向子選單途中就關掉
  const hoverOpen = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenGroup(key)
  }
  const hoverClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenGroup(null), 150)
  }

  useEffect(() => {
    if (openGroup === null) return
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null)
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const btn = document.getElementById(`nav-btn-${openGroup}`)
      setOpenGroup(null)
      btn?.focus()
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

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  /** 第一層標籤：中文版中英並列，英文版只顯示英文 */
  const TopLabel = ({ entry }: { entry: NavEntry }) =>
    isZh ? (
      <span className="flex flex-col items-start leading-tight xl:flex-row xl:items-baseline xl:gap-1.5">
        <span>{entry.zh}</span>
        <span className="text-[0.74rem] font-medium">{entry.en}</span>
      </span>
    ) : (
      <span>{entry.en}</span>
    )

  const topBase =
    'flex h-full items-center gap-1.5 whitespace-nowrap px-4 py-3 text-[0.95rem] font-bold transition-colors ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orangeDeep'
  const topIdle = 'text-[#5A4232] hover:bg-[#FFF1E0] hover:text-primary-700'
  // 展開中：實色底。白字配 primary-700 (#9A4E0B) 對比 6.4:1，符合 AA
  const topOn = 'bg-primary-700 text-white'
  // 目前所在分類：只用底線＋字色標示，不用實色塊（實色塊壓在首頁大卡上方太搶眼）
  const topCurrent = 'text-primary-700 shadow-[inset_0_-3px_0_#9A4E0B] hover:bg-[#FFF1E0]'

  return (
    <header ref={navRef} className="sticky top-0 z-50 border-b border-line/80 bg-cream/95 backdrop-blur">
      {/* ── 第一列：LOGO＋工具列 ── */}
      <div className="container-school">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FBDCB3]">
            {/* shrink-0 必要：外層是 flex，沒有它圖會被橫向壓扁成橢圓 */}
            <Logo size={48} variant="full" priority className="shrink-0" />
            <span className="hidden leading-tight sm:block">
              <span className="block font-heading text-[1.02rem] font-bold text-[#5A4232]">
                {isZh ? '基隆市英語資源中心' : 'Keelung City English Education Resource Center'}
              </span>
              <span className="block text-[0.66rem] font-semibold tracking-[0.08em] text-inkFaint">
                {isZh ? 'Keelung City English Education Resource Center' : '基隆市英語資源中心'}
              </span>
            </span>
          </Link>

          {/* Desktop 工具列 */}
          <div className="hidden items-center gap-2 lg:flex">
            <div className="w-[260px] min-w-0">
              <SearchBar locale={locale} />
            </div>
            <FontSizeAdjuster />
            <button
              onClick={toggleLocale}
              className="shrink-0 whitespace-nowrap rounded-full border border-line bg-white px-3 py-2 text-xs font-bold tracking-widest text-orangeDeep transition hover:border-[#FBDCB3] hover:bg-[#FFF1E0]"
            >
              {isZh ? 'EN / 中' : '中 / EN'}
            </button>
            <Link
              href="/contact"
              className="shrink-0 whitespace-nowrap rounded-full bg-coOrange px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(242,153,74,0.35)] transition hover:-translate-y-0.5 hover:bg-orangeDark"
            >
              {isZh ? '找我們聊聊 →' : 'Get in touch →'}
            </Link>
          </div>

          {/* Mobile 工具列 */}
          <div className="flex items-center gap-2 lg:hidden">
            <FontSizeAdjuster />
            <button onClick={toggleLocale} aria-label={isZh ? '切換為英文 Switch to English' : '切換為中文 Switch to Chinese'} className="p-2 text-[#6B5747]">
              <Globe size={18} aria-hidden="true" />
            </button>
            {!isPortal && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? (isZh ? '關閉選單' : 'Close menu') : (isZh ? '開啟選單' : 'Open menu')}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#FBDCB3] bg-[#FFF1E0] text-orangeDeep"
            >
              {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 第二列：完整目錄列（桌機常駐） ── */}
      {!isPortal && (
      <nav aria-label={isZh ? '主選單' : 'Main menu'} className="hidden border-t border-line bg-white/80 lg:block">
        <div className="container-school">
          <ul className="flex flex-wrap items-stretch justify-center">
            {navEntries.map((entry) => {
              const active = isActive(entry)

              if (!entry.items) {
                return (
                  <li key={entry.key} className="flex">
                    <Link
                      href={entry.href as any}
                      locale={entry.locale}
                      aria-current={active ? 'page' : undefined}
                      className={`${topBase} ${active ? topCurrent : topIdle}`}
                    >
                      <TopLabel entry={entry} />
                      <ChevronRight size={14} aria-hidden="true" className="opacity-50" />
                    </Link>
                  </li>
                )
              }

              const open = openGroup === entry.key
              const panelId = `nav-panel-${entry.key}`
              return (
                <li
                  key={entry.key}
                  className="relative flex"
                  onMouseEnter={() => hoverOpen(entry.key)}
                  onMouseLeave={hoverClose}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenGroup(null)
                  }}
                >
                  <button
                    id={`nav-btn-${entry.key}`}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={(e) => {
                      // 鍵盤觸發（detail === 0）→ 切換開關；滑鼠點擊 → 只開不關，
                      // 否則滑鼠移入已自動展開，再點一下反而會把它關掉
                      if (e.detail === 0) setOpenGroup(open ? null : entry.key)
                      else setOpenGroup(entry.key)
                    }}
                    className={`${topBase} ${open ? topOn : active ? topCurrent : topIdle}`}
                  >
                    <TopLabel entry={entry} />
                    <ChevronDown
                      size={14}
                      aria-hidden="true"
                      className={`opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <ul
                    id={panelId}
                    hidden={!open}
                    className="absolute left-0 top-full z-50 min-w-[11rem] rounded-b-xl border border-t-0 border-line bg-white py-1.5 shadow-card"
                  >
                    {entry.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href as any}
                          onClick={() => setOpenGroup(null)}
                          className="block whitespace-nowrap px-5 py-2.5 text-[0.92rem] text-[#5A4232] transition-colors hover:bg-[#FFF1E0] hover:text-primary-700 focus:bg-[#FFF1E0] focus:outline-none"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      )}

      {/* ── 手機版選單 ── */}
      {isOpen && !isPortal && (
        <nav id="mobile-menu" aria-label={isZh ? '主選單' : 'Main menu'} className="border-t border-line bg-[#FFFDF8] lg:hidden">
          <div className="container-school py-3">
            {navEntries.map((entry) =>
              !entry.items ? (
                <Link
                  key={entry.key}
                  href={entry.href as any}
                  locale={entry.locale}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-xl px-3 py-3 text-[0.95rem] font-semibold text-[#6B5747] hover:bg-[#FFF1E0] hover:text-orangeDeep"
                >
                  {isZh ? entry.zh : entry.en}
                </Link>
              ) : (
                <div key={entry.key}>
                  <button
                    type="button"
                    aria-expanded={openMobileGroup === entry.key}
                    onClick={() => setOpenMobileGroup(openMobileGroup === entry.key ? null : entry.key)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-[0.95rem] font-semibold text-[#6B5747] hover:bg-[#FFF1E0] hover:text-orangeDeep"
                  >
                    {isZh ? entry.zh : entry.en}
                    <ChevronDown
                      size={14}
                      aria-hidden="true"
                      className={`transition-transform ${openMobileGroup === entry.key ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openMobileGroup === entry.key && (
                    <div className="mx-2 rounded-xl bg-[#FFF1E0]/60">
                      {entry.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href as any}
                          onClick={() => setIsOpen(false)}
                          className="block px-6 py-2.5 text-sm text-[#6B5747] hover:text-orangeDeep"
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
        </nav>
      )}
    </header>
  )
}
