// src/app/admin/albums/[id]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AlbumEditor from '../AlbumEditor'

export const metadata: Metadata = { title: '編輯相簿' }

interface Props { params: { id: string } }

async function getAlbum(id: string) {
  try {
    return await prisma.album.findUnique({ where: { id } })
  } catch {
    return null
  }
}

export default async function EditAlbumPage({ params }: Props) {
  const album = await getAlbum(params.id)
  if (!album) notFound()

  return (
    <AlbumEditor
      mode="edit"
      initialData={{
        id:          album.id,
        titleZh:     album.titleZh,
        titleEn:     album.titleEn,
        descZh:      album.descZh ?? '',
        descEn:      album.descEn ?? '',
        coverImage:  album.coverImage ?? '',
        eventDate:   album.eventDate
          ? album.eventDate.toISOString().split('T')[0]
          : '',
        isPublished: album.isPublished,
      }}
    />
  )
}
