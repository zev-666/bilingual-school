'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface VideoItem {
  id: string
  titleZh: string
  titleEn: string
  embedId: string | null
  isPublished: boolean
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/videos?admin=true&perPage=100')
    const json = await res.json()
    setVideos(json.data?.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這支影片嗎？')) return
    await fetch(`/api/videos/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">影片管理</h1>
        <Link href="/admin/videos/new" className="btn-primary">新增影片</Link>
      </div>

      {loading ? (
        <p className="text-gray-500">載入中...</p>
      ) : videos.length === 0 ? (
        <p className="text-gray-500">目前沒有影片，點右上角新增第一支。</p>
      ) : (
        <div className="card divide-y divide-gray-100">
          {videos.map(v => (
            <div key={v.id} className="flex items-center gap-4 p-4">
              <div className="w-24 h-16 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                {v.embedId && (
                  <img src={`https://img.youtube.com/vi/${v.embedId}/hqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{v.titleZh}</p>
                <p className="text-sm text-gray-500 truncate">{v.titleEn}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${v.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {v.isPublished ? '已發布' : '草稿'}
              </span>
              <Link href={`/admin/videos/${v.id}`} className="btn-ghost text-sm">編輯</Link>
              <button onClick={() => handleDelete(v.id)} className="text-sm text-red-600 hover:underline">刪除</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
