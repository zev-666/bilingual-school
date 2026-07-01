import { useTranslations } from 'next-intl'
import { prisma } from '@/lib/prisma'
import HeroSection from '@/components/sections/HeroSection'
import StatsSection from '@/components/sections/StatsSection'
import NewsSection from '@/components/sections/NewsSection'
import AboutSection from '@/components/sections/AboutSection'
import QuickLinksSection from '@/components/sections/QuickLinksSection'

async function getData() {
  try {
    const [announcements, banners] = await Promise.all([
      prisma.announcement.findMany({
        where: { isPublished: true },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        take: 6,
      }),
      prisma.bannerSlide.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ])
    return { announcements, banners }
  } catch {
    return {
      announcements: [
        { id: '1', slug: 'welcome', titleZh: '歡迎蒞臨雙語實驗學校', titleEn: 'Welcome to Bilingual School', category: 'NEWS', isPinned: true, publishedAt: new Date(), createdAt: new Date() },
      ],
      banners: [],
    }
  }
}

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const { announcements, banners } = await getData()

  return (
    <>
      <HeroSection locale={locale} banners={banners} />
      <StatsSection locale={locale} />
      <NewsSection locale={locale} announcements={announcements as any} />
      <AboutSection locale={locale} />
      <QuickLinksSection locale={locale} />
    </>
  )
}
