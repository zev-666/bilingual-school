import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAlbum(slug: string) {
  try {
    return await prisma.album.findUnique({
      where: { slug, isPublished: true },
      include: {
        photos: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
  } catch {
    return null
  }
}

export default async function AlbumDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string }
}) {
  const t = await getTranslations('albums')
  const album = await getAlbum(slug)
  if (!album) notFound()

  const title = locale === 'zh-TW' ? album.titleZh : album.titleEn
  const desc = locale === 'zh-TW' ? album.descZh : album.descEn

  return (
    <div className="section-padding">
      <div className="container-school">
        <Link href="/albums" className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-8">
          <ArrowLeft size={16} /> {t('back')}
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {album.eventDate && (
          <p className="text-sm text-gray-400 mb-2">{formatDate(album.eventDate, locale)}</p>
        )}
        {desc && <p className="text-gray-600 mb-4 leading-relaxed">{desc}</p>}
        <p className="text-sm text-gray-500 mb-8">
          {album.photos.length} {t('photos')}
        </p>

        {album.photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ImageIcon size={40} className="mb-3" />
            <p>{t('no_albums')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {album.photos.map((photo) => {
              const caption = locale === 'zh-TW' ? photo.captionZh : photo.captionEn
              return (
                <div key={photo.id} className="card overflow-hidden group">
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={photo.thumbnail || photo.url}
                      alt={caption || title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {caption && (
                    <p className="px-2 py-2 text-xs text-gray-500 line-clamp-2">{caption}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
