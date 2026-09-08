import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { prisma } from '@/lib/prisma'
import { formatDate, displayTitle } from '@/lib/utils'
import { ArrowLeft, Play } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getVideo(slug: string) {
  try {
    return await prisma.video.findUnique({ where: { slug, isPublished: true } })
  } catch {
    return null
  }
}

export default async function VideoDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string }
}) {
  const t = await getTranslations('videos')
  const video = await getVideo(slug)
  if (!video) notFound()

  const title = displayTitle(video.titleZh, video.titleEn, locale)
  const desc = locale === 'zh-TW' ? video.descZh : video.descEn

  return (
    <div className="section-padding">
      <div className="container-school max-w-4xl">
        <Link href="/videos" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-8">
          <ArrowLeft size={16} /> {t('back')}
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {video.publishedAt && (
          <p className="text-sm text-gray-500 mb-6">{formatDate(video.publishedAt, locale)}</p>
        )}

        {video.source === 'YOUTUBE' && video.embedId ? (
          <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6">
            <iframe
              src={`https://www.youtube.com/embed/${video.embedId}`}
              title={title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex items-center justify-center py-20 bg-gray-100 rounded-lg mb-6">
            <Play size={40} className="text-gray-300" />
          </div>
        )}

        {desc && (
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{desc}</p>
        )}
      </div>
    </div>
  )
}