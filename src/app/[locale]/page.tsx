// src/app/[locale]/page.tsx
// 首頁 = 互動整合門戶（分頁式儀表板）。
// 資料一律從資料庫取，失敗時回傳 mock data（沿用專案既有慣例）。

import { prisma } from '@/lib/prisma'
import PortalClient, {
  type PortalNewsItem,
  type PortalDocItem,
  type PortalEventItem,
  type PortalTrend,
} from '@/components/portal/PortalClient'

export const revalidate = 300

function fmtDate(d: Date | null | undefined) {
  if (!d) return ''
  const dt = new Date(d)
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${dt.getFullYear()}-${m}-${day}`
}

function fmtSize(bytes: number) {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function extOf(fileName: string, fileType: string) {
  const dot = fileName.lastIndexOf('.')
  if (dot > -1 && dot < fileName.length - 1) return fileName.slice(dot + 1).toUpperCase()
  return (fileType || '').split('/').pop()?.toUpperCase() ?? 'FILE'
}

/** 近 6 個月的月份標籤（含本月），例如 ['3月','4月',...] */
function lastSixMonths() {
  const now = new Date()
  const buckets: { label: string; start: Date; end: Date }[] = []
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    buckets.push({ label: `${start.getMonth() + 1}月`, start, end })
  }
  return buckets
}

const MOCK_NEWS: PortalNewsItem[] = [
  {
    id: 'm1',
    slug: 'welcome',
    category: 'ANNOUNCEMENT',
    titleZh: '歡迎蒞臨基隆市英語教育資源中心',
    titleEn: 'Welcome to the Keelung English Education Resource Center',
    summaryZh: '本中心統籌全市國民中小學英語與雙語教育推動事務，歡迎各校教師多加利用本站資源。',
    summaryEn:
      'The Center coordinates English and bilingual education across Keelung. Teachers are welcome to make full use of the resources on this site.',
    date: fmtDate(new Date()),
  },
]

const MOCK_DOCS: PortalDocItem[] = []
const MOCK_EVENTS: PortalEventItem[] = []

async function getData() {
  const buckets = lastSixMonths()
  const emptyTrend: PortalTrend = {
    labels: buckets.map((b) => b.label),
    announcements: buckets.map(() => 0),
    documents: buckets.map(() => 0),
  }

  try {
    const since = buckets[0].start
    const [announcements, documents, events, trendAnnouncements, trendDocuments] = await Promise.all([
      prisma.announcement.findMany({
        where: { isPublished: true },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        take: 12,
      }),
      prisma.document.findMany({
        where: { isPublished: true },
        orderBy: { updatedAt: 'desc' },
        take: 60,
      }),
      prisma.calendarEvent.findMany({
        where: { isPublished: true, startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        take: 6,
      }),
      prisma.announcement.findMany({
        where: { isPublished: true, publishedAt: { gte: since } },
        select: { publishedAt: true },
      }),
      prisma.document.findMany({
        where: { isPublished: true, createdAt: { gte: since } },
        select: { createdAt: true },
      }),
    ])

    const countInto = (dates: (Date | null)[]) =>
      buckets.map((b) => dates.filter((d) => d && d >= b.start && d < b.end).length)

    const news: PortalNewsItem[] = announcements.map((a) => ({
      id: a.id,
      slug: a.slug,
      category: a.category,
      titleZh: a.titleZh,
      titleEn: a.titleEn,
      summaryZh: a.summaryZh ?? '',
      summaryEn: a.summaryEn ?? '',
      date: fmtDate(a.publishedAt ?? a.createdAt),
    }))

    const docs: PortalDocItem[] = documents.map((d) => ({
      id: d.id,
      tab:
        d.category !== 'FORM'
          ? ('REGULATION' as const)
          : d.formType === 'TEACHING'
            ? ('TEACHING' as const)
            : ('ADMINISTRATIVE' as const),
      titleZh: d.titleZh,
      titleEn: d.titleEn,
      descZh: d.descZh ?? '',
      descEn: d.descEn ?? '',
      fileUrl: d.fileUrl,
      fileType: extOf(d.fileName, d.fileType),
      fileSize: fmtSize(d.fileSize),
      date: fmtDate(d.updatedAt),
    }))

    const calendar: PortalEventItem[] = events.map((e) => ({
      id: e.id,
      type: e.type,
      titleZh: e.titleZh,
      titleEn: e.titleEn,
      descZh: e.descZh ?? '',
      descEn: e.descEn ?? '',
      date: fmtDate(e.startDate),
    }))

    const trend: PortalTrend = {
      labels: buckets.map((b) => b.label),
      announcements: countInto(trendAnnouncements.map((a) => a.publishedAt)),
      documents: countInto(trendDocuments.map((d) => d.createdAt)),
    }

    return {
      news: news.length ? news : MOCK_NEWS,
      docs,
      events: calendar,
      trend,
    }
  } catch {
    return { news: MOCK_NEWS, docs: MOCK_DOCS, events: MOCK_EVENTS, trend: emptyTrend }
  }
}

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const { news, docs, events, trend } = await getData()
  return <PortalClient locale={locale} news={news} docs={docs} events={events} trend={trend} />
}
