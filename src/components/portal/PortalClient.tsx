'use client'

// ─────────────────────────────────────────────────────────────────────────────
// 首頁互動整合門戶（分頁式儀表板）
// 五個分頁：服務總覽與數據 / 最新消息與行事曆 / 資源與表單下載 /
//          全市 50 校名冊 / 關於本中心
// 中英文由網址 locale 決定（/zh-TW 與 /en），右上角切換按鈕直接切換網址。
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react'
import Chart from 'chart.js/auto'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import Logo from '@/components/layout/Logo'
import { DISTRICTS, SCHOOLS, KEY_METRICS, CENTER_INFO } from '@/lib/portal-data'

// ─── 型別 ────────────────────────────────────────────────────────────────────

export interface PortalNewsItem {
  id: string
  slug: string
  category: string
  titleZh: string
  titleEn: string
  summaryZh: string
  summaryEn: string
  date: string
}

export interface PortalDocItem {
  id: string
  tab: 'TEACHING' | 'ADMINISTRATIVE' | 'REGULATION'
  titleZh: string
  titleEn: string
  descZh: string
  descEn: string
  fileUrl: string
  fileType: string
  fileSize: string
  date: string
}

export interface PortalEventItem {
  id: string
  type: string
  titleZh: string
  titleEn: string
  descZh: string
  descEn: string
  date: string
}

export interface PortalTrend {
  labels: string[]
  announcements: number[]
  documents: number[]
}

interface Props {
  locale: string
  news: PortalNewsItem[]
  docs: PortalDocItem[]
  events: PortalEventItem[]
  trend: PortalTrend
}

type TabId = 'dashboard' | 'news' | 'resources' | 'schools' | 'about'

// ─── 文案字典 ────────────────────────────────────────────────────────────────

const TEXT = {
  brandZh: '基隆市英語教育資源中心',
  brandEn: 'Keelung English Education Resource Center',
  bannerZh: '服務全基隆市 50 所國中小！115 學年度外師協同教學申請系統開放中',
  bannerEn:
    'Serving all 50 elementary and junior high schools in Keelung — 2026 co-teaching applications are now open.',
  ctaZh: '外師到校協同教學申請',
  ctaEn: 'Apply for Co-Teaching',
  tabs: [
    { id: 'dashboard' as TabId, icon: '📊', zh: '服務總覽與數據', en: 'Overview & Data', shortZh: '總覽數據', shortEn: 'Overview' },
    { id: 'news' as TabId, icon: '📢', zh: '最新消息與行事曆', en: 'News & Calendar', shortZh: '消息與行事曆', shortEn: 'News' },
    { id: 'resources' as TabId, icon: '📂', zh: '資源與表單下載', en: 'Resources & Forms', shortZh: '資源與表單', shortEn: 'Resources' },
    { id: 'schools' as TabId, icon: '🏫', zh: '全市 50 校名冊', en: '50 Schools Directory', shortZh: '50 校名冊', shortEn: 'Schools' },
    { id: 'about' as TabId, icon: '🏛️', zh: '關於本中心', en: 'About Us', shortZh: '關於本中心', shortEn: 'About' },
  ],
}

const NEWS_CATEGORIES = [
  { id: 'ALL', zh: '全部分類', en: 'All', icon: '' },
  { id: 'ANNOUNCEMENT', zh: '中心公告', en: 'Announcements', icon: '📢' },
  { id: 'WORKSHOP', zh: '研習資訊', en: 'Workshops', icon: '🎓' },
  { id: 'ACTIVITY', zh: '活動訊息', en: 'Activities', icon: '🎪' },
  { id: 'COMPETITION', zh: '學生競賽', en: 'Competitions', icon: '🏆' },
  { id: 'NEWS', zh: '中心動態', en: 'Center News', icon: '📰' },
]

const NEWS_CATEGORY_LABEL: Record<string, { zh: string; en: string }> = {
  ANNOUNCEMENT: { zh: '中心公告', en: 'Announcement' },
  WORKSHOP: { zh: '研習資訊', en: 'Workshop' },
  ACTIVITY: { zh: '活動訊息', en: 'Activity' },
  COMPETITION: { zh: '學生競賽', en: 'Competition' },
  NEWS: { zh: '中心動態', en: 'News' },
  ADMISSION: { zh: '其他公告', en: 'Other' },
}

const RESOURCE_TABS = [
  { id: 'TEACHING' as const, icon: '🎓', zh: '教學表單', en: 'Teaching Forms' },
  { id: 'ADMINISTRATIVE' as const, icon: '📋', zh: '行政表單', en: 'Administrative Forms' },
  { id: 'REGULATION' as const, icon: '⚖️', zh: '法規與其他文件', en: 'Regulations & Guides' },
]

const EVENT_BADGE: Record<string, { zh: string; en: string; cls: string }> = {
  WORKSHOP: { zh: '研習', en: 'Workshop', cls: 'bg-emerald-100 text-emerald-800' },
  DEADLINE: { zh: '截止', en: 'Deadline', cls: 'bg-amber-100 text-amber-800' },
  MEETING: { zh: '會議', en: 'Meeting', cls: 'bg-sky-100 text-sky-800' },
  ACTIVITY: { zh: '活動', en: 'Activity', cls: 'bg-purple-100 text-purple-800' },
  HOLIDAY: { zh: '假期', en: 'Holiday', cls: 'bg-rose-100 text-rose-800' },
  OTHER: { zh: '其他', en: 'Other', cls: 'bg-stone-100 text-stone-700' },
}

const QUICK_ACTIONS: {
  icon: string
  titleZh: string
  titleEn: string
  descZh: string
  descEn: string
  tab: TabId
}[] = [
  { icon: '📝', titleZh: '申請外師協同教學', titleEn: 'Apply for Co-Teaching', descZh: '下載並填寫 115 學年度到校排課申請表', descEn: 'Download the 2026 school co-teaching application form', tab: 'resources' },
  { icon: '🎓', titleZh: '報名雙語增能研習', titleEn: 'Join a Workshop', descZh: '查看 CLIL 與協同教學工作坊場次', descEn: 'Browse CLIL and co-teaching workshop sessions', tab: 'news' },
  { icon: '📚', titleZh: '下載英語教學資源', titleEn: 'Download Resources', descZh: '取得分級閱讀學習單與教案講義', descEn: 'Get graded reading worksheets and lesson plans', tab: 'resources' },
  { icon: '🏫', titleZh: '查詢全市 50 校', titleEn: 'Browse 50 Schools', descZh: '依行政區檢視各校學制與聯絡窗口', descEn: 'Filter schools by district and school level', tab: 'schools' },
]

const DUTIES = [
  { icon: '✈️', zh: 'ELTA 專案推動', en: 'ELTA Program', descZh: '外籍英語教學助理媒合、到校訪視與行政協調', descEn: 'Matching, school visits and coordination for English Language Teaching Assistants' },
  { icon: '💻', zh: '數位學習資源推廣', en: 'Digital Learning', descZh: 'Cool English 等平台之校園推廣與使用輔導', descEn: 'Promoting Cool English and other digital learning platforms' },
  { icon: '🌐', zh: '中心網站經營', en: 'Website Operations', descZh: '本網站內容更新、公告發布與資源上架', descEn: 'Content updates, announcements and resource publishing' },
  { icon: '📘', zh: '成果彙編', en: 'Outcome Reports', descZh: '年度推動成果彙整、紀錄留存與成果冊編製', descEn: 'Compiling annual outcomes, records and result publications' },
  { icon: '🤝', zh: '其他交辦事項', en: 'Other Assignments', descZh: '配合教育處交辦之英語教育相關業務', descEn: 'Additional English education tasks assigned by the Department of Education' },
]

// ─── 主元件 ──────────────────────────────────────────────────────────────────

export default function PortalClient({ locale, news, docs, events, trend }: Props) {
  const isEn = locale === 'en'
  const router = useRouter()
  const pathname = usePathname()

  const [tab, setTab] = useState<TabId>('dashboard')
  const [newsCat, setNewsCat] = useState('ALL')
  const [newsQuery, setNewsQuery] = useState('')
  const [resTab, setResTab] = useState<'TEACHING' | 'ADMINISTRATIVE' | 'REGULATION'>('TEACHING')
  const [resQuery, setResQuery] = useState('')
  const [district, setDistrict] = useState('ALL')
  const [schoolType, setSchoolType] = useState('ALL')
  const [schoolQuery, setSchoolQuery] = useState('')
  const [modalItem, setModalItem] = useState<PortalNewsItem | null>(null)
  const [toast, setToast] = useState('')

  const barRef = useRef<HTMLCanvasElement | null>(null)
  const lineRef = useRef<HTMLCanvasElement | null>(null)

  // ── 衍生資料 ──────────────────────────────────────────────────────────────

  const filteredNews = useMemo(() => {
    const q = newsQuery.trim().toLowerCase()
    return news.filter((n) => {
      if (newsCat !== 'ALL' && n.category !== newsCat) return false
      if (!q) return true
      return (
        n.titleZh.toLowerCase().includes(q) ||
        n.titleEn.toLowerCase().includes(q) ||
        n.summaryZh.toLowerCase().includes(q) ||
        n.summaryEn.toLowerCase().includes(q)
      )
    })
  }, [news, newsCat, newsQuery])

  const filteredDocs = useMemo(() => {
    const q = resQuery.trim().toLowerCase()
    return docs.filter((d) => {
      if (d.tab !== resTab) return false
      if (!q) return true
      return d.titleZh.toLowerCase().includes(q) || d.titleEn.toLowerCase().includes(q)
    })
  }, [docs, resTab, resQuery])

  const filteredSchools = useMemo(() => {
    const q = schoolQuery.trim().toLowerCase()
    return SCHOOLS.filter((s) => {
      if (district !== 'ALL' && s.district !== district) return false
      if (schoolType !== 'ALL' && s.type !== schoolType) return false
      if (!q) return true
      return s.name.toLowerCase().includes(q)
    })
  }, [district, schoolType, schoolQuery])

  const districtCounts = useMemo(
    () =>
      DISTRICTS.map((d) => ({
        district: d,
        elementary: SCHOOLS.filter((s) => s.district === d && s.type === 'ELEMENTARY').length,
        junior: SCHOOLS.filter((s) => s.district === d && s.type === 'JUNIOR').length,
      })),
    []
  )

  // ── 圖表 ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (tab !== 'dashboard') return
    const charts: Chart[] = []

    if (barRef.current) {
      charts.push(
        new Chart(barRef.current, {
          type: 'bar',
          data: {
            labels: districtCounts.map((d) => d.district),
            datasets: [
              {
                label: isEn ? 'Elementary schools' : '國民小學',
                data: districtCounts.map((d) => d.elementary),
                backgroundColor: '#E3D6D0',
                borderRadius: 6,
              },
              {
                label: isEn ? 'Junior high schools' : '國民中學',
                data: districtCounts.map((d) => d.junior),
                backgroundColor: '#A03E33',
                borderRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
            scales: {
              y: { beginAtZero: true, grid: { color: '#EDE3DE' }, ticks: { precision: 0 } },
              x: { grid: { display: false }, stacked: false },
            },
          },
        })
      )
    }

    if (lineRef.current) {
      charts.push(
        new Chart(lineRef.current, {
          type: 'line',
          data: {
            labels: trend.labels,
            datasets: [
              {
                label: isEn ? 'Announcements published' : '公告發布則數',
                data: trend.announcements,
                borderColor: '#A03E33',
                backgroundColor: 'rgba(160, 62, 51, 0.1)',
                fill: true,
                tension: 0.3,
              },
              {
                label: isEn ? 'Documents uploaded' : '資源上架件數',
                data: trend.documents,
                borderColor: '#4A7C8C',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
            scales: {
              y: { beginAtZero: true, grid: { color: '#EDE3DE' }, ticks: { precision: 0 } },
              x: { grid: { display: false } },
            },
          },
        })
      )
    }

    return () => charts.forEach((c) => c.destroy())
  }, [tab, isEn, districtCounts, trend])

  // ── 小工具 ────────────────────────────────────────────────────────────────

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(''), 3000)
  }

  function goTab(next: TabId) {
    setTab(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function switchLocale(next: 'zh-TW' | 'en') {
    if (next === locale) return
    router.replace(pathname, { locale: next })
  }

  const pick = (zh: string, en: string) => (isEn ? en : zh)

  // ── 版面 ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col justify-between bg-earthBg text-earthText font-sans selection:bg-earthAccent selection:text-earthText">
      {/* 頂部通知列 + 語言切換 */}
      <div className="bg-earthMuted border-b border-earthBorder text-[11px] md:text-[13px] py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-earthPrimary text-white text-[11px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
              📢 {pick('最新通知', 'Notice')}
            </span>
            <span>{pick(TEXT.bannerZh, TEXT.bannerEn)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => switchLocale('zh-TW')}
              aria-pressed={!isEn}
              className={
                'px-3 py-1 rounded-full text-[11px] font-bold transition-all ' +
                (!isEn
                  ? 'bg-earthPrimary text-white shadow-sm'
                  : 'bg-white text-earthText border border-earthBorder shadow-sm hover:border-earthPrimary')
              }
            >
              中文
            </button>
            <button
              type="button"
              onClick={() => switchLocale('en')}
              aria-pressed={isEn}
              className={
                'px-3 py-1 rounded-full text-[11px] font-bold transition-all ' +
                (isEn
                  ? 'bg-earthPrimary text-white shadow-sm'
                  : 'bg-white text-earthText border border-earthBorder shadow-sm hover:border-earthPrimary')
              }
            >
              (EN)
            </button>
          </div>
        </div>
      </div>

      {/* Header / 分頁導覽 */}
      <header className="bg-earthSurface border-b border-earthBorder sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between gap-4">
          <button type="button" onClick={() => goTab('dashboard')} className="flex items-center gap-3 group text-left">
            <Logo size={46} priority className="shrink-0 transition-transform group-hover:scale-105" />
            <div>
              <span className="block font-bold text-base md:text-lg text-earthText leading-tight">{TEXT.brandZh}</span>
              <span className="block text-[11px] text-earthTextMuted font-medium tracking-wide">{TEXT.brandEn}</span>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1 font-bold text-[13px]" aria-label={pick('主要分頁', 'Main sections')}>
            {TEXT.tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => goTab(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
                className={
                  'px-3.5 py-2 rounded-xl transition-colors ' +
                  (tab === t.id
                    ? 'text-earthPrimary bg-earthMuted'
                    : 'text-earthTextMuted hover:text-earthText hover:bg-earthMuted/50')
                }
              >
                {t.icon} {pick(t.zh, t.en)}
              </button>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                goTab('resources')
                setResTab('ADMINISTRATIVE')
                showToast(pick('已為您切換到行政表單專區', 'Switched to administrative forms'))
              }}
              className="bg-earthPrimary hover:bg-earthPrimaryHover text-white font-bold text-[13px] px-4 py-2.5 rounded-xl shadow-sm transition-all transform active:scale-95 whitespace-nowrap"
            >
              🏫 {pick(TEXT.ctaZh, TEXT.ctaEn)}
            </button>
          </div>
        </div>

        {/* 手機版分頁列 */}
        <div className="lg:hidden flex border-t border-earthBorder bg-earthSurface text-[11px] font-bold overflow-x-auto py-2 px-2 gap-1 custom-scrollbar">
          {TEXT.tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => goTab(t.id)}
              className={
                'flex-shrink-0 px-3 py-1.5 rounded-lg ' +
                (tab === t.id ? 'bg-earthMuted text-earthPrimary' : 'text-earthTextMuted')
              }
            >
              {t.icon} {pick(t.shortZh, t.shortEn)}
            </button>
          ))}
        </div>
      </header>

      {/* 主要內容 */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-10">
        {toast && (
          <div
            role="status"
            className="fixed bottom-6 right-6 z-50 bg-earthText text-white text-[13px] font-medium px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-earthBorder"
          >
            <span className="text-lg">✅</span>
            <span>{toast}</span>
          </div>
        )}

        {/* ══ 分頁 1：服務總覽與數據 ══ */}
        {tab === 'dashboard' && (
          <div className="space-y-8">
            <section className="bg-earthSurface p-6 rounded-2xl border border-earthBorder shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="inline-block bg-earthAccent/30 text-earthText font-bold text-[11px] px-3 py-1 rounded-full mb-2">
                    ☀️ {pick('陽光溫潤的整合服務門戶', 'A warm, task-oriented service portal')}
                  </span>
                  <h1 className="text-xl md:text-2xl font-bold text-earthText font-heading">
                    {TEXT.brandZh} <span className="text-earthPrimary">{pick('互動數據與服務門戶', 'Interactive Data & Service Portal')}</span>
                  </h1>
                  <p className="text-earthTextMuted text-[13px] md:text-sm mt-2 max-w-3xl leading-relaxed">
                    {pick(
                      '本門戶統籌基隆市 50 所國中小之外籍英語教師（FET／ELTA）派駐調度、教學資源庫分享與教師雙語增能研習。下方整合全站核心服務入口與即時數據。',
                      'This portal coordinates the deployment of foreign English teachers (FET / ELTA) across all 50 elementary and junior high schools in Keelung, together with our shared teaching resource library and bilingual professional development workshops.'
                    )}
                  </p>
                </div>
                <div className="bg-earthBg p-4 rounded-xl border border-earthBorder text-center min-w-[200px]">
                  <span className="text-[11px] text-earthTextMuted font-bold block">{pick('中心督導單位', 'Supervised by')}</span>
                  <span className="text-[13px] font-bold text-earthText block mt-0.5">
                    {pick(CENTER_INFO.supervisorZh, CENTER_INFO.supervisorEn)}
                  </span>
                  <span className="text-[11px] text-earthPrimary font-bold block mt-2">
                    {pick('承辦學校：', 'Host school: ')}
                    {pick(CENTER_INFO.hostZh, CENTER_INFO.hostEn)}
                  </span>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {KEY_METRICS.map((m) => (
                <div
                  key={m.labelZh}
                  className="bg-earthSurface p-5 rounded-2xl border border-earthBorder shadow-sm hover:border-earthPrimary transition-all"
                >
                  <div className="text-2xl mb-2">{m.icon}</div>
                  <div className={'text-xl md:text-2xl font-bold font-heading ' + (m.highlight ? 'text-earthPrimary' : 'text-earthText')}>
                    {pick(m.valueZh, m.valueEn)}
                  </div>
                  <div className="text-[11px] md:text-[13px] text-earthTextMuted font-medium mt-1">
                    {pick(m.labelZh, m.labelEn)}
                  </div>
                </div>
              ))}
            </section>

            <section className="bg-earthMuted/60 p-6 rounded-2xl border border-earthBorder">
              <h2 className="text-base font-bold text-earthText flex items-center gap-2 mb-4">
                <span>🧭</span>
                <span>{pick('常用服務快速導航', 'Quick Navigation')}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.titleZh}
                    type="button"
                    onClick={() => goTab(a.tab)}
                    className="bg-earthSurface p-4 rounded-xl border border-earthBorder shadow-sm hover:border-earthPrimary transition-all text-left flex flex-col justify-between"
                  >
                    <span>
                      <span className="block text-xl mb-1.5">{a.icon}</span>
                      <span className="block font-bold text-[13px] text-earthText">{pick(a.titleZh, a.titleEn)}</span>
                      <span className="block text-[11px] text-earthTextMuted mt-1">{pick(a.descZh, a.descEn)}</span>
                    </span>
                    <span className="text-[11px] font-bold text-earthPrimary mt-3 inline-block">
                      {pick('前往瀏覽 →', 'Go →')}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-earthSurface p-6 rounded-2xl border border-earthBorder shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-earthBorder pb-4">
                <div>
                  <h2 className="text-lg font-bold text-earthText">
                    📊 {pick('學校分布與資源運用動態分析', 'School Distribution & Resource Analytics')}
                  </h2>
                  <p className="text-[11px] md:text-[13px] text-earthTextMuted mt-1">
                    {pick(
                      '左圖為全市七大行政區國中小校數（資料來源：基隆市市屬教育單位聯絡電話一覽表）；右圖為本站近半年公告發布與資源上架的實際件數。',
                      'Left: number of schools in each of Keelung’s seven districts. Right: announcements published and resources uploaded on this site over the past six months.'
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold bg-earthBg px-3 py-1.5 rounded-lg border border-earthBorder whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span>{pick('資料狀態：即時連線中', 'Live data')}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-2">
                  <h3 className="text-[13px] font-bold text-earthText text-center">
                    {pick('各行政區國中小校數（共 50 校）', 'Schools per district (50 total)')}
                  </h3>
                  <div className="chart-container">
                    <canvas ref={barRef} role="img" aria-label={pick('各行政區國中小校數長條圖', 'Bar chart of schools per district')} />
                  </div>
                  <p className="text-[11px] text-earthTextMuted text-center">
                    {pick('資料來源：基隆市市屬教育單位聯絡電話一覽表（115.08.01 修正）', 'Source: Keelung education unit contact list (rev. Aug 2026)')}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[13px] font-bold text-earthText text-center">
                    {pick('近半年公告發布與資源上架件數', 'Announcements & resources, last 6 months')}
                  </h3>
                  <div className="chart-container">
                    <canvas ref={lineRef} role="img" aria-label={pick('近半年公告與資源折線圖', 'Line chart of announcements and resources')} />
                  </div>
                  <p className="text-[11px] text-earthTextMuted text-center">
                    {pick('資料來源：本站資料庫即時統計', 'Source: live statistics from this site’s database')}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ══ 分頁 2：最新消息與行事曆 ══ */}
        {tab === 'news' && (
          <div className="space-y-8">
            <section className="bg-earthSurface p-6 rounded-2xl border border-earthBorder shadow-sm">
              <h1 className="text-xl font-bold text-earthText font-heading">
                📢 {pick('最新消息與研習行事曆', 'News & Workshop Calendar')}
              </h1>
              <p className="text-earthTextMuted text-[13px] mt-2 leading-relaxed">
                {pick(
                  '本區塊整合中心最新行政公告、雙語增能研習活動、外師到校協同教學資訊及資源上架通知。可透過關鍵字搜尋或分類標籤篩選，並查閱近期行事曆。',
                  'Administrative announcements, bilingual professional development workshops, co-teaching notices and new resource alerts — filter by keyword or category, and check the upcoming calendar.'
                )}
              </p>
            </section>

            <section className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-earthMuted/50 p-4 rounded-2xl border border-earthBorder">
              <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                {NEWS_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setNewsCat(c.id)}
                    className={
                      'px-3.5 py-2 rounded-xl border transition-all ' +
                      (newsCat === c.id
                        ? 'border-earthPrimary bg-earthPrimary text-white'
                        : 'border-earthBorder bg-white text-earthText hover:border-earthPrimary')
                    }
                  >
                    {c.icon} {pick(c.zh, c.en)}
                  </button>
                ))}
              </div>
              <div className="relative min-w-[240px]">
                <label htmlFor="news-search" className="sr-only">
                  {pick('搜尋公告關鍵字', 'Search announcements')}
                </label>
                <input
                  id="news-search"
                  type="text"
                  value={newsQuery}
                  onChange={(e) => setNewsQuery(e.target.value)}
                  placeholder={pick('搜尋公告關鍵字…', 'Search announcements…')}
                  className="w-full text-[11px] bg-white border border-earthBorder rounded-xl pl-8 pr-4 py-2.5 focus:outline-none focus:border-earthPrimary"
                />
                <span className="absolute left-2.5 top-2.5 text-earthTextMuted text-[11px]">🔍</span>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {filteredNews.length === 0 ? (
                  <div className="bg-earthSurface p-8 text-center rounded-2xl border border-earthBorder text-earthTextMuted text-[11px]">
                    {pick('查無符合條件的最新消息。', 'No announcements match your filters.')}
                  </div>
                ) : (
                  filteredNews.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setModalItem(n)}
                      className="w-full text-left bg-earthSurface p-5 rounded-2xl border border-earthBorder shadow-sm hover:border-earthPrimary transition-all space-y-2"
                    >
                      <span className="flex items-center justify-between text-[11px]">
                        <span className="bg-earthMuted text-earthPrimary font-bold px-2.5 py-0.5 rounded-md">
                          {pick(
                            NEWS_CATEGORY_LABEL[n.category]?.zh ?? n.category,
                            NEWS_CATEGORY_LABEL[n.category]?.en ?? n.category
                          )}
                        </span>
                        <span className="text-earthTextMuted font-medium">{n.date}</span>
                      </span>
                      <span className="block font-bold text-sm text-earthText">{pick(n.titleZh, n.titleEn)}</span>
                      <span className="block text-[11px] text-earthTextMuted leading-relaxed">
                        {pick(n.summaryZh, n.summaryEn)}
                      </span>
                    </button>
                  ))
                )}
              </div>

              <aside className="bg-earthSurface p-5 rounded-2xl border border-earthBorder shadow-sm space-y-4 h-fit">
                <div className="flex justify-between items-center border-b border-earthBorder pb-3">
                  <h2 className="font-bold text-earthText text-[13px] flex items-center gap-1.5">
                    <span>📅</span> {pick('近期重要行事曆', 'Upcoming Calendar')}
                  </h2>
                  <Link href="/calendar" className="text-[11px] text-earthPrimary font-bold hover:underline">
                    {pick('完整行事曆', 'Full calendar')}
                  </Link>
                </div>
                <div className="space-y-3">
                  {events.length === 0 ? (
                    <p className="text-[11px] text-earthTextMuted">{pick('目前沒有排定的行程。', 'No scheduled events.')}</p>
                  ) : (
                    events.map((ev) => {
                      const badge = EVENT_BADGE[ev.type] ?? EVENT_BADGE.OTHER
                      return (
                        <div
                          key={ev.id}
                          className="p-3 rounded-xl bg-earthBg border border-earthBorder flex items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-earthText block">{pick(ev.titleZh, ev.titleEn)}</span>
                            <span className="text-[10px] text-earthTextMuted block">{ev.date}</span>
                          </div>
                          <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ' + badge.cls}>
                            {pick(badge.zh, badge.en)}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
                <p className="bg-earthBg p-3 rounded-xl border border-earthBorder text-[11px] text-earthTextMuted">
                  💡 {pick('提示：點擊上方公告可查看完整內容與附件說明。', 'Tip: click an announcement above for full details.')}
                </p>
              </aside>
            </div>
          </div>
        )}

        {/* ══ 分頁 3：資源與表單下載 ══ */}
        {tab === 'resources' && (
          <div className="space-y-8">
            <section className="bg-earthSurface p-6 rounded-2xl border border-earthBorder shadow-sm">
              <h1 className="text-xl font-bold text-earthText font-heading">
                📂 {pick('資源與表單下載專區', 'Resources & Forms')}
              </h1>
              <p className="text-earthTextMuted text-[13px] mt-2 leading-relaxed">
                {pick(
                  '中心提供「教學表單」、「行政表單」與「法規及其他文件」三大類別下載，供本市教師與外籍顧問免費使用。',
                  'Teaching forms, administrative forms, and regulations & guides — all free to download for Keelung teachers and foreign advisors.'
                )}
              </p>
            </section>

            <div className="border-b border-earthBorder flex gap-2 sm:gap-4 text-[13px] font-bold overflow-x-auto custom-scrollbar">
              {RESOURCE_TABS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setResTab(r.id)}
                  className={
                    'py-3 px-4 border-b-2 whitespace-nowrap transition-colors ' +
                    (resTab === r.id
                      ? 'border-earthPrimary text-earthPrimary'
                      : 'border-transparent text-earthTextMuted hover:text-earthText')
                  }
                >
                  {r.icon} {pick(r.zh, r.en)}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-earthMuted/40 p-4 rounded-xl border border-earthBorder">
              <p className="text-[11px] text-earthTextMuted font-bold">
                {pick('目前檢視分類：', 'Current category: ')}
                <span className="text-earthPrimary">
                  {pick(
                    RESOURCE_TABS.find((r) => r.id === resTab)?.zh ?? '',
                    RESOURCE_TABS.find((r) => r.id === resTab)?.en ?? ''
                  )}
                </span>
                {pick(`（共 ${filteredDocs.length} 筆）`, ` (${filteredDocs.length} items)`)}
              </p>
              <label htmlFor="res-search" className="sr-only">
                {pick('搜尋表單名稱', 'Search forms')}
              </label>
              <input
                id="res-search"
                type="text"
                value={resQuery}
                onChange={(e) => setResQuery(e.target.value)}
                placeholder={pick('搜尋表單名稱…', 'Search forms…')}
                className="text-[11px] bg-white border border-earthBorder rounded-xl px-4 py-2 w-full sm:w-64 focus:outline-none focus:border-earthPrimary"
              />
            </div>

            <div className="bg-earthSurface rounded-2xl border border-earthBorder shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] md:text-[13px]">
                  <thead className="bg-earthMuted/70 text-earthText font-bold border-b border-earthBorder">
                    <tr>
                      <th scope="col" className="p-4">{pick('文件名稱與簡介', 'Document')}</th>
                      <th scope="col" className="p-4">{pick('格式／大小', 'Format / size')}</th>
                      <th scope="col" className="p-4">{pick('更新日期', 'Updated')}</th>
                      <th scope="col" className="p-4 text-right">{pick('操作', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earthBorder">
                    {filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-earthTextMuted text-[11px]">
                          {pick('該分類下暫無對應文件。', 'No documents in this category yet.')}
                        </td>
                      </tr>
                    ) : (
                      filteredDocs.map((d) => (
                        <tr key={d.id} className="hover:bg-earthMuted/30 transition-colors align-top">
                          <td className="p-4">
                            <span className="block font-bold text-earthText">{pick(d.titleZh, d.titleEn)}</span>
                            {(isEn ? d.descEn : d.descZh) && (
                              <span className="block text-[11px] text-earthTextMuted mt-1">{pick(d.descZh, d.descEn)}</span>
                            )}
                          </td>
                          <td className="p-4 text-earthTextMuted text-[11px] whitespace-nowrap">
                            {d.fileType} {d.fileSize && `(${d.fileSize})`}
                          </td>
                          <td className="p-4 text-earthTextMuted text-[11px] whitespace-nowrap">{d.date}</td>
                          <td className="p-4 text-right">
                            <a
                              href={d.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-earthPrimary hover:bg-earthPrimaryHover text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                            >
                              ⬇️ {pick('下載', 'Download')}
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-[11px] text-earthTextMuted">
              {pick('找不到需要的文件？請前往完整的 ', 'Looking for something else? Visit the full ')}
              <Link href="/documents" className="text-earthPrimary font-bold hover:underline">
                {pick('文件下載頁面', 'documents page')}
              </Link>
              {pick('。', '.')}
            </p>
          </div>
        )}

        {/* ══ 分頁 4：全市 50 校名冊 ══ */}
        {tab === 'schools' && (
          <div className="space-y-8">
            <section className="bg-earthSurface p-6 rounded-2xl border border-earthBorder shadow-sm">
              <h1 className="text-xl font-bold text-earthText font-heading">
                🏫 {pick('全市 50 所國中小名冊', '50 Elementary & Junior High Schools')}
              </h1>
              <p className="text-earthTextMuted text-[13px] mt-2 leading-relaxed">
                {pick(
                  '提供基隆市七大行政區（仁愛、中正、信義、中山、安樂、七堵、暖暖）國民中小學之學制分類與學校聯絡窗口檢索。',
                  'Browse public elementary and junior high schools across Keelung’s seven districts: Ren’ai, Zhongzheng, Xinyi, Zhongshan, Anle, Qidu and Nuannuan.'
                )}
              </p>
            </section>

            <section className="bg-earthMuted/50 p-4 rounded-2xl border border-earthBorder space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span className="text-earthTextMuted">{pick('行政區：', 'District: ')}</span>
                <button
                  type="button"
                  onClick={() => setDistrict('ALL')}
                  className={
                    'px-3 py-1.5 rounded-lg border ' +
                    (district === 'ALL'
                      ? 'bg-earthPrimary text-white border-earthPrimary'
                      : 'bg-white text-earthText border-earthBorder hover:border-earthPrimary')
                  }
                >
                  {pick('全部 (50)', 'All (50)')}
                </button>
                {DISTRICTS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDistrict(d)}
                    className={
                      'px-3 py-1.5 rounded-lg border ' +
                      (district === d
                        ? 'bg-earthPrimary text-white border-earthPrimary'
                        : 'bg-white text-earthText border-earthBorder hover:border-earthPrimary')
                    }
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-earthBorder/60">
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <label htmlFor="school-type" className="text-earthTextMuted">
                    {pick('學校類型：', 'School level: ')}
                  </label>
                  <select
                    id="school-type"
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value)}
                    className="bg-white border border-earthBorder text-earthText rounded-lg px-3 py-1.5 text-[11px] focus:outline-none"
                  >
                    <option value="ALL">{pick('全部學制', 'All levels')}</option>
                    <option value="ELEMENTARY">{pick('國民小學', 'Elementary')}</option>
                    <option value="JUNIOR">{pick('國民中學', 'Junior high')}</option>
                  </select>
                </div>
                <label htmlFor="school-search" className="sr-only">
                  {pick('搜尋校名', 'Search school name')}
                </label>
                <input
                  id="school-search"
                  type="text"
                  value={schoolQuery}
                  onChange={(e) => setSchoolQuery(e.target.value)}
                  placeholder={pick('搜尋校名…', 'Search school name…')}
                  className="text-[11px] bg-white border border-earthBorder rounded-xl px-3.5 py-1.5 w-full sm:w-60 focus:outline-none focus:border-earthPrimary"
                />
              </div>
            </section>

            <p className="text-[11px] text-earthTextMuted font-bold">
              {pick(`符合條件共 ${filteredSchools.length} 校`, `${filteredSchools.length} schools found`)}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchools.length === 0 ? (
                <div className="col-span-full p-8 text-center text-earthTextMuted text-[11px] bg-earthSurface rounded-2xl border border-earthBorder">
                  {pick('查無符合條件的學校。', 'No schools match your filters.')}
                </div>
              ) : (
                filteredSchools.map((s) => (
                  <div key={s.name} className="bg-earthSurface p-5 rounded-2xl border border-earthBorder shadow-sm space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-earthPrimary bg-earthMuted px-2 py-0.5 rounded">
                          {s.district}
                        </span>
                        <h3 className="font-bold text-sm text-earthText mt-1">{s.name}</h3>
                      </div>
                      <span className="bg-earthAccent/30 text-earthText text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        {s.type === 'ELEMENTARY' ? pick('國小', 'Elementary') : pick('國中', 'Junior high')}
                      </span>
                    </div>
                    <p className="text-[11px] text-earthTextMuted">
                      📞 {pick('學校電話：', 'Phone: ')}
                      <a href={'tel:' + s.phone.replace(/[^0-9]/g, '')} className="text-earthText hover:text-earthPrimary">
                        {s.phone}
                      </a>
                    </p>
                  </div>
                ))
              )}
            </div>

            <p className="text-[11px] text-earthTextMuted leading-relaxed">
              {pick(
                '※ 本名冊僅列出校名、行政區、學制與學校總機等公開資訊。校長個人聯絡方式屬內部資料，不對外公開。',
                '※ This directory lists only publicly available information. Principals’ personal contact details are internal and not published here.'
              )}
            </p>
          </div>
        )}

        {/* ══ 分頁 5：關於本中心 ══ */}
        {tab === 'about' && (
          <div className="space-y-8">
            <section className="bg-earthSurface p-6 rounded-2xl border border-earthBorder shadow-sm">
              <h1 className="text-xl font-bold text-earthText font-heading">
                🏛️ {pick('關於基隆市英語教育資源中心', 'About the Keelung EERC')}
              </h1>
              <p className="text-earthTextMuted text-[13px] mt-2 leading-relaxed">
                {pick(
                  '本中心由基隆市政府教育處督導設置，統籌全市國民中小學英語與雙語教育推動事務，服務對象包含各校英語教師、行政窗口，以及在本市服務的外籍英語教師與教學助理。',
                  'Established under the supervision of the Department of Education, Keelung City Government, the Center coordinates English and bilingual education across all municipal elementary and junior high schools, serving local English teachers, school administrators, and foreign English teachers and teaching assistants.'
                )}
              </p>
            </section>

            <section className="bg-earthSurface p-6 rounded-2xl border border-earthBorder shadow-sm space-y-4">
              <h2 className="text-base font-bold text-earthText border-b border-earthBorder pb-3">
                🗂️ {pick('組織架構', 'Organization')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-earthBg p-4 rounded-xl border border-earthBorder">
                  <span className="text-[11px] text-earthTextMuted font-bold block">{pick('督導單位', 'Supervising body')}</span>
                  <span className="text-[13px] font-bold text-earthText block mt-1">
                    {pick(CENTER_INFO.supervisorZh, CENTER_INFO.supervisorEn)}
                  </span>
                </div>
                <div className="bg-earthBg p-4 rounded-xl border border-earthBorder">
                  <span className="text-[11px] text-earthTextMuted font-bold block">{pick('召集人／副召集人', 'Convener / Deputy')}</span>
                  <span className="text-[13px] font-bold text-earthText block mt-1">
                    {pick('由承辦學校校長兼任', 'Concurrently held by the host school principal')}
                  </span>
                </div>
                <div className="bg-earthBg p-4 rounded-xl border border-earthBorder">
                  <span className="text-[11px] text-earthTextMuted font-bold block">{pick('專業工作人員／外籍顧問', 'Staff / Foreign advisors')}</span>
                  <span className="text-[13px] font-bold text-earthText block mt-1">
                    {pick('專任助理與外籍英語顧問', 'Full-time assistants and foreign English advisors')}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-earthTextMuted">
                {pick('完整組織架構與人員介紹請見 ', 'For the full organization chart, see ')}
                <Link href="/about" className="text-earthPrimary font-bold hover:underline">
                  {pick('關於本中心頁面', 'the About page')}
                </Link>
                {pick('與 ', ' and ')}
                <Link href="/teachers" className="text-earthPrimary font-bold hover:underline">
                  {pick('師資介紹', 'our team')}
                </Link>
                {pick('。', '.')}
              </p>
            </section>

            <section className="bg-earthSurface p-6 rounded-2xl border border-earthBorder shadow-sm space-y-4">
              <h2 className="text-base font-bold text-earthText border-b border-earthBorder pb-3">
                🎯 {pick('五大職掌', 'Five Core Functions')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DUTIES.map((d) => (
                  <div key={d.zh} className="bg-earthBg p-4 rounded-xl border border-earthBorder">
                    <span className="block text-xl mb-1.5">{d.icon}</span>
                    <span className="block font-bold text-[13px] text-earthText">{pick(d.zh, d.en)}</span>
                    <span className="block text-[11px] text-earthTextMuted mt-1 leading-relaxed">
                      {pick(d.descZh, d.descEn)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-earthSurface p-6 rounded-2xl border border-earthBorder shadow-sm space-y-4">
              <h2 className="text-base font-bold text-earthText border-b border-earthBorder pb-3">
                📮 {pick('聯絡我們', 'Contact Us')}
              </h2>
              <ul className="space-y-2 text-[13px] text-earthTextMuted">
                <li>📍 {pick('地址：', 'Address: ')}{pick(CENTER_INFO.addressZh, CENTER_INFO.addressEn)}</li>
                <li>📞 {pick('電話：', 'Phone: ')}{CENTER_INFO.phone}</li>
                <li>✉️ {pick('信箱：', 'Email: ')}<a href={'mailto:' + CENTER_INFO.email} className="text-earthPrimary hover:underline">{CENTER_INFO.email}</a></li>
              </ul>
              <Link
                href="/contact"
                className="inline-block bg-earthPrimary hover:bg-earthPrimaryHover text-white font-bold text-[13px] px-4 py-2.5 rounded-xl shadow-sm transition-all"
              >
                {pick('線上聯絡表單', 'Online contact form')}
              </Link>
            </section>
          </div>
        )}
      </div>

      {/* 公告詳情 Modal */}
      {modalItem && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setModalItem(null)}
        >
          <div
            className="bg-earthSurface border border-earthBorder rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalItem(null)}
              aria-label={pick('關閉', 'Close')}
              className="absolute top-4 right-4 text-earthTextMuted hover:text-earthText text-base font-bold w-8 h-8 rounded-full bg-earthMuted flex items-center justify-center"
            >
              ✕
            </button>
            <span className="bg-earthMuted text-earthPrimary text-[11px] font-bold px-2.5 py-1 rounded-md inline-block">
              {pick(
                NEWS_CATEGORY_LABEL[modalItem.category]?.zh ?? modalItem.category,
                NEWS_CATEGORY_LABEL[modalItem.category]?.en ?? modalItem.category
              )}
            </span>
            <h2 className="text-base font-bold text-earthText pr-8">{pick(modalItem.titleZh, modalItem.titleEn)}</h2>
            <p className="text-[11px] text-earthTextMuted">
              {pick('發布日期：', 'Published: ')}
              {modalItem.date}
            </p>
            <p className="text-[11px] text-earthText leading-relaxed pt-2 border-t border-earthBorder">
              {pick(modalItem.summaryZh, modalItem.summaryEn)}
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <Link
                href={`/news/${modalItem.slug}` as any}
                className="bg-earthPrimary text-white text-[11px] font-bold px-4 py-2 rounded-xl"
              >
                {pick('閱讀全文', 'Read full article')}
              </Link>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="bg-earthMuted text-earthText text-[11px] font-bold px-4 py-2 rounded-xl"
              >
                {pick('關閉', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-earthSurface border-t border-earthBorder mt-12 py-10 text-[11px] md:text-[13px]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Logo size={34} />
              <span className="font-bold text-sm text-earthText">{TEXT.brandZh}</span>
            </div>
            <p className="text-earthTextMuted leading-relaxed text-[11px]">
              {pick(
                '統籌基隆市 50 所國中小外籍教師資源派駐、英語與雙語教學研習及教學表單下載服務。',
                'Coordinating foreign teacher deployment, bilingual professional development and teaching resources for 50 schools in Keelung.'
              )}
            </p>
          </div>
          <div>
            <h2 className="font-bold text-earthText mb-3">{pick('服務範疇', 'What We Do')}</h2>
            <ul className="space-y-2 text-earthTextMuted text-[11px]">
              <li>• {pick('外籍英語教師（FET／ELTA）調度', 'FET / ELTA deployment')}</li>
              <li>• {pick('全市雙語教學增能工作坊', 'Citywide bilingual workshops')}</li>
              <li>• {pick('分級閱讀與雙語教案資源庫', 'Graded reading & lesson plan library')}</li>
              <li>• {pick('外籍顧問生活適應諮詢', 'Living support for foreign advisors')}</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-earthText mb-3">{pick('快速連結', 'Quick Links')}</h2>
            <ul className="space-y-2 text-earthTextMuted text-[11px]">
              <li>
                <Link href="/news" className="hover:underline">{pick('最新消息', 'News')}</Link>
              </li>
              <li>
                <Link href="/documents" className="hover:underline">{pick('文件下載', 'Documents')}</Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:underline">{pick('行事曆', 'Calendar')}</Link>
              </li>
              <li>
                <Link href="/albums" className="hover:underline">{pick('活動相簿', 'Photo albums')}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-earthText mb-3">{pick('聯絡資訊', 'Contact')}</h2>
            <ul className="space-y-2 text-earthTextMuted text-[11px]">
              <li>📍 {pick(CENTER_INFO.addressZh, CENTER_INFO.addressEn)}</li>
              <li>📞 {CENTER_INFO.phone}</li>
              <li>✉️ {CENTER_INFO.email}</li>
              <li className="pt-2 text-[10px] text-earthPrimary font-bold">
                ♿ {pick('本站依循 WCAG 2.1 AA 無障礙設計原則建置', 'Built to WCAG 2.1 AA accessibility standards')}
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8 pt-6 border-t border-earthBorder flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-earthTextMuted">
          <span>© {new Date().getFullYear()} {TEXT.brandEn}. All rights reserved.</span>
          <span>{TEXT.brandZh}</span>
        </div>
      </footer>
    </div>
  )
}
