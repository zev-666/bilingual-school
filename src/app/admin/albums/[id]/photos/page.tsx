// src/app/admin/albums/[id]/photos/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import PhotoManager from './PhotoManager'

export const metadata: Metadata = { title: '管理照片' }

interface Props { params: { id: string } }

async function getAlbumWithPhotos(id: string) {
  try {
    return await prisma.album.findUnique({
      where: { id },
      include: { photos: { orderBy: { sortOrder: 'asc' } } },
    })
  } catch {
    return null
  }
}

export default async function AlbumPhotosPage({ params }: Props) {
  const album = await getAlbumWithPhotos(params.id)
  if (!album) notFound()

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/albums" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">管理照片</h1>
          <p className="text-sm text-gray-500 mt-0.5">{album.titleZh}</p>
        </div>
      </div>

      <PhotoManager albumId={album.id} initialPhotos={album.photos} />
    </div>
  )
}
