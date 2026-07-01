// src/app/[locale]/videos/page.tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { prisma } from '@/lib/prisma'
import { extractYoutubeId, youtubeThumbnail, formatDate } from '@/lib/utils'
import { Link as IntlLink } from '@/i18n/routing'
import { Play, Eye } from 'lucide-react'

interface Props { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'videos' })
  return { title: t('title'), description: t('subtitle') }
}

const MOCK_VIDEOS = [
  { id: '1', slug: 'opening-ceremony-2024', titleZh: '2024開學典禮精彩回顧', titleEn: '2024 Opening Ceremony Highlights', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', source: 'YOUTUBE', viewCount: 523, publishedAt: new Date('2024-09-05') },
  { id: '2', slug: 'english-camp-2024',     titleZh: '2024英語夏令營紀錄片', titleEn: '2024 English Camp Documentary',  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', source: 'YOUTUBE', viewCount: 318, publishedAt: new Date('2024-07-20') },
  { id: '3', slug: 'art-showcase-2024',     titleZh: '2024藝術展演精彩集錦', titleEn: '2024 Art Showcase Highlights',   videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', source: 'YOUTUBE', viewCount: 241, publishedAt: new Date('2024-06-10') },
  { id: '4', slug: 'sports-day-2024',       titleZh: '2024運動會精彩瞬間',   titleEn: '2024 Sports Day Best Moments',  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', source: 'YOUTUBE', viewCount: 467, publishedAt: new Date('2024-04-25') },
  { id: '5', slug: 'graduation-2024',       titleZh: '2024屆畢業典禮全程記錄', titleEn: '2024 Graduation Full Recording', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', source: 'YOUTUBE', viewCount: 892, publishedAt: new Date('2024-06-20') },
  { id: '6', slug: 'school-intro',          titleZh: '學校介紹宣傳影片',     titleEn: 'School Introduction Video',     videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', source: 'YOUTUBE', viewCount: 1204, publishedAt: new Date('2024-01-15') },
]

async function getVideos() {
  try {
    return await prisma.video.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    })
  } catch {
    return MOCK_VIDEOS
  }
}

export default async function VideosPage({ params: { locale } }: Props) {
  const [t, videos] = await Promise.all([
    getTranslations({ locale, namespace: 'videos' }),
    getVideos(),
  ])
  const isZh = locale === 'zh-TW'

  return (
    <div className="pt-20 min-h-screen">
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white py-16">
        <div className="container-school text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-white/80 text-lg">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container-school py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(videos as typeof MOCK_VIDEOS).map((video) => {
            const ytId = extractYoutubeId(video.videoUrl)
            const thumb = ytId ? youtubeThumbnail(ytId, 'hq') : undefined
            const title = isZh ? video.titleZh : video.titleEn

            return (
              <article key={video.id} className="card group overflow-hidden">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-800" />
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play size={24} className="text-primary-600 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {title}
                    </a>
                  </h2>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    {video.publishedAt && (
                      <time dateTime={new Date(video.publishedAt).toISOString()}>
                        {formatDate(video.publishedAt, locale)}
                      </time>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {video.viewCount.toLocaleString()} {t('views')}
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
