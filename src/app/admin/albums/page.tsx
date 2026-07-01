// src/app/admin/albums/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { formatDate, cn } from '@/lib/utils'
import { Plus, Edit, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'
import DeleteAlbumButton from './DeleteAlbumButton'

export const metadata: Metadata = { title: '相簿管理' }

async function getAlbums() {
  try {
    return await prisma.album.findMany({
      orderBy: [{ eventDate: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: { select: { name: true } },
        _count: { select: { photos: true } },
      },
    })
  } catch {
    return []
  }
}

export default async function AdminAlbumsPage() {
  const albums = await getAlbums()

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">相簿管理</h1>
        <Link href="/admin/albums/new" className="btn-primary text-sm gap-1.5">
          <Plus size={16} />
          新增相簿
        </Link>
      </div>

      {albums.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 text-sm">尚無相簿，點選右上角新增</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {albums.map((album) => (
            <div key={album.id} className="card overflow-hidden group">
              {/* Cover */}
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                {album.coverImage ? (
                  <Image
                    src={album.coverImage}
                    alt={album.titleZh}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon size={40} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Photo count badge */}
                <span className="absolute top-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                  {album._count.photos} 張
                </span>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 line-clamp-1">{album.titleZh}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{album.titleEn}</p>
                  </div>
                  <span className={cn(
                    'shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium',
                    album.isPublished
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  )}>
                    {album.isPublished ? <><Eye size={10} />已發布</> : <><EyeOff size={10} />草稿</>}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{album.eventDate ? formatDate(album.eventDate, 'zh-TW') : '未設定日期'}</span>
                  <span>{album.author?.name ?? '—'}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                  <Link
                    href={`/admin/albums/${album.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg
                      text-primary-600 hover:bg-primary-50 transition-colors font-medium"
                  >
                    <Edit size={13} />
                    編輯相簿
                  </Link>
                  <Link
                    href={`/admin/albums/${album.id}/photos`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg
                      text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                  >
                    <ImageIcon size={13} />
                    管理照片
                  </Link>
                  <DeleteAlbumButton id={album.id} title={album.titleZh} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
