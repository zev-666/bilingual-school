import { notFound } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

async function getAnnouncement(slug: string) {
  try {
    return await prisma.announcement.findUnique({ where: { slug, isPublished: true } })
  } catch { return null }
}

export default async function NewsDetailPage({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
  const t = useTranslations('news')
  const item = await getAnnouncement(slug)
  if (!item) notFound()

  return (
    <div className="section-padding">
      <div className="container-school max-w-3xl">
        <Link href="/news" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-8">
          <ArrowLeft size={16} /> {t('back')}
        </Link>
        <span className="badge-blue mb-4 inline-block">{item.category}</span>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {locale === 'zh-TW' ? item.titleZh : item.titleEn}
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          {t('published')}: {formatDate(item.publishedAt || item.createdAt, locale)}
        </p>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {locale === 'zh-TW' ? item.contentZh : item.contentEn}
          </p>
        </div>
      </div>
    </div>
  )
}
