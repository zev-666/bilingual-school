// src/app/admin/announcements/[id]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AnnouncementEditor from '../AnnouncementEditor'

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: '編輯公告' }

// 編輯頁網址用 id；舊的列表連結曾經用 slug（導致按「編輯」出現 404），
// 為了相容舊書籤，找不到 id 時再用 slug 找一次。
async function getAnnouncement(idOrSlug: string) {
  try {
    const key = decodeURIComponent(idOrSlug)
    return await prisma.announcement.findFirst({ where: { OR: [{ id: key }, { slug: key }] } })
  } catch {
    return null
  }
}

export default async function EditAnnouncementPage(props: Props) {
  const params = await props.params;
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
