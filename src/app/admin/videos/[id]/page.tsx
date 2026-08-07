import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import VideoEditor from '../VideoEditor'

export default async function EditVideoPage({ params }: { params: { id: string } }) {
  const video = await prisma.video.findUnique({ where: { id: params.id } })
  if (!video) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">編輯影片</h1>
      <VideoEditor
        mode="edit"
        initialData={{
          id: video.id,
          titleZh: video.titleZh,
          titleEn: video.titleEn,
          descZh: video.descZh ?? '',
          descEn: video.descEn ?? '',
          videoUrl: video.videoUrl,
          source: video.source,
          isPublished: video.isPublished,
        }}
      />
    </div>
  )
}
