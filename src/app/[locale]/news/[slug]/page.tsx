// src/app/[locale]/news/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { prisma } from '@/lib/prisma'
import { Link as IntlLink } from '@/i18n/routing'
import { formatDate, CATEGORY_COLORS, cn } from '@/lib/utils'
import { ArrowLeft, Eye, Calendar, User } from 'lucide-react'

interface Props {
  params: { locale: string; slug: string }
}

async function getAnnouncement(slug: string) {
  try {
    const item = await prisma.announcement.findUnique({
      where: { slug, isPublished: true },
      include: { author: { select: { name: true } } },
    })
    if (item) {
      // Increment view count (fire-and-forget)
      prisma.announcement.update({
        where: { id: item.id },
        data: { viewCount: { increment: 1 } },
      }).catch(() => {})
    }
    return item
  } catch {
    return null
  }
}

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const item = await getAnnouncement(slug)
  if (!item) return { title: 'Not Found' }
  const isZh = locale === 'zh-TW'
  return {
    title: isZh ? item.titleZh : item.titleEn,
    description: isZh ? item.summaryZh ?? undefined : item.summaryEn ?? undefined,
    openGraph: {
      images: item.coverImage ? [{ url: item.coverImage }] : [],
    },
  }
}

export default async function NewsDetailPage({ params: { locale, slug } }: Props) {
  const t = await getTranslations({ locale, namespace: 'news' })
  const item = await getAnnouncement(slug)

  if (!item) notFound()

  const isZh = locale === 'zh-TW'
  const title   = isZh ? item.titleZh   : item.titleEn
  const content = isZh ? item.contentZh : item.contentEn
  const catColor = CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero image */}
      {item.coverImage && (
        <div className="relative h-64 md:h-96">
          <Image
            src={item.coverImage}
            alt={title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="container-school py-10 max-w-3xl">
        {/* Back link */}
        <IntlLink
          href="/news"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600
            transition-colors mb-8"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t('backToList')}
        </IntlLink>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className={cn('badge', catColor)}>
            {t(`categories.${item.category}`)}
          </span>
          {item.publishedAt && (
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar size={14} aria-hidden="true" />
              <time dateTime={new Date(item.publishedAt).toISOString()}>
                {formatDate(item.publishedAt, locale)}
              </time>
            </span>
          )}
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <User size={14} aria-hidden="true" />
            {item.author.name}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <Eye size={14} aria-hidden="true" />
            {item.viewCount.toLocaleString()} {t('views')}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
          {title}
        </h1>

        {/* Content */}
        <div className="prose-school">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
