// src/app/[locale]/page.tsx
// 首頁 = 長條式整合版面（對應 design-preview.html 的全新設計系統）。
// 資料一律從資料庫取，失敗時回傳安全預設值（沿用專案既有慣例）。

import { prisma } from '@/lib/prisma'
import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'
import NewsSection from '@/components/sections/NewsSection'
import QuickLinksSection from '@/components/sections/QuickLinksSection'
import CoolEnglishSection from '@/components/sections/CoolEnglishSection'
import TeamSection from '@/components/sections/TeamSection'
import SocialSection from '@/components/sections/SocialSection'

export const revalidate = 300

interface AnnouncementRow {
  id: string
  slug: string
  titleZh: string
  titleEn: string
  category: string
  isPinned: boolean
  publishedAt: Date | null
  createdAt: Date
}

async function getHomeData() {
  try {
    const settingsKeys = [
      'facebook_url',
      'instagram_url',
      'youtube_url',
      'line_url',
      'cool_english_url',
    ] as const

    const [announcements, settingsRows] = await Promise.all([
      prisma.announcement.findMany({
        where: { isPublished: true },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        take: 6,
        select: {
          id: true,
          slug: true,
          titleZh: true,
          titleEn: true,
          category: true,
          isPinned: true,
          publishedAt: true,
          createdAt: true,
        },
      }),
      prisma.siteSetting.findMany({
        where: { key: { in: Array.from(settingsKeys) } },
      }),
    ])

    const settings: Record<string, string> = {}
    for (const row of settingsRows) {
      if (row.value) settings[row.key] = row.value
    }

    return {
      announcements: announcements as AnnouncementRow[],
      facebookUrl: settings.facebook_url ?? '',
      instagramUrl: settings.instagram_url ?? '',
      youtubeUrl: settings.youtube_url ?? '',
      lineUrl: settings.line_url ?? '',
      coolEnglishUrl: settings.cool_english_url ?? '',
    }
  } catch {
    return {
      announcements: [],
      facebookUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      lineUrl: '',
      coolEnglishUrl: '',
    }
  }
}

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const { announcements, facebookUrl, instagramUrl, youtubeUrl, lineUrl, coolEnglishUrl } = await getHomeData()

  return (
    <>
      <HeroSection locale={locale} banners={[]} />
      <AboutSection locale={locale} />
      <NewsSection locale={locale} announcements={announcements} />
      <QuickLinksSection locale={locale} />
      <CoolEnglishSection locale={locale} coolEnglishUrl={coolEnglishUrl} />
      <TeamSection locale={locale} />
      <SocialSection
        locale={locale}
        facebookUrl={facebookUrl}
        instagramUrl={instagramUrl}
        youtubeUrl={youtubeUrl}
        lineUrl={lineUrl}
      />
    </>
  )
}