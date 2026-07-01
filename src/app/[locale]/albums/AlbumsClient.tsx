'use client'

// src/app/[locale]/albums/AlbumsClient.tsx
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Calendar, ArrowRight } from 'lucide-react'
import { Link as IntlLink } from '@/i18n/routing'
import { formatDate } from '@/lib/utils'

interface Album {
  id: string; slug: string; titleZh: string; titleEn: string
  descZh?: string | null; descEn?: string | null; coverImage?: string | null
  eventDate?: Date | null; _count: { photos: number }
}

interface AlbumsClientProps { locale: string; albums: Album[] }

export default function AlbumsClient({ locale, albums }: AlbumsClientProps) {
  const t = useTranslations('albums')
  const isZh = locale === 'zh-TW'

  return (
    <div className="pt-20 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white py-16">
        <div className="container-school text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-white/80 text-lg">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container-school py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album, i) => {
            const title = isZh ? album.titleZh : album.titleEn
            const desc  = isZh ? album.descZh  : album.descEn

            return (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <IntlLink
                  href={`/albums/${album.slug}` as '/'}
                  className="card group block overflow-hidden"
                >
                  {/* Cover image */}
                  <div className="relative h-52 overflow-hidden bg-gray-100">
                    {album.coverImage ? (
                      <Image
                        src={album.coverImage}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon size={40} className="text-gray-300" />
                      </div>
                    )}
                    {/* Photo count badge */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5
                      bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                      <ImageIcon size={12} aria-hidden="true" />
                      {album._count.photos} {t('photos')}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    {album.eventDate && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                        <Calendar size={12} aria-hidden="true" />
                        <time dateTime={new Date(album.eventDate).toISOString()}>
                          {formatDate(album.eventDate, locale)}
                        </time>
                      </div>
                    )}
                    <h2 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {title}
                    </h2>
                    {desc && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{desc}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm text-primary-600 font-medium">
                      {t('viewAlbum')}
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                    </span>
                  </div>
                </IntlLink>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
