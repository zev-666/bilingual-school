import { useTranslations } from 'next-intl'
import { prisma } from '@/lib/prisma'
import { Play } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getVideos() {
  try {
    return await prisma.video.findMany({ where: { isPublished: true }, orderBy: { publishedAt: 'desc' } })
  } catch {
    return [{ id: '1', titleZh: '範例影片', titleEn: 'Sample Video', embedId: 'dQw4w9WgXcQ', source: 'YOUTUBE', thumbnail: null }]
  }
}

export default async function VideosPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('videos')
  const videos = await getVideos()

  return (
    <div className="section-padding">
      <div className="container-school">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v: any) => (
            <div key={v.id} className="card overflow-hidden">
              <div className="relative h-48 bg-gray-900">
                {v.source === 'YOUTUBE' && v.embedId
                  ? <img src={`https://img.youtube.com/vi/${v.embedId}/hqdefault.jpg`} alt="" className="w-full h-full object-cover opacity-80" />
                  : <div className="w-full h-full flex items-center justify-center"><Play size={40} className="text-white" /></div>}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                    <Play size={20} className="text-primary-600 ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">
                  {locale === 'zh-TW' ? v.titleZh : v.titleEn}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
