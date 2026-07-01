// src/app/admin/announcements/[id]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AnnouncementEditor from '../AnnouncementEditor'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: '編輯公告' }

async function getAnnouncement(id: string) {
  try {
    return await prisma.announcement.findUnique({ where: { id } })
  } catch {
    return null
  }
}

export default async function EditAnnouncementPage({ params }: Props) {
  const item = await getAnnouncement(params.id)
  if (!item) notFound()

  return (
    <AnnouncementEditor
      mode="edit"
      initialData={{
        id: item.id,
        slug: item.slug,
        titleZh: item.titleZh,
        titleEn: item.titleEn,
        summaryZh: item.summaryZh ?? '',
        summaryEn: item.summaryEn ?? '',
        contentZh: item.contentZh,
        contentEn: item.contentEn,
        category: item.category,
        coverImage: item.coverImage ?? '',
        isPinned: item.isPinned,
        isPublished: item.isPublished,
      }}
    />
  )
}
