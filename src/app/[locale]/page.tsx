import { useTranslations } from 'next-intl'
import { prisma } from '@/lib/prisma'
import HeroSection from '@/components/sections/HeroSection'
import StatsSection from '@/components/sections/StatsSection'
import NewsSection from '@/components/sections/NewsSection'
import AboutSection from '@/components/sections/AboutSection'
import QuickLinksSection from '@/components/sections/QuickLinksSection'
import SocialSection from '@/components/sections/SocialSection'
import CoolEnglishSection from '@/components/sections/CoolEnglishSection'

async function getData() {
  try {
    const [announcements, banners, teacherCount, settingsRows] = await Promise.all([
      prisma.announcement.findMany({
        where: { isPublished: true },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        take: 6,
      }),
      prisma.bannerSlide.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.teacher.count({ where: { isActive: true } }),
      prisma.siteSetting.findMany(),
    ])
    const settings = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]))
    return { announcements, banners, teacherCount, settings }
  } catch {
    return {
      announcements: [
        { id: '1', slug: 'welcome', titleZh: '歡迎蒞臨基隆市英語資源中心', titleEn: 'Welcome to Keelung City English Resource Center', category: 'NEWS', isPinned: true, publishedAt: new Date(), createdAt: new Date() },
      ],
      banners: [],
      teacherCount: 0,
      settings: {} as Record<string, string>,
    }
  }
}

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const { announcements, banners, teacherCount, settings } = await getData()
  return (
    <>
      <HeroSection locale={locale} banners={banners} />
      <StatsSection locale={locale} teachersCount={teacherCount > 0 ? teacherCount : 30} />
      <NewsSection locale={locale} announcements={announcements as any} />
      <AboutSection locale={locale} />
      <QuickLinksSection locale={locale} />
      <SocialSection locale={locale} facebookUrl={settings.facebook_url} instagramUrl={settings.instagram_url} youtubeUrl={settings.youtube_url} lineUrl={settings.line_url} />
      <CoolEnglishSection locale={locale} coolEnglishUrl={settings.cool_english_url} />
    </>
  )
}