// src/app/[locale]/news/page.tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import NewsClient from './NewsClient'

interface NewsPageProps {
  params: { locale: string }
  searchParams: { category?: string; q?: string; page?: string }
}

export async function generateMetadata({ params: { locale } }: NewsPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'news' })
  return { title: t('title'), description: t('subtitle') }
}

async function getAnnouncements(category?: string, query?: string, page = 1) {
  const perPage = 9
  try {
    const where = {
      isPublished: true,
      ...(category && category !== 'all' ? { category: category as any } : {}),
      ...(query ? {
        OR: [
          { titleZh: { contains: query, mode: 'insensitive' as const } },
          { titleEn: { contains: query, mode: 'insensitive' as const } },
          { summaryZh: { contains: query, mode: 'insensitive' as const } },
          { summaryEn: { contains: query, mode: 'insensitive' as const } },
        ],
      } : {}),
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true, slug: true, titleZh: true, titleEn: true,
          summaryZh: true, summaryEn: true, category: true,
          coverImage: true, isPinned: true, publishedAt: true, viewCount: true,
          author: { select: { name: true } },
        },
      }),
      prisma.announcement.count({ where }),
    ])

    return { announcements, total, totalPages: Math.ceil(total / perPage) }
  } catch {
    // Mock data for development
    const { MOCK_NEWS } = await import('./mockData')
    return { announcements: MOCK_NEWS, total: MOCK_NEWS.length, totalPages: 1 }
  }
}

export default async function NewsPage({ params: { locale }, searchParams }: NewsPageProps) {
  const page = parseInt(searchParams.page ?? '1', 10)
  const { announcements, total, totalPages } = await getAnnouncements(
    searchParams.category,
    searchParams.q,
    page
  )

  return (
    <NewsClient
      locale={locale}
      initialAnnouncements={announcements}
      total={total}
      totalPages={totalPages}
      currentPage={page}
    />
  )
}
