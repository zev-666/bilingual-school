import { useTranslations } from 'next-intl'
import { prisma } from '@/lib/prisma'
import { Image } from 'lucide-react'

async function getAlbums() {
  try {
    return await prisma.album.findMany({
      where: { isPublished: true },
      include: { _count: { select: { photos: true } } },
      orderBy: { publishedAt: 'desc' },
    })
  } catch {
    return [{ id: '1', slug: 'sample', titleZh: '範例相簿', titleEn: 'Sample Album', coverImage: null, _count: { photos: 0 } }]
  }
}

export default async function AlbumsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('albums')
  const albums = await getAlbums()

  return (
    <div className="section-padding">
      <div className="container-school">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album: any) => (
            <div key={album.id} className="card overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                {album.coverImage
                  ? <img src={album.coverImage} alt="" className="w-full h-full object-cover" />
                  : <Image size={40} className="text-primary-400" />}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {locale === 'zh-TW' ? album.titleZh : album.titleEn}
                </h3>
                <p className="text-sm text-gray-500">{album._count.photos} {t('photos')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
