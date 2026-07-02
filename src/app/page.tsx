// src/app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import StatsSection from '@/components/sections/StatsSection'
import NewsSection from '@/components/sections/NewsSection'
import AboutSection from '@/components/sections/AboutSection'
import QuickLinksSection from '@/components/sections/QuickLinksSection'
import { prisma } from '@/lib/prisma'

interface HomePageProps {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: HomePageProps): Promise<Metadata> {
  return {
    title: locale === 'zh-TW' ? '首頁' : 'Home',
  }
}

// Fetch latest announcements for homepage
async function getLatestAnnouncements(locale: string) {
  try {
    return await prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      take: 6,
      select: {
        id: true,
        slug: true,
        titleZh: true,
        titleEn: true,
        summaryZh: true,
        summaryEn: true,
        category: true,
        coverImage: true,
        isPinned: true,
        publishedAt: true,
        viewCount: true,
        author: { select: { name: true } },
      },
    })
  } catch {
    // Return empty array if DB not connected (for development)
    return []
  }
}

async function getBannerSlides() {
  try {
    return await prisma.bannerSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 5,
    })
  } catch {
    return []
  }
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  const [t, announcements, bannerSlides] = await Promise.all([
    getTranslations('home'),
    getLatestAnnouncements(locale),
    getBannerSlides(),
  ])

  return (
    <>
      <HeroSection locale={locale} banners={bannerSlides} />
      <StatsSection locale={locale} />
      <NewsSection locale={locale} announcements={announcements} />
      <AboutSection locale={locale} />
      <QuickLinksSection locale={locale} />
    </>
  )
}
