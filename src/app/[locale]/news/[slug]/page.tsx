import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { prisma } from '@/lib/prisma'
import { formatDate, displayTitle } from '@/lib/utils'
import Markdown from '@/components/ui/Markdown'
import { ArrowLeft } from 'lucide-react'

async function getAnnouncement(slug: string) {
  try {
    return await prisma.announcement.findUnique({ where: { slug, isPublished: true } })
  } catch { return null }
}

export default async function NewsDetailPage({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
  const t = await getTranslations('news')
  const item = await getAnnouncement(slug)
  if (!item) notFound()

  // 內文與標題採同一套 fallback 邏輯：英文版缺內容時退回中文，
  // 避免整頁空白（比照 displayTitle 的處理方式）。
  const content = locale === 'zh-TW'
    ? (item.contentZh || item.contentEn || '')
    : (item.contentEn || item.contentZh || '')

  return (
    <div className="section-padding">
      <div className="container-school max-w-3xl">
        <Link href="/news" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-8">
          <ArrowLeft size={16} /> {t('back')}
        </Link>
        <span className="badge-blue mb-4 inline-block">{item.category}</span>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {displayTitle(item.titleZh, item.titleEn, locale)}
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          {t('published')}: {formatDate(item.publishedAt || item.createdAt, locale)}
        </p>
        <div className="max-w-none">
          <Markdown>{content}</Markdown>
        </div>
      </div>
    </div>
  )
}
