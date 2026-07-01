import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AnnouncementEditor from '../AnnouncementEditor'

async function getAnnouncement(slug: string) {
  try { return await prisma.announcement.findUnique({ where: { slug } }) } catch { return null }
}

export default async function EditAnnouncementPage({ params }: { params: { slug: string } }) {
  const announcement = await getAnnouncement(params.slug)
  if (!announcement) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">編輯公告</h1>
      <AnnouncementEditor initialData={announcement as any} />
    </div>
  )
}
